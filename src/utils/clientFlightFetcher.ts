import { Flight } from '../types';

const CENTER_LAT = 47.6741; // Wintersweiler
const CENTER_LON = 7.5679;
const MAX_RADIUS_KM = 42;

function calculateDistanceKm(lat: number, lon: number): number {
  return Math.hypot((lat - CENTER_LAT) * 111, (lon - CENTER_LON) * 75);
}

export function parseFR24Response(data: any): Flight[] {
  if (!data || typeof data !== 'object') return [];
  const flights: Flight[] = [];
  const now = Date.now();

  Object.keys(data).forEach((key) => {
    if (key === 'full_count' || key === 'version') return;
    const item = data[key];
    if (Array.isArray(item) && item.length >= 10) {
      const lat = item[1];
      const lon = item[2];
      if (typeof lat !== 'number' || typeof lon !== 'number') return;
      if (calculateDistanceKm(lat, lon) > MAX_RADIUS_KM) return;

      const id = String(item[0] || key).toLowerCase().trim();
      if (!id) return;

      const heading = typeof item[3] === 'number' ? Math.round(item[3]) : 0;
      const altFeetRaw = typeof item[4] === 'number' ? Math.round(item[4]) : 0;
      const knots = typeof item[5] === 'number' ? Math.round(item[5]) : 0;
      const isGround = altFeetRaw < 100 || knots < 25;
      const altFeet = isGround ? 0 : altFeetRaw;
      const altMeters = Math.round(altFeet * 0.3048);
      const kmh = Math.round(knots * 1.852);
      const squawk = item[6] ? String(item[6]) : undefined;
      const typeCode = item[8] ? String(item[8]) : undefined;
      const reg = item[9] ? String(item[9]) : undefined;
      const rawCs = String(item[16] || item[13] || '').trim();
      const callsign = rawCs || reg || id.toUpperCase();
      const vRateFpm = typeof item[15] === 'number' ? item[15] : 0;
      const verticalRate = isGround ? 0 : Math.round((vRateFpm / 196.85) * 10) / 10;

      let country = 'Schweiz / Europa';
      if (reg?.startsWith('D-') || callsign.startsWith('D-')) country = 'Germany';
      if (reg?.startsWith('HB-') || callsign.startsWith('HB-')) country = 'Switzerland';
      if (reg?.startsWith('F-') || callsign.startsWith('F-')) country = 'France';
      if (reg?.startsWith('G-') || callsign.startsWith('G-')) country = 'United Kingdom';
      if (reg?.startsWith('N') || callsign.startsWith('N')) country = 'United States';

      flights.push({
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

  return flights;
}

export function parseADSBResponse(data: any): Flight[] {
  if (!data || !Array.isArray(data.ac)) return [];
  const flights: Flight[] = [];
  const now = Date.now();

  data.ac.forEach((ac: any) => {
    if (typeof ac.lat !== 'number' || typeof ac.lon !== 'number') return;
    if (calculateDistanceKm(ac.lat, ac.lon) > MAX_RADIUS_KM) return;

    const id = (ac.hex || '').toString().trim().toLowerCase();
    if (!id) return;

    const knots = Math.round(ac.gs ?? 0);
    const kmh = Math.round(knots * 1.852);

    const isGround = ac.alt_baro === 'ground' || (typeof ac.alt_baro === 'number' && ac.alt_baro < 100) || knots < 25;
    const altFeet = isGround ? 0 : Math.round(typeof ac.alt_baro === 'number' ? ac.alt_baro : (ac.alt_geom ?? 0));
    const altMeters = Math.round(altFeet * 0.3048);
    const rawCs = (ac.flight || '').toString().trim();
    const reg = ac.r ? ac.r.toString().trim() : undefined;
    const callsign = rawCs || reg || id.toUpperCase();

    const heading = Math.round(ac.track ?? ac.true_heading ?? ac.mag_heading ?? 0);
    const vRateFpm = ac.baro_rate ?? ac.geom_rate ?? 0;
    const verticalRate = isGround ? 0 : Math.round((vRateFpm / 196.85) * 10) / 10;
    const squawk = ac.squawk ? String(ac.squawk) : undefined;
    const typeCode = ac.t ? String(ac.t) : undefined;

    let country = 'Schweiz / Europa';
    if (reg?.startsWith('D-') || callsign.startsWith('D-')) country = 'Germany';
    if (reg?.startsWith('HB-') || callsign.startsWith('HB-')) country = 'Switzerland';
    if (reg?.startsWith('F-') || callsign.startsWith('F-')) country = 'France';
    if (reg?.startsWith('G-') || callsign.startsWith('G-')) country = 'United Kingdom';
    if (reg?.startsWith('N') || callsign.startsWith('N')) country = 'United States';

    flights.push({
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
  });

  return flights;
}

export function parseOpenSkyResponse(data: any): Flight[] {
  if (!data || !Array.isArray(data.states)) return [];
  const flights: Flight[] = [];
  const now = Date.now();

  data.states.forEach((s: any) => {
    if (!Array.isArray(s) || s.length < 10) return;
    const id = String(s[0] || '').trim().toLowerCase();
    const lon = s[5];
    const lat = s[6];
    if (!id || typeof lat !== 'number' || typeof lon !== 'number') return;
    if (calculateDistanceKm(lat, lon) > MAX_RADIUS_KM) return;

    const rawCs = String(s[1] || '').trim();
    const callsign = rawCs || id.toUpperCase();
    const isGround = Boolean(s[8]);
    const altMetersRaw = typeof s[7] === 'number' ? Math.round(s[7]) : 0;
    const altFeet = isGround ? 0 : Math.round(altMetersRaw / 0.3048);
    const altMeters = isGround ? 0 : altMetersRaw;

    const velMS = typeof s[9] === 'number' ? s[9] : 0;
    const velocityKnots = Math.round(velMS * 1.94384);
    const velocityKmh = Math.round(velMS * 3.6);
    const heading = Math.round(s[10] || 0);
    const vRateMS = typeof s[11] === 'number' ? Math.round(s[11] * 10) / 10 : 0;
    const squawk = s[14] ? String(s[14]) : undefined;
    const country = String(s[2] || 'Schweiz / Europa');

    flights.push({
      id,
      callsign,
      originCountry: country,
      lat,
      lon,
      altitudeMeters: altMeters,
      altitudeFeet: altFeet,
      velocityKmh,
      velocityKnots,
      heading,
      verticalRate: vRateMS,
      isGround,
      squawk,
      lastUpdated: now,
    });
  });

  return flights;
}

export async function fetchClientFlights(): Promise<{ flights: Flight[]; isLiveRadar: boolean }> {
  // URLs to try in order of preference for live aircraft tracking
  const targetEndpoints = [
    { url: '/api/flights', type: 'internal' },
    { url: '/api/flights/fr24', type: 'fr24' },
    { url: '/api/flights/adsb', type: 'adsb' },
    { url: 'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=47.95,47.40,7.15,7.95', type: 'fr24' },
    { url: 'https://api.adsb.lol/v2/lat/47.6741/lon/7.5679/dist/25', type: 'adsb' },
    { url: 'https://opensky-network.org/api/states/all?lamin=47.45&lamax=47.90&lomin=7.30&lomax=7.85', type: 'opensky' },
  ];

  for (const ep of targetEndpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(ep.url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          let parsed: Flight[] = [];
          if (ep.type === 'internal' && data && Array.isArray(data.flights)) {
            parsed = data.flights;
          } else if (ep.type === 'fr24') {
            parsed = parseFR24Response(data);
          } else if (ep.type === 'adsb') {
            parsed = parseADSBResponse(data);
          } else if (ep.type === 'opensky') {
            parsed = parseOpenSkyResponse(data);
          }

          if (parsed.length > 0) {
            return { flights: parsed, isLiveRadar: true };
          }
        }
      }
    } catch {
      // Continue to next endpoint seamlessly
    }
  }

  return { flights: [], isLiveRadar: false };
}
