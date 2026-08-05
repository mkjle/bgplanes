import { Flight } from '../types';

export async function fetchClientFlights(): Promise<{ flights: Flight[]; isLiveRadar: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://api.adsb.lol/v2/lat/47.6741/lon/7.5679/dist/25', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.ac)) {
          const liveFlights: Flight[] = [];
          data.ac.forEach((ac: any) => {
            if (!ac.lat || !ac.lon) return;

            // 35km radius check around Wintersweiler (47.6741, 7.5679)
            const distKm = Math.hypot((ac.lat - 47.6741) * 111, (ac.lon - 7.5679) * 75);
            if (distKm > 35) return;

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

          return { flights: liveFlights, isLiveRadar: true };
        }
      }
    }
  } catch (err) {
    // Network or CORS exception handled quietly
  }

  return { flights: [], isLiveRadar: false };
}

