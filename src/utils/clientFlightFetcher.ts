import { Flight } from '../types';

export function parseADSBResponse(data: any): Flight[] {
  if (!data || !Array.isArray(data.ac)) return [];
  const flights: Flight[] = [];
  const now = Date.now();

  data.ac.forEach((ac: any) => {
    if (typeof ac.lat !== 'number' || typeof ac.lon !== 'number') return;

    // Filter to ~35km radius around Wintersweiler (47.6741, 7.5679)
    const distKm = Math.hypot((ac.lat - 47.6741) * 111, (ac.lon - 7.5679) * 75);
    if (distKm > 35) return;

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

    const distKm = Math.hypot((lat - 47.6741) * 111, (lon - 7.5679) * 75);
    if (distKm > 35) return;

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
    { url: '/api/flights/adsb', type: 'internal' },
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
    } catch (err) {
      // Continue to next endpoint seamlessly
    }
  }

  return { flights: [], isLiveRadar: false };
}
