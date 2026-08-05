import { Flight } from '../types';

// Simulated state for client-side fallback if both /api/flights and adsb.lol are unavailable
let simulatedFlights: Flight[] = [];
let lastSimulatedTime = Date.now();

const INITIAL_SIMULATED_DATA: Omit<Flight, 'lastUpdated'>[] = [
  {
    id: 'ezs48dr',
    callsign: 'EZS48DR',
    originCountry: 'Switzerland',
    registration: 'HB-JXS',
    aircraftTypeCode: 'A320',
    lat: 47.6723,
    lon: 7.5454,
    altitudeMeters: 2774,
    altitudeFeet: 9100,
    velocityKmh: 572,
    velocityKnots: 309,
    heading: 82,
    verticalRate: 11.7,
    isGround: false,
    squawk: '6734',
  },
  {
    id: 'dlh99f',
    callsign: 'DLH99F',
    originCountry: 'Germany',
    registration: 'D-AINE',
    aircraftTypeCode: 'A20N',
    lat: 47.6486,
    lon: 7.5605,
    altitudeMeters: 4500,
    altitudeFeet: 14760,
    velocityKmh: 680,
    velocityKnots: 367,
    heading: 195,
    verticalRate: -2.1,
    isGround: false,
    squawk: '1000',
  },
  {
    id: 'sxs3wy',
    callsign: 'SXS3WY',
    originCountry: 'Schweiz / Europa',
    registration: 'TC-SMU',
    aircraftTypeCode: 'B738',
    lat: 47.6236,
    lon: 7.5180,
    altitudeMeters: 518,
    altitudeFeet: 1700,
    velocityKmh: 293,
    velocityKnots: 158,
    heading: 155,
    verticalRate: -3.6,
    isGround: false,
    squawk: '3226',
  },
  {
    id: 'a955ab',
    callsign: 'N700MK',
    originCountry: 'United States',
    registration: 'N700MK',
    aircraftTypeCode: 'GLF6',
    lat: 47.7168,
    lon: 7.5130,
    altitudeMeters: 10668,
    altitudeFeet: 35000,
    velocityKmh: 950,
    velocityKnots: 512,
    heading: 112,
    verticalRate: 0,
    isGround: false,
    squawk: '2250',
  },
];

export async function fetchClientFlights(): Promise<{ flights: Flight[]; isLiveRadar: boolean }> {
  // 1. Try direct CORS fetch to ADSB.lol
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://api.adsb.lol/v2/lat/47.6741/lon/7.5679/dist/15', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.ac) && data.ac.length > 0) {
        const liveFlights: Flight[] = [];
        data.ac.forEach((ac: any) => {
          if (!ac.lat || !ac.lon) return;

          // 18km radius check around Wintersweiler (47.6741, 7.5679)
          const distKm = Math.hypot((ac.lat - 47.6741) * 111, (ac.lon - 7.5679) * 75);
          if (distKm > 18) return;

          const id = (ac.hex || '').trim().toLowerCase();
          if (!id) return;

          const knots = Math.round(ac.gs || 0);
          const kmh = Math.round(knots * 1.852);
          const altFeet = ac.alt_baro === 'ground' ? 0 : (ac.alt_baro || 0);
          const altMeters = Math.round(altFeet * 0.3048);
          const reg = ac.r || undefined;
          const rawCs = (ac.flight || '').trim();
          const callsign = rawCs || reg || id.toUpperCase();
          const isGround = ac.alt_baro === 'ground' || knots < 30;

          let country = 'Schweiz / Europa';
          if (reg?.startsWith('D-') || callsign.startsWith('D-')) country = 'Germany';
          if (reg?.startsWith('HB-') || callsign.startsWith('HB-')) country = 'Switzerland';
          if (reg?.startsWith('F-') || callsign.startsWith('F-')) country = 'France';
          if (reg?.startsWith('N') || callsign.startsWith('N')) country = 'United States';

          liveFlights.push({
            id,
            callsign,
            originCountry: country,
            registration: reg,
            aircraftTypeCode: ac.t || undefined,
            lat: ac.lat,
            lon: ac.lon,
            altitudeMeters: altMeters,
            altitudeFeet: altFeet,
            velocityKmh: kmh,
            velocityKnots: knots,
            heading: Math.round(ac.track || 0),
            verticalRate: ac.baro_rate ? Math.round((ac.baro_rate / 60) * 0.3048 * 10) / 10 : 0,
            isGround,
            squawk: ac.squawk || undefined,
            lastUpdated: Date.now(),
          });
        });

        if (liveFlights.length > 0) {
          return { flights: liveFlights, isLiveRadar: true };
        }
      }
    }
  } catch (err) {
    // CORS or network fetch failed on static client host, proceed to fallback physics simulation
  }

  // 2. Fallback Physics Simulation for static environments (e.g. Netlify)
  const now = Date.now();
  const dtSeconds = Math.min((now - lastSimulatedTime) / 1000, 5);
  lastSimulatedTime = now;

  if (simulatedFlights.length === 0) {
    simulatedFlights = INITIAL_SIMULATED_DATA.map((f) => ({ ...f, lastUpdated: now }));
  }

  // Advance simulated flight positions smoothly along heading
  simulatedFlights = simulatedFlights.map((f) => {
    const headingRad = (f.heading * Math.PI) / 180;
    const speedKmh = f.velocityKmh || 300;
    // 1 deg lat ~ 111 km, 1 deg lon ~ 75 km around 47.6° N
    const distKm = (speedKmh / 3600) * dtSeconds;

    let newLat = f.lat + (distKm * Math.cos(headingRad)) / 111;
    let newLon = f.lon + (distKm * Math.sin(headingRad)) / 75;

    // Wrap around boundaries of airspace (roughly 18km around 47.67, 7.56)
    if (newLat > 47.78) newLat = 47.56;
    if (newLat < 47.56) newLat = 47.78;
    if (newLon > 7.72) newLon = 7.42;
    if (newLon < 7.42) newLon = 7.72;

    return {
      ...f,
      lat: newLat,
      lon: newLon,
      lastUpdated: now,
    };
  });

  return { flights: simulatedFlights, isLiveRadar: false };
}
