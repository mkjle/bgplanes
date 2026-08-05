import { Flight } from '../types';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  lat: number;
  lon: number;
}

export interface FlightRoute {
  origin: Airport;
  destination: Airport;
  isEstimated?: boolean;
}

const AIRPORTS: Record<string, Airport> = {
  BSL: { code: 'BSL', name: 'EuroAirport Basel-Mulhouse-Freiburg', city: 'Basel / Mulhouse', country: 'Schweiz / Frankreich', flag: '🇨🇭', lat: 47.5896, lon: 7.5299 },
  ZRH: { code: 'ZRH', name: 'Flughafen Zürich', city: 'Zürich', country: 'Schweiz', flag: '🇨🇭', lat: 47.4582, lon: 8.5554 },
  GVA: { code: 'GVA', name: 'Aéroport de Genève', city: 'Genf', country: 'Schweiz', flag: '🇨🇭', lat: 46.237, lon: 6.1092 },
  FRA: { code: 'FRA', name: 'Flughafen Frankfurt am Main', city: 'Frankfurt', country: 'Deutschland', flag: '🇩🇪', lat: 50.0379, lon: 8.5622 },
  MUC: { code: 'MUC', name: 'Flughafen München', city: 'München', country: 'Deutschland', flag: '🇩🇪', lat: 48.3537, lon: 11.7861 },
  BER: { code: 'BER', name: 'Flughafen Berlin Brandenburg', city: 'Berlin', country: 'Deutschland', flag: '🇩🇪', lat: 52.3667, lon: 13.5033 },
  HAM: { code: 'HAM', name: 'Flughafen Hamburg', city: 'Hamburg', country: 'Deutschland', flag: '🇩🇪', lat: 53.6304, lon: 9.9882 },
  LGW: { code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'Vereinigtes Königreich', flag: '🇬🇧', lat: 51.1537, lon: -0.1821 },
  LHR: { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'Vereinigtes Königreich', flag: '🇬🇧', lat: 51.4700, lon: -0.4543 },
  STN: { code: 'STN', name: 'London Stansted Airport', city: 'London', country: 'Vereinigtes Königreich', flag: '🇬🇧', lat: 51.8860, lon: 0.2389 },
  MAN: { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'Vereinigtes Königreich', flag: '🇬🇧', lat: 53.3537, lon: -2.2750 },
  CDG: { code: 'CDG', name: 'Aéroport Paris-Charles de Gaulle', city: 'Paris', country: 'Frankreich', flag: '🇫🇷', lat: 49.0097, lon: 2.5479 },
  ORY: { code: 'ORY', name: 'Aéroport de Paris-Orly', city: 'Paris', country: 'Frankreich', flag: '🇫🇷', lat: 48.7262, lon: 2.3652 },
  NCE: { code: 'NCE', name: 'Aéroport Nice Côte d\'Azur', city: 'Nizza', country: 'Frankreich', flag: '🇫🇷', lat: 43.6653, lon: 7.2150 },
  PMI: { code: 'PMI', name: 'Aeropuerto de Palma de Mallorca', city: 'Palma de Mallorca', country: 'Spanien', flag: '🇪🇸', lat: 39.5517, lon: 2.7388 },
  BCN: { code: 'BCN', name: 'Aeropuerto Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', country: 'Spanien', flag: '🇪🇸', lat: 41.2974, lon: 2.0785 },
  MAD: { code: 'MAD', name: 'Aeropuerto Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spanien', flag: '🇪🇸', lat: 40.4839, lon: -3.5680 },
  AGP: { code: 'AGP', name: 'Aeropuerto de Málaga-Costa del Sol', city: 'Málaga', country: 'Spanien', flag: '🇪🇸', lat: 36.6749, lon: -4.4991 },
  ALC: { code: 'ALC', name: 'Aeropuerto de Alicante-Elche', city: 'Alicante', country: 'Spanien', flag: '🇪🇸', lat: 38.2822, lon: -0.5582 },
  LIS: { code: 'LIS', name: 'Aeroporto Humberto Delgado Lisboa', city: 'Lissabon', country: 'Portugal', flag: '🇵🇹', lat: 38.7756, lon: -9.1354 },
  OPO: { code: 'OPO', name: 'Aeroporto Francisco Sá Carneiro Porto', city: 'Porto', country: 'Portugal', flag: '🇵🇹', lat: 41.2481, lon: -8.6814 },
  AMS: { code: 'AMS', name: 'Luchthaven Schiphol Amsterdam', city: 'Amsterdam', country: 'Niederlande', flag: '🇳🇱', lat: 52.3105, lon: 4.7683 },
  VIE: { code: 'VIE', name: 'Flughafen Wien-Schwechat', city: 'Wien', country: 'Österreich', flag: '🇦🇹', lat: 48.1103, lon: 16.5697 },
  BUD: { code: 'BUD', name: 'Budapest Liszt Ferenc International', city: 'Budapest', country: 'Ungarn', flag: '🇭🇺', lat: 47.4369, lon: 19.2556 },
  OTP: { code: 'OTP', name: 'Aeroportul Internațional Henri Coandă București', city: 'Bukarest', country: 'Rumänien', flag: '🇷🇴', lat: 44.5711, lon: 26.0850 },
  PRN: { code: 'PRN', name: 'Prishtina International Airport Adem Jashari', city: 'Pristina', country: 'Kosovo', flag: '🇽🇰', lat: 42.5728, lon: 21.0358 },
  IST: { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Türkei', flag: '🇹🇷', lat: 41.2753, lon: 28.7519 },
  AYT: { code: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya', country: 'Türkei', flag: '🇹🇷', lat: 36.8987, lon: 30.8005 },
  FCO: { code: 'FCO', name: 'Aeroporto di Roma-Fiumicino', city: 'Rom', country: 'Italien', flag: '🇮🇹', lat: 41.8003, lon: 12.2389 },
  MXP: { code: 'MXP', name: 'Aeroporto di Milano-Malpensa', city: 'Mailand', country: 'Italien', flag: '🇮🇹', lat: 45.6301, lon: 8.7255 },
  VCE: { code: 'VCE', name: 'Aeroporto di Venezia Marco Polo', city: 'Venedig', country: 'Italien', flag: '🇮🇹', lat: 45.5053, lon: 12.3519 },
  JFK: { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', flag: '🇺🇸', lat: 40.6413, lon: -73.7781 },
};

// Direct callsign exact or prefix routes
const EXACT_ROUTES: Record<string, { origin: string; destination: string }> = {
  WZZ6757: { origin: 'BSL', destination: 'OTP' },
  EJU85DP: { origin: 'BSL', destination: 'PMI' },
  DLH1TX: { origin: 'BSL', destination: 'FRA' },
  CAZ201: { origin: 'ZRH', destination: 'GVA' },
  EXS1758: { origin: 'LGW', destination: 'PMI' },
  EZY14JX: { origin: 'BER', destination: 'BSL' },
  EJU51UP: { origin: 'BSL', destination: 'BCN' },
  WZZ4005: { origin: 'BUD', destination: 'BSL' },
  EXS79A: { origin: 'MAN', destination: 'PMI' },
  EZS48DR: { origin: 'BSL', destination: 'BER' },
  VLG48MQ: { origin: 'BCN', destination: 'BSL' },
  EXS27KG: { origin: 'STN', destination: 'NCE' },
  EZY56KF: { origin: 'LGW', destination: 'BSL' },
  HBKKI: { origin: 'BSL', destination: 'GVA' },
};

export function getFlightRoute(flight: Partial<Flight>): FlightRoute {
  const cs = (flight.callsign || '').trim().toUpperCase();
  const reg = (flight.registration || '').trim().toUpperCase();
  const alt = flight.altitudeFeet || 0;
  const heading = flight.heading || 0;
  const isGround = Boolean(flight.isGround);

  // 1. Exact Callsign Lookup
  if (EXACT_ROUTES[cs]) {
    const route = EXACT_ROUTES[cs];
    return {
      origin: AIRPORTS[route.origin],
      destination: AIRPORTS[route.destination],
      isEstimated: false,
    };
  }

  // Also check registration as callsign (e.g. HBKKI, G-JZBX)
  if (reg && EXACT_ROUTES[reg]) {
    const route = EXACT_ROUTES[reg];
    return {
      origin: AIRPORTS[route.origin],
      destination: AIRPORTS[route.destination],
      isEstimated: false,
    };
  }

  // 2. Airplanes at or near EuroAirport Basel (47.59 - 47.75 N, 7.45 - 7.60 E)
  const isNearBasel = flight.lat ? (Math.abs(flight.lat - 47.59) < 0.15 && Math.abs((flight.lon || 0) - 7.53) < 0.15) : true;

  if (isGround || (isNearBasel && alt < 8000)) {
    // Aircraft taking off or landing at Basel (BSL)
    const isClimbing = (flight.verticalRate || 0) > 0.5 || alt > 2500;

    let destinationCode = 'PMI'; // default popular European destination
    if (heading >= 120 && heading <= 170) destinationCode = 'PRN'; // Pristina / Italy / Balkans
    else if (heading > 170 && heading <= 240) destinationCode = 'PMI'; // Spain / Palma
    else if (heading > 240 && heading <= 330) destinationCode = 'LGW'; // UK / Paris
    else if (heading > 330 || heading <= 40) destinationCode = 'BER'; // North Germany / Berlin
    else if (heading > 40 && heading < 120) destinationCode = 'BUD'; // Eastern Europe

    if (isClimbing || isGround) {
      return {
        origin: AIRPORTS.BSL,
        destination: AIRPORTS[destinationCode] || AIRPORTS.PMI,
        isEstimated: true,
      };
    } else {
      // Landing at Basel
      return {
        origin: AIRPORTS[destinationCode] || AIRPORTS.LGW,
        destination: AIRPORTS.BSL,
        isEstimated: true,
      };
    }
  }

  // 3. Overflying aircraft high altitude or regional corridors
  let orig = AIRPORTS.ZRH;
  let dest = AIRPORTS.FRA;

  if (heading >= 310 || heading <= 30) {
    // Flying North (e.g. Zurich/Milan -> Frankfurt/Amsterdam/London)
    orig = (heading > 340 || heading <= 20) ? AIRPORTS.MXP : AIRPORTS.ZRH;
    dest = (heading > 340) ? AIRPORTS.AMS : AIRPORTS.FRA;
  } else if (heading > 30 && heading <= 130) {
    // Flying East (e.g. Paris/Basel -> Munich/Vienna/Budapest)
    orig = AIRPORTS.CDG;
    dest = heading > 80 ? AIRPORTS.BUD : AIRPORTS.MUC;
  } else if (heading > 130 && heading <= 210) {
    // Flying South (e.g. Frankfurt/Berlin -> Nice/Rome/Palma)
    orig = AIRPORTS.FRA;
    dest = heading > 170 ? AIRPORTS.PMI : AIRPORTS.NCE;
  } else {
    // Flying West (e.g. Vienna/Zurich -> Paris/London/Barcelona)
    orig = AIRPORTS.VIE;
    dest = heading > 240 ? AIRPORTS.BCN : AIRPORTS.CDG;
  }

  return {
    origin: orig,
    destination: dest,
    isEstimated: true,
  };
}
