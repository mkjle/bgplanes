interface ProcessedFlight {
  id: string;
  callsign: string;
  originCountry: string;
  registration?: string;
  aircraftTypeCode?: string;
  lat: number;
  lon: number;
  altitudeMeters: number;
  altitudeFeet: number;
  velocityKmh: number;
  velocityKnots: number;
  heading: number;
  verticalRate: number;
  isGround: boolean;
  squawk?: string;
  lastUpdated: number;
}

const CENTER_LAT = 47.6741; // Wintersweiler
const CENTER_LON = 7.5679;
const MAX_RADIUS_KM = 42;

function calculateDistanceKm(lat: number, lon: number): number {
  return Math.hypot((lat - CENTER_LAT) * 111, (lon - CENTER_LON) * 75);
}

export async function fetchLiveFlights(): Promise<ProcessedFlight[]> {
  const flightsMap = new Map<string, ProcessedFlight>();
  const now = Date.now();

  const [fr24Res, adsbRes] = await Promise.allSettled([
    // FlightRadar24 feed
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=47.95,47.40,7.15,7.95", {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DreilanderRadar/1.0" },
      });
      clearTimeout(timeout);
      return res.ok ? await res.json() : null;
    })(),

    // ADSB.lol feed
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
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
  ]);

  // Process FR24
  if (fr24Res.status === "fulfilled" && fr24Res.value) {
    const data = fr24Res.value;
    Object.keys(data).forEach((key) => {
      if (key === "full_count" || key === "version") return;
      const item = data[key];
      if (Array.isArray(item) && item.length >= 10) {
        const lat = item[1];
        const lon = item[2];
        if (typeof lat !== "number" || typeof lon !== "number") return;
        if (calculateDistanceKm(lat, lon) > MAX_RADIUS_KM) return;

        const id = String(item[0] || key).toLowerCase().trim();
        if (!id) return;

        const heading = typeof item[3] === "number" ? Math.round(item[3]) : 0;
        const altFeetRaw = typeof item[4] === "number" ? Math.round(item[4]) : 0;
        const knots = typeof item[5] === "number" ? Math.round(item[5]) : 0;
        const isGround = altFeetRaw < 100 || knots < 25;
        const altFeet = isGround ? 0 : altFeetRaw;
        const altMeters = Math.round(altFeet * 0.3048);
        const kmh = Math.round(knots * 1.852);
        const squawk = item[6] ? String(item[6]) : undefined;
        const typeCode = item[8] ? String(item[8]) : undefined;
        const reg = item[9] ? String(item[9]) : undefined;
        const rawCs = String(item[16] || item[13] || "").trim();
        const callsign = rawCs || reg || id.toUpperCase();
        const vRateFpm = typeof item[15] === "number" ? item[15] : 0;
        const verticalRate = isGround ? 0 : Math.round((vRateFpm / 196.85) * 10) / 10;

        let country = "Schweiz / Europa";
        if (reg?.startsWith("D-") || callsign.startsWith("D-")) country = "Germany";
        if (reg?.startsWith("HB-") || callsign.startsWith("HB-")) country = "Switzerland";
        if (reg?.startsWith("F-") || callsign.startsWith("F-")) country = "France";
        if (reg?.startsWith("G-") || callsign.startsWith("G-")) country = "United Kingdom";
        if (reg?.startsWith("N") || callsign.startsWith("N")) country = "United States";

        flightsMap.set(id, {
          id,
          callsign,
          originCountry: country,
          registration: reg,
          aircraftTypeCode: typeCode,
          lat,
          lon,
          altitudeMeters: altMeters,
          altitudeFeet: altFeet,
          velocityKmh: kmh,
          velocityKnots: knots,
          heading,
          verticalRate,
          isGround,
          squawk,
          lastUpdated: now,
        });
      }
    });
  }

  // Process ADSB.lol
  if (adsbRes.status === "fulfilled" && adsbRes.value?.ac && Array.isArray(adsbRes.value.ac)) {
    adsbRes.value.ac.forEach((ac: any) => {
      if (typeof ac.lat !== "number" || typeof ac.lon !== "number") return;
      if (calculateDistanceKm(ac.lat, ac.lon) > MAX_RADIUS_KM) return;

      const id = String(ac.hex || "").toLowerCase().trim();
      if (!id) return;

      const knots = Math.round(ac.gs ?? 0);
      const kmh = Math.round(knots * 1.852);
      const isGround = ac.alt_baro === "ground" || (typeof ac.alt_baro === "number" && ac.alt_baro < 100) || knots < 25;
      const altFeet = isGround ? 0 : Math.round(typeof ac.alt_baro === "number" ? ac.alt_baro : (ac.alt_geom ?? 0));
      const altMeters = Math.round(altFeet * 0.3048);
      const rawCs = (ac.flight || "").toString().trim();
      const reg = ac.r ? ac.r.toString().trim() : undefined;
      const callsign = rawCs || reg || id.toUpperCase();
      const heading = Math.round(ac.track ?? ac.true_heading ?? ac.mag_heading ?? 0);
      const vRateFpm = ac.baro_rate ?? ac.geom_rate ?? 0;
      const verticalRate = isGround ? 0 : Math.round((vRateFpm / 196.85) * 10) / 10;
      const squawk = ac.squawk ? String(ac.squawk) : undefined;
      const typeCode = ac.t ? String(ac.t) : undefined;

      let country = "Schweiz / Europa";
      if (reg?.startsWith("D-") || callsign.startsWith("D-")) country = "Germany";
      if (reg?.startsWith("HB-") || callsign.startsWith("HB-")) country = "Switzerland";
      if (reg?.startsWith("F-") || callsign.startsWith("F-")) country = "France";
      if (reg?.startsWith("G-") || callsign.startsWith("G-")) country = "United Kingdom";
      if (reg?.startsWith("N") || callsign.startsWith("N")) country = "United States";

      const existing = flightsMap.get(id);
      if (!existing) {
        flightsMap.set(id, {
          id,
          callsign,
          originCountry: country,
          registration: reg,
          aircraftTypeCode: typeCode,
          lat: ac.lat,
          lon: ac.lon,
          altitudeMeters: altMeters,
          altitudeFeet: altFeet,
          velocityKmh: kmh,
          velocityKnots: knots,
          heading,
          verticalRate,
          isGround,
          squawk,
          lastUpdated: now,
        });
      } else {
        existing.lat = ac.lat;
        existing.lon = ac.lon;
        existing.altitudeMeters = altMeters;
        existing.altitudeFeet = altFeet;
        existing.velocityKmh = kmh;
        existing.velocityKnots = knots;
        existing.heading = heading;
        existing.verticalRate = verticalRate;
        existing.isGround = isGround;
        if (reg && !existing.registration) existing.registration = reg;
        if (typeCode && !existing.aircraftTypeCode) existing.aircraftTypeCode = typeCode;
        if (callsign && callsign !== id.toUpperCase()) existing.callsign = callsign;
        existing.lastUpdated = now;
      }
    });
  }

  return Array.from(flightsMap.values());
}

// Netlify v1 Lambda Handler
export async function handler() {
  try {
    const flights = await fetchLiveFlights();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=1, stale-while-revalidate=2",
      },
      body: JSON.stringify({
        flights,
        time: Date.now(),
        isLiveRadar: flights.length > 0,
        count: flights.length,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ flights: [], isLiveRadar: false, error: String(err) }),
    };
  }
}

// Netlify v2 Standard Web Response Export
export default async function () {
  try {
    const flights = await fetchLiveFlights();
    return new Response(
      JSON.stringify({
        flights,
        time: Date.now(),
        isLiveRadar: flights.length > 0,
        count: flights.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=1, stale-while-revalidate=2",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ flights: [], isLiveRadar: false, error: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
