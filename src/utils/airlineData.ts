import { Flight } from '../types';

interface FlightMeta {
  airline: string;
  aircraftModel: string;
}

const ICAO_MODEL_MAP: Record<string, string> = {
  A20N: 'Airbus A320neo',
  A320: 'Airbus A320-200',
  A21N: 'Airbus A321neo',
  A321: 'Airbus A321-200',
  A19N: 'Airbus A319neo',
  A319: 'Airbus A319-100',
  A332: 'Airbus A330-200',
  A333: 'Airbus A330-300',
  A339: 'Airbus A330-900neo',
  A343: 'Airbus A340-300',
  A359: 'Airbus A350-900',
  A351: 'Airbus A350-1000',
  A388: 'Airbus A380-800',
  BCS1: 'Airbus A220-100',
  BCS3: 'Airbus A220-300',
  B738: 'Boeing 737-800',
  B38M: 'Boeing 737 MAX 8',
  B39M: 'Boeing 737 MAX 9',
  B737: 'Boeing 737-700',
  B772: 'Boeing 777-200ER',
  B77W: 'Boeing 777-300ER',
  B77F: 'Boeing 777 Freighter',
  B788: 'Boeing 787-8',
  B789: 'Boeing 787-9 Dreamliner',
  B78X: 'Boeing 787-10',
  B744: 'Boeing 747-400',
  B748: 'Boeing 747-8i',
  B763: 'Boeing 767-300ER',
  E190: 'Embraer E190',
  E195: 'Embraer E195',
  E295: 'Embraer E195-E2',
  E175: 'Embraer E175',
  CRJ9: 'Bombardier CRJ-900',
  CRJX: 'Bombardier CRJ-1000',
  DH8D: 'De Havilland Dash 8-Q400',
  PC12: 'Pilatus PC-12',
  PC24: 'Pilatus PC-24 Super Versatile Jet',
  C172: 'Cessna 172 Skyhawk',
  C182: 'Cessna 182 Skylane',
  DA40: 'Diamond DA40 Star',
  DA42: 'Diamond DA42 Twin Star',
  H145: 'Airbus Helicopters H145 (REGA)',
  EC35: 'Eurocopter EC135',
  GLF6: 'Gulfstream G650',
  FA7X: 'Dassault Falcon 7X',
  DG80: 'DG Flugzeugbau DG-800 Glider',
};

