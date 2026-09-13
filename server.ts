import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface ProcessedFlight {
  id: string;
  callsign: string;
  originCountry: string;
  registration?: string;
  aircraftTypeCode?: string;
  lat: number;
  lon: number;
  targetLat: number;
  targetLon: number;
  altitudeMeters: number;
  altitudeFeet: number;
  velocityKmh: number;
  velocityKnots: number;
  heading: number;
  verticalRate: number;
  isGround: boolean;
  squawk?: string;
  lastSeen: number;
}

const app = express();
const PORT = 3000;

// Active flights map (ICAO -> Flight)
const activeFlightsMap: Map<string, ProcessedFlight> = new Map();
let isLiveRadarActive = false;
let lastFetchTime = 0;

// Fetch Live Flight Data from ADSB.lol + FlightRadar24 concurrently
async function fetchLiveFlightData() {
  const now = Date.now();
  if (now - lastFetchTime < 2000) return;
  lastFetchTime = now;

  let foundCount = 0;

  // Run both fetch requests in parallel
  const [adsbRes, fr24Res] = await Promise.allSettled([
    // 1. ADSB.lol (25 Nautical Miles radius ~46km around Wintersweiler 47.6741, 7.5679)
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://api.adsb.lol/v2/lat/47.6741/lon/7.5679/dist/25", {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DreilanderRadar/1.0",
          "Accept": "application/json",
        },
      });
      clearTimeout(timeout);
      return res.ok ? await res.json() : null;
    })(),

    // 2. FlightRadar24 (Wide EuroAirport Basel + Dreiländereck bounding box)
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=47.95,47.40,7.15,7.95", {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
      clearTimeout(timeout);
      return res.ok ? await res.json() : null;
    })(),
  ]);

  // Process ADSB.lol
  if (adsbRes.status === "fulfilled" && adsbRes.value?.ac && Array.isArray(adsbRes.value.ac)) {
    adsbRes.value.ac.forEach((ac: any) => {
      if (!ac.lat || !ac.lon) return;

      // 42km radius check around Wintersweiler (47.6741, 7.5679)
      const distKm = Math.hypot((ac.lat - 47.6741) * 111, (ac.lon - 7.5679) * 75);
      if (distKm > 42) return;

      const id = (ac.hex || "").trim().toLowerCase();
      if (!id) return;

      foundCount++;
      const rawCallsign = (ac.flight || "").trim();
      const callsign = rawCallsign || ac.r || id.toUpperCase();
      
      const isGround = ac.alt_baro === "ground" || (typeof ac.alt_baro === "number" && ac.alt_baro < 100) || (ac.gs ?? 0) < 25;
      const altFeet = isGround ? 0 : Math.round(typeof ac.alt_baro === "number" ? ac.alt_baro : (ac.alt_geom ?? 0));
      const altMeters = Math.round(altFeet * 0.3048);
      const knots = Math.round(ac.gs ?? 0);
      const kmh = Math.round(knots * 1.852);
      const heading = Math.round(ac.track ?? ac.true_heading ?? ac.mag_heading ?? 0);
      const vRateFpm = ac.baro_rate ?? ac.geom_rate ?? 0;
      const verticalRate = isGround ? 0 : Math.round((vRateFpm / 196.85) * 10) / 10;
      const squawk = ac.squawk ? String(ac.squawk) : undefined;
      const reg = ac.r || undefined;
      const typeCode = ac.t || undefined;

      let country = "Schweiz / Europa";
      if (reg?.startsWith("D-") || callsign.startsWith("D-")) country = "Germany";
      if (reg?.startsWith("HB-") || callsign.startsWith("HB-")) country = "Switzerland";
      if (reg?.startsWith("F-") || callsign.startsWith("F-")) country = "France";
      if (reg?.startsWith("G-") || callsign.startsWith("G-")) country = "United Kingdom";
      if (reg?.startsWith("N") || callsign.startsWith("N")) country = "United States";

      const existing = activeFlightsMap.get(id);
      if (!existing) {
        activeFlightsMap.set(id, {
          id,
          callsign,
          originCountry: country,
          registration: reg,
          aircraftTypeCode: typeCode,
          lat: ac.lat,
          lon: ac.lon,
          targetLat: ac.lat,
          targetLon: ac.lon,
          altitudeMeters: altMeters,
          altitudeFeet: altFeet,
          velocityKmh: kmh,
          velocityKnots: knots,
          heading,
          verticalRate,
          isGround,
          squawk,
          lastSeen: now,
        });
      } else {
        existing.lat = ac.lat;
        existing.lon = ac.lon;
        existing.targetLat = ac.lat;
        existing.targetLon = ac.lon;
        existing.callsign = callsign || existing.callsign;
        existing.registration = reg || existing.registration;
        existing.aircraftTypeCode = typeCode || existing.aircraftTypeCode;
        existing.altitudeMeters = altMeters;
        existing.altitudeFeet = altFeet;
        existing.velocityKmh = kmh;
        existing.velocityKnots = knots;
        existing.heading = heading;
        existing.verticalRate = verticalRate;
        existing.isGround = isGround;
        existing.squawk = squawk || existing.squawk;
        existing.lastSeen = now;
      }
    });
  }

  // Process FlightRadar24 (captures EuroAirport ground aircraft not picked up by ADSB receivers)
  if (fr24Res.status === "fulfilled" && fr24Res.value) {
    const data = fr24Res.value;
    Object.keys(data).forEach((key) => {
      if (key === "full_count" || key === "version") return;
      const item = data[key];
      if (Array.isArray(item) && item.length >= 10) {
        const id = (item[0] || key).toLowerCase();
        const lat = item[1];
        const lon = item[2];
        if (!lat || !lon) return;

        // 42km radius check around Wintersweiler (47.6741, 7.5679)
        const distKm = Math.hypot((lat - 47.6741) * 111, (lon - 7.5679) * 75);
        if (distKm > 42) return;

        const heading = item[3] || 0;
        const altFeetRaw = item[4] || 0;
        const knots = item[5] || 0;
        const isGround = altFeetRaw < 100 || knots < 25;
        const altFeet = isGround ? 0 : altFeetRaw;
        const altMeters = Math.round(altFeet * 0.3048);
        const kmh = Math.round(knots * 1.852);
        const squawk = item[6] || undefined;
        const typeCode = item[8] || undefined;
        const reg = item[9] || undefined;
        const rawCs = (item[16] || item[13] || "").trim();
        const callsign = rawCs || reg || id.toUpperCase();

        let country = "Schweiz / Europa";
        if (reg?.startsWith("D-") || callsign.startsWith("D-")) country = "Germany";
        if (reg?.startsWith("HB-") || callsign.startsWith("HB-")) country = "Switzerland";
        if (reg?.startsWith("F-") || callsign.startsWith("F-")) country = "France";
        if (reg?.startsWith("G-") || callsign.startsWith("G-")) country = "United Kingdom";
        if (reg?.startsWith("N") || callsign.startsWith("N")) country = "United States";

        const existing = activeFlightsMap.get(id);
        if (!existing) {
          foundCount++;
          activeFlightsMap.set(id, {
            id,
            callsign,
            originCountry: country,
            registration: reg,
            aircraftTypeCode: typeCode,
            lat,
            lon,
            targetLat: lat,
            targetLon: lon,
            altitudeMeters: altMeters,
            altitudeFeet: altFeet,
            velocityKmh: kmh,
            velocityKnots: knots,
            heading,
            verticalRate: 0,
            isGround,
            squawk,
            lastSeen: now,
          });
        } else {
          existing.lat = lat;
          existing.lon = lon;
          existing.targetLat = lat;
          existing.targetLon = lon;
          if (isGround) existing.isGround = true;
          if (!existing.registration && reg) existing.registration = reg;
          if (!existing.aircraftTypeCode && typeCode) existing.aircraftTypeCode = typeCode;
          if (callsign && callsign !== id.toUpperCase()) existing.callsign = callsign;
          existing.lastSeen = now;
        }
      }
    });
  }

  isLiveRadarActive = activeFlightsMap.size > 0;

  // Cleanup flights not seen in past 45 seconds (gives ample headroom during network jitter)
  activeFlightsMap.forEach((flight, flightId) => {
    if (now - flight.lastSeen > 45000) {
      activeFlightsMap.delete(flightId);
    }
  });
}

// Initial fetch on server start & recurring background radar polling
fetchLiveFlightData();
setInterval(fetchLiveFlightData, 2500);

// API Endpoint for Active Live Flights
app.get(["/api/flights", "/api/flights/*"], async (req, res) => {
  if (activeFlightsMap.size === 0) {
    await fetchLiveFlightData();
  }
  const flightsList = Array.from(activeFlightsMap.values());
  return res.json({
    flights: flightsList,
    time: Date.now(),
    isLiveRadar: isLiveRadarActive,
    count: flightsList.length,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
