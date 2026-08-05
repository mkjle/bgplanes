export interface Flight {
  id: string; // icao24
  callsign: string;
  originCountry: string;
  airline?: string;
  aircraftModel?: string;
  registration?: string;
  aircraftTypeCode?: string;
  lat: number;
  lon: number;
  altitudeMeters: number;
  altitudeFeet: number;
  velocityKmh: number;
  velocityKnots: number;
  heading: number; // degrees 0-360
  verticalRate: number; // m/s
  isGround: boolean;
  squawk?: string;
  lastUpdated: number; // timestamp
  // Smooth motion tracking
  prevLat?: number;
  prevLon?: number;
  targetLat?: number;
  targetLon?: number;
}

export interface Point {
  lat: number;
  lon: number;
}

export interface GeoFeature {
  id: string;
  name: string;
  type: 'border' | 'river' | 'road' | 'railway' | 'runway' | 'ring' | 'town';
  category?: 'country-border' | 'rhine-river' | 'highway' | 'local-road' | 'airport' | 'town-label';
  coordinates: Point[];
  label?: string;
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}
