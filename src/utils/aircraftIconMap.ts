import { Flight } from '../types';
import { getFlightMeta } from './airlineData';

const BASE_PATH = '/assets/ADS-B_Radar_Free_Aircraft_SVG_Icons';

// Exact ICAO Type Code Mapping to SVG Icon Filename
const ICAO_TYPE_TO_ICON: Record<string, string> = {
  // Airbus A320 family & A220 -> a320.svg
  A318: 'a320.svg',
  A319: 'a320.svg',
  A320: 'a320.svg',
  A321: 'a320.svg',
  A19N: 'a320.svg',
  A20N: 'a320.svg',
  A21N: 'a320.svg',
  BCS1: 'a320.svg',
  BCS3: 'a320.svg',

  // Airbus A330 -> a330.svg
  A332: 'a330.svg',
  A333: 'a330.svg',
  A338: 'a330.svg',
  A339: 'a330.svg',
  A330: 'a330.svg',

  // Airbus A340 -> a340.svg
  A342: 'a340.svg',
  A343: 'a340.svg',
  A345: 'a340.svg',
  A346: 'a340.svg',
  A340: 'a340.svg',

  // Airbus A380 -> a380.svg
  A388: 'a380.svg',
  A380: 'a380.svg',

  // Boeing 737 -> b737.svg
  B731: 'b737.svg',
  B732: 'b737.svg',
  B733: 'b737.svg',
  B734: 'b737.svg',
  B735: 'b737.svg',
  B736: 'b737.svg',
  B737: 'b737.svg',
  B738: 'b737.svg',
  B739: 'b737.svg',
  B37M: 'b737.svg',
  B38M: 'b737.svg',
  B39M: 'b737.svg',
  B3XM: 'b737.svg',

  // Boeing 747 -> b747.svg
  B741: 'b747.svg',
  B742: 'b747.svg',
  B743: 'b747.svg',
  B744: 'b747.svg',
  B748: 'b747.svg',
  B747: 'b747.svg',

  // Boeing 767 -> b767.svg
  B762: 'b767.svg',
  B763: 'b767.svg',
  B764: 'b767.svg',
  B767: 'b767.svg',

  // Boeing 777 -> b777.svg
  B772: 'b777.svg',
  B773: 'b777.svg',
  B77L: 'b777.svg',
  B77W: 'b777.svg',
  B778: 'b777.svg',
  B779: 'b777.svg',
  B77F: 'b777.svg',
  B777: 'b777.svg',

  // Boeing 787 -> b787.svg
  B788: 'b787.svg',
  B789: 'b787.svg',
  B78X: 'b787.svg',
  B787: 'b787.svg',

  // Cessna -> cessna.svg
  C150: 'cessna.svg',
  C152: 'cessna.svg',
  C172: 'cessna.svg',
  C182: 'cessna.svg',
  C206: 'cessna.svg',
  C208: 'cessna.svg',
  C210: 'cessna.svg',
  C25A: 'cessna.svg',
  C525: 'cessna.svg',
  C550: 'cessna.svg',
  C560: 'cessna.svg',
  C680: 'cessna.svg',
  C750: 'cessna.svg',

  // Propellers & General Aviation -> c0.svg
  P28A: 'c0.svg',
  P28U: 'c0.svg',
  PA28: 'c0.svg',
  PA34: 'c0.svg',
  DA40: 'c0.svg',
  DA42: 'c0.svg',
  PC12: 'c0.svg',
  PC24: 'c0.svg',
  SR22: 'c0.svg',

  // Military Transport -> c130.svg
  C130: 'c130.svg',
  C30J: 'c130.svg',
  A400: 'c130.svg',
  C17: 'c130.svg',

  // Bombardier CRJ -> crjx.svg
  CRJ1: 'crjx.svg',
  CRJ2: 'crjx.svg',
  CRJ7: 'crjx.svg',
  CRJ9: 'crjx.svg',
  CRJX: 'crjx.svg',
  CL60: 'crjx.svg',

  // De Havilland Dash 8 / ATR -> dh8a.svg
  DH8A: 'dh8a.svg',
  DH8B: 'dh8a.svg',
  DH8C: 'dh8a.svg',
  DH8D: 'dh8a.svg',
  AT43: 'dh8a.svg',
  AT72: 'dh8a.svg',
  AT75: 'dh8a.svg',
  AT76: 'dh8a.svg',

  // Embraer E-Jets -> e195.svg
  E170: 'e195.svg',
  E175: 'e195.svg',
  E190: 'e195.svg',
  E195: 'e195.svg',
  E290: 'e195.svg',
  E295: 'e195.svg',

  // Embraer ERJ -> erj.svg
  E135: 'erj.svg',
  E140: 'erj.svg',
  E145: 'erj.svg',
  ERJ1: 'erj.svg',
  ERJ4: 'erj.svg',

  // Fokker -> f100.svg
  F70: 'f100.svg',
  F100: 'f100.svg',

  // Jet Trainer -> f11.svg
  F11: 'f11.svg',

  // Fighter Jets -> f15.svg
  F15: 'f15.svg',
  F16: 'f15.svg',
  F18: 'f15.svg',
  F22: 'f15.svg',
  F35: 'f15.svg',
  M2000: 'f15.svg',
  TYPH: 'f15.svg',
  EF20: 'f15.svg',

  // F-5 -> f5.svg
  F5: 'f5.svg',
  F5T: 'f5.svg',

  // Dassault Falcon -> fa7x.svg
  FA50: 'fa7x.svg',
  FA7X: 'fa7x.svg',
  FA8X: 'fa7x.svg',
  F2TH: 'fa7x.svg',
  F900: 'fa7x.svg',

  // Gulfstream -> glf5.svg
  GLF4: 'glf5.svg',
  GLF5: 'glf5.svg',
  GLF6: 'glf5.svg',
  G550: 'glf5.svg',
  G650: 'glf5.svg',

  // Learjet -> learjet.svg
  LJ35: 'learjet.svg',
  LJ45: 'learjet.svg',
  LJ60: 'learjet.svg',
  LJ75: 'learjet.svg',

  // MD-11 / DC-10 -> md11.svg
  MD11: 'md11.svg',
  DC10: 'md11.svg',
  MD80: 'md11.svg',
  MD82: 'md11.svg',
  MD83: 'md11.svg',
  MD88: 'md11.svg',
  MD90: 'md11.svg',
};