const AIRLINE_PREFIXES: Record<string, { airline: string; defaultModel: string }> = {
  EZS: { airline: 'easyJet Switzerland', defaultModel: 'Airbus A320-200' },
  EZY: { airline: 'easyJet', defaultModel: 'Airbus A320neo' },
  SWR: { airline: 'Swiss International Air Lines', defaultModel: 'Airbus A320neo' },
  EDW: { airline: 'Edelweiss Air', defaultModel: 'Airbus A340-300' },
  OAW: { airline: 'Helvetic Airways', defaultModel: 'Embraer E190-E2' },
  DLH: { airline: 'Lufthansa', defaultModel: 'Airbus A321neo' },
  LHA: { airline: 'Lufthansa CityLine', defaultModel: 'CRJ-900' },
  EWG: { airline: 'Eurowings', defaultModel: 'Airbus A320-200' },
  EWX: { airline: 'Eurowings Europe', defaultModel: 'Airbus A320-200' },
  CFG: { airline: 'Condor', defaultModel: 'Airbus A330-900neo' },
  AFR: { airline: 'Air France', defaultModel: 'Airbus A320-200' },
  HOP: { airline: 'Air France HOP', defaultModel: 'Embraer E190' },
  BAW: { airline: 'British Airways', defaultModel: 'Airbus A320neo' },
  KLM: { airline: 'KLM Royal Dutch Airlines', defaultModel: 'Boeing 737-800' },
  KLC: { airline: 'KLM Cityhopper', defaultModel: 'Embraer E195-E2' },
  RYR: { airline: 'Ryanair', defaultModel: 'Boeing 737-800' },
  RYS: { airline: 'Buzz (Ryanair Group)', defaultModel: 'Boeing 737 MAX 8' },
  WZZ: { airline: 'Wizz Air', defaultModel: 'Airbus A321neo' },
  WMT: { airline: 'Wizz Air Malta', defaultModel: 'Airbus A321neo' },
  THY: { airline: 'Turkish Airlines', defaultModel: 'Airbus A330-300' },
  UAE: { airline: 'Emirates', defaultModel: 'Boeing 777-300ER' },
  QTR: { airline: 'Qatar Airways', defaultModel: 'Airbus A350-1000' },
  ETD: { airline: 'Etihad Airways', defaultModel: 'Boeing 787-9' },
  AAL: { airline: 'American Airlines', defaultModel: 'Boeing 787-9' },
  DAL: { airline: 'Delta Air Lines', defaultModel: 'Airbus A350-900' },
  UAL: { airline: 'United Airlines', defaultModel: 'Boeing 777-200' },
  AUA: { airline: 'Austrian Airlines', defaultModel: 'Airbus A320-200' },
  BEL: { airline: 'Brussels Airlines', defaultModel: 'Airbus A320-200' },
  IBE: { airline: 'Iberia', defaultModel: 'Airbus A320neo' },
  VLG: { airline: 'Vueling', defaultModel: 'Airbus A320-200' },
  TAP: { airline: 'TAP Air Portugal', defaultModel: 'Airbus A321neo' },
  SAS: { airline: 'SAS Scandinavian Airlines', defaultModel: 'Airbus A320neo' },
  BTI: { airline: 'airBaltic', defaultModel: 'Airbus A220-300' },
  BOX: { airline: 'AeroLogic Cargo', defaultModel: 'Boeing 777F' },
  FDX: { airline: 'FedEx Express', defaultModel: 'Boeing 767-300F' },
  UPS: { airline: 'UPS Airlines', defaultModel: 'Boeing 767-300F' },
  GEC: { airline: 'Lufthansa Cargo', defaultModel: 'Boeing 777F' },
  ICV: { airline: 'Cargolux Italia', defaultModel: 'Boeing 747-400F' },
  CLX: { airline: 'Cargolux', defaultModel: 'Boeing 747-8F' },
  EXS: { airline: 'Jet2.com', defaultModel: 'Boeing 737-800' },
  TUI: { airline: 'TUI fly Deutschland', defaultModel: 'Boeing 737-800' },
  TVF: { airline: 'Transavia France', defaultModel: 'Boeing 737-800' },
  CFE: { airline: 'BA CityFlyer', defaultModel: 'Embraer E190' },
  RJA: { airline: 'Royal Jordanian', defaultModel: 'Airbus A320neo' },
};

export function getFlightMeta(flight: Partial<Flight>): FlightMeta {
  const typeCode = (flight.aircraftTypeCode || '').trim().toUpperCase();
  const cs = (flight.callsign || '').trim().toUpperCase();

  // 1. If exact ICAO type code is known, resolve readable model
  let resolvedModel = '';
  if (typeCode && ICAO_MODEL_MAP[typeCode]) {
    resolvedModel = ICAO_MODEL_MAP[typeCode];
  } else if (flight.aircraftModel && flight.aircraftModel !== 'N/A') {
    resolvedModel = flight.aircraftModel;
  }

  // 2. Check direct prefix match for Airline
  const prefix3 = cs.substring(0, 3);
  let resolvedAirline = '';

  if (AIRLINE_PREFIXES[prefix3]) {
    const info = AIRLINE_PREFIXES[prefix3];
    resolvedAirline = info.airline;
    if (!resolvedModel) {
      resolvedModel = info.defaultModel;
    }
  }

  // 3. Private / General Aviation Registration check
  if (!resolvedAirline && (cs.startsWith('D-') || cs.startsWith('HB-') || cs.startsWith('N') || cs.startsWith('F-') || flight.registration)) {
    resolvedAirline = 'General Aviation / Privatflug';
    if (!resolvedModel) {
      const isFast = (flight.velocityKmh || 0) > 320;
      resolvedModel = isFast ? 'Pilatus PC-12 / Business Jet' : 'Cessna 172 Skyhawk';
    }
  }

  // 4. Country Fallback
  if (!resolvedAirline) {
    const country = flight.originCountry || 'Schweiz';
    resolvedAirline = `${country} Air Transport`;
    if (country === 'Switzerland') resolvedAirline = 'Swiss Regional Airways';
    if (country === 'Germany') resolvedAirline = 'Lufthansa Group Regional';
  }

  if (!resolvedModel) {
    const alt = flight.altitudeFeet || 10000;
    if (alt > 28000) resolvedModel = 'Boeing 787-9 Dreamliner';
    else if (alt < 5000) resolvedModel = 'Diamond DA40 Star';
    else resolvedModel = 'Airbus A320neo';
  }

  return {
    airline: resolvedAirline,
    aircraftModel: resolvedModel,
  };
}