/**
 * Returns the SVG icon file path for a given flight or aircraft type model.
 * If no specific model icon exists (e.g. Beluga, A350, unknown), falls back to "a0.svg".
 */
export function getAircraftIconPath(flight: Partial<Flight>): string {
  const typeCode = (flight.aircraftTypeCode || '').trim().toUpperCase();
  const meta = getFlightMeta(flight);
  const modelName = (flight.aircraftModel || meta.aircraftModel || '').toUpperCase();

  // 1. Direct ICAO Type Code Lookup
  if (typeCode && ICAO_TYPE_TO_ICON[typeCode]) {
    return `${BASE_PATH}/${ICAO_TYPE_TO_ICON[typeCode]}`;
  }

  // 2. Pattern or Keyword match in model string
  if (modelName.includes('A320') || modelName.includes('A321') || modelName.includes('A319') || modelName.includes('A318') || modelName.includes('A220')) {
    return `${BASE_PATH}/a320.svg`;
  }
  if (modelName.includes('A330')) return `${BASE_PATH}/a330.svg`;
  if (modelName.includes('A340')) return `${BASE_PATH}/a340.svg`;
  if (modelName.includes('A380')) return `${BASE_PATH}/a380.svg`;

  if (modelName.includes('737') || modelName.includes('B738') || modelName.includes('MAX 8') || modelName.includes('MAX 9')) {
    return `${BASE_PATH}/b737.svg`;
  }
  if (modelName.includes('747')) return `${BASE_PATH}/b747.svg`;
  if (modelName.includes('767')) return `${BASE_PATH}/b767.svg`;
  if (modelName.includes('777')) return `${BASE_PATH}/b777.svg`;
  if (modelName.includes('787') || modelName.includes('DREAMLINER')) return `${BASE_PATH}/b787.svg`;

  if (modelName.includes('CESSNA') || modelName.includes('CITATION')) return `${BASE_PATH}/cessna.svg`;
  if (modelName.includes('GULFSTREAM') || modelName.includes('G650') || modelName.includes('G550')) return `${BASE_PATH}/glf5.svg`;
  if (modelName.includes('FALCON')) return `${BASE_PATH}/fa7x.svg`;
  if (modelName.includes('LEARJET')) return `${BASE_PATH}/learjet.svg`;
  if (modelName.includes('EMBRAER') || modelName.includes('E190') || modelName.includes('E195') || modelName.includes('E175')) return `${BASE_PATH}/e195.svg`;
  if (modelName.includes('ERJ')) return `${BASE_PATH}/erj.svg`;
  if (modelName.includes('CRJ')) return `${BASE_PATH}/crjx.svg`;
  if (modelName.includes('DASH 8') || modelName.includes('Q400') || modelName.includes('ATR')) return `${BASE_PATH}/dh8a.svg`;
  if (modelName.includes('FOKKER')) return `${BASE_PATH}/f100.svg`;
  if (modelName.includes('HERCULES') || modelName.includes('C-130')) return `${BASE_PATH}/c130.svg`;
  if (modelName.includes('MD-11') || modelName.includes('DC-10')) return `${BASE_PATH}/md11.svg`;

  if (modelName.includes('PIPER') || modelName.includes('DIAMOND') || modelName.includes('PILATUS') || modelName.includes('STAR') || modelName.includes('SKYHAWK')) {
    return `${BASE_PATH}/c0.svg`;
  }

  // 3. Fallback to default a0.svg (for Beluga, A350, unknown models, etc.)
  return `${BASE_PATH}/a0.svg`;
}
