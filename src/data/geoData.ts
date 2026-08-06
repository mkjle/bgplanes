import { GeoFeature, Point } from '../types';

// Wintersweiler Center (District of Efringen-Kirchen, Baden-Württemberg: 47.6741° N, 7.5679° E)
export const WINTERSWEILER_CENTER: Point = {
  lat: 47.6741,
  lon: 7.5679,
};

// Map View Center (Shifted ~0.028° south so Wintersweiler sits ~2cm higher on screen, revealing more southern area)
export const MAP_CENTER: Point = {
  lat: 47.6460,
  lon: 7.5679,
};

// Dreiländereck Monument (Tripoint DE / CH / FR)
export const DREILAENDERECK_POINT: Point = {
  lat: 47.5880,
  lon: 7.5898,
};

// Region Bounding Box around Wintersweiler (~15km radius)
export const DEFAULT_BOUNDS = {
  minLat: 47.505,
  maxLat: 47.745,
  minLon: 7.380,
  maxLon: 7.740,
};

export const GEO_FEATURES: GeoFeature[] = [
  // --- RHINE RIVER ---
  {
    id: 'rhine-river-main',
    name: 'Rhein',
    type: 'river',
    category: 'rhine-river',
    coordinates: [
      { lat: 47.545, lon: 7.640 }, // Birsfelden / Grenzach
      { lat: 47.558, lon: 7.592 }, // Basel Mittlere Brücke
      { lat: 47.575, lon: 7.588 }, // Basel North / Klybeck
      { lat: 47.588, lon: 7.5898 }, // Dreiländereck Tripoint
      { lat: 47.595, lon: 7.578 }, // Weil am Rhein / Huningue
      { lat: 47.610, lon: 7.560 }, // Märkt Weir
      { lat: 47.625, lon: 7.545 }, // Eimeldingen West
      { lat: 47.638, lon: 7.532 }, // Istein Klotz (Rhine Bend)
      { lat: 47.652, lon: 7.525 }, // Kleinkems West
      { lat: 47.670, lon: 7.530 }, // Rheinweiler
      { lat: 47.695, lon: 7.538 }, // Bad Bellingen
      { lat: 47.720, lon: 7.545 }, // Steinenstadt
      { lat: 47.740, lon: 7.550 }, // Neuenburg / Chalampé
    ],
  },
  // Rhine Canal (Grand Canal d'Alsace)
  {
    id: 'rhine-canal',
    name: 'Grand Canal d\'Alsace',
    type: 'river',
    category: 'rhine-river',
    coordinates: [
      { lat: 47.610, lon: 7.555 },
      { lat: 47.630, lon: 7.538 },
      { lat: 47.650, lon: 7.520 },
      { lat: 47.675, lon: 7.525 },
      { lat: 47.700, lon: 7.532 },
      { lat: 47.730, lon: 7.542 },
    ],
  },

  // --- COUNTRY BORDERS ---
  // DE / FR Border (Follows Rhine North from Dreiländereck)
  {
    id: 'border-de-fr',
    name: 'Grenze Deutschland / Frankreich',
    type: 'border',
    category: 'country-border',
    coordinates: [
      { lat: 47.5880, lon: 7.5898 }, // Dreiländereck
      { lat: 47.595, lon: 7.578 },
      { lat: 47.610, lon: 7.560 },
      { lat: 47.625, lon: 7.545 },
      { lat: 47.638, lon: 7.532 },
      { lat: 47.652, lon: 7.525 },
      { lat: 47.670, lon: 7.530 },
      { lat: 47.695, lon: 7.538 },
      { lat: 47.720, lon: 7.545 },
      { lat: 47.740, lon: 7.550 },
    ],
  },
  // DE / CH Border (East from Dreiländereck through Weil am Rhein / Basel boundary)
  {
    id: 'border-de-ch',
    name: 'Grenze Deutschland / Schweiz',
    type: 'border',
    category: 'country-border',
    coordinates: [
      { lat: 47.5880, lon: 7.5898 }, // Dreiländereck
      { lat: 47.585, lon: 7.605 }, // Weil am Rhein Zoll
      { lat: 47.582, lon: 7.625 }, // Riehen West
      { lat: 47.595, lon: 7.648 }, // Riehen North / Inzlingen
      { lat: 47.580, lon: 7.670 }, // St. Chrischona / Grenzach
      { lat: 47.550, lon: 7.690 }, // Wyhlen / Pratteln (Rhine)
    ],
  },
  // FR / CH Border (West/South-West from Dreiländereck between Huningue/Saint-Louis and Basel)
  {
    id: 'border-fr-ch',
    name: 'Grenze Frankreich / Schweiz',
    type: 'border',
    category: 'country-border',
    coordinates: [
      { lat: 47.5880, lon: 7.5898 }, // Dreiländereck
      { lat: 47.580, lon: 7.578 }, // Huningue / St. Johann Basel
      { lat: 47.572, lon: 7.562 }, // Lysbüchel / Saint-Louis
      { lat: 47.565, lon: 7.535 }, // Allschwil / EuroAirport South
      { lat: 47.550, lon: 7.490 }, // Schönenbuch / Neuwiller
    ],
  },

  // --- EUROAIRPORT BASEL-MULHOUSE (LFSB / BSL / EAP) RUNWAYS ---
  // Main Runway 15/33 (3,900m x 60m, Direction ~154° / 334°)
  {
    id: 'runway-15-33',
    name: 'EuroAirport Piste 15/33 (Hauptpiste 3.900m)',
    type: 'runway',
    category: 'airport',
    coordinates: [
      { lat: 47.6085, lon: 7.5140 }, // Schwelle 15 (Nord-West)
      { lat: 47.5765, lon: 7.5385 }, // Schwelle 33 (Süd-Ost)
    ],
  },
  // Cross Runway 08/26 (1,820m x 60m, Direction ~077° / 257°)
  {
    id: 'runway-08-26',
    name: 'EuroAirport Piste 08/26 (Nebenpiste 1.820m)',
    type: 'runway',
    category: 'airport',
    coordinates: [
      { lat: 47.5922, lon: 7.5155 }, // Schwelle 08 (West)
      { lat: 47.5960, lon: 7.5395 }, // Schwelle 26 (Ost)
    ],
  },

  // --- MAJOR HIGHWAYS & TRANSPORT NETWORK ---
  // Autobahn A5 (Germany North-South)
  {
    id: 'road-a5',
    name: 'Autobahn A5',
    type: 'road',
    category: 'highway',
    coordinates: [
      { lat: 47.587, lon: 7.600 }, // Weil am Rhein / Basel Nord
      { lat: 47.600, lon: 7.585 }, // Haltingen East
      { lat: 47.615, lon: 7.570 }, // Eimeldingen East
      { lat: 47.635, lon: 7.555 }, // Efringen-Kirchen East (near Wintersweiler)
      { lat: 47.660, lon: 7.545 }, // Istein / Welmlingen East
      { lat: 47.690, lon: 7.548 }, // Bad Bellingen East
      { lat: 47.730, lon: 7.560 }, // Müllheim / Neuenburg
    ],
  },
  // Autoroute A35 (France North-South)
  {
    id: 'road-a35',
    name: 'Autoroute A35',
    type: 'road',
    category: 'highway',
    coordinates: [
      { lat: 47.565, lon: 7.550 }, // Saint-Louis
      { lat: 47.590, lon: 7.540 }, // EuroAirport East
      { lat: 47.620, lon: 7.510 }, // Bartenheim
      { lat: 47.650, lon: 7.480 }, // Sierentz
      { lat: 47.700, lon: 7.420 }, // Habsheim / Mulhouse
    ],
  },
  // Bundesstraße B3 (Germany parallel to A5)
  {
    id: 'road-b3',
    name: 'Bundesstraße B3',
    type: 'road',
    category: 'local-road',
    coordinates: [
      { lat: 47.590, lon: 7.615 }, // Weil am Rhein
      { lat: 47.610, lon: 7.595 }, // Haltingen
      { lat: 47.625, lon: 7.580 }, // Eimeldingen
      { lat: 47.640, lon: 7.565 }, // Efringen-Kirchen
      { lat: 47.665, lon: 7.552 }, // Huttingen
      { lat: 47.685, lon: 7.550 }, // Rheinweiler
    ],
  },

  // --- LOCAL ROADS AROUND WINTERSWEILER ---
  // K6318: Efringen-Kirchen -> Wintersweiler -> Egringen
  {
    id: 'road-wintersweiler-1',
    name: 'K6318 (Efringen-Kirchen - Wintersweiler)',
    type: 'road',
    category: 'local-road',
    coordinates: [
      { lat: 47.6535, lon: 7.5640 }, // Efringen-Kirchen
      { lat: 47.6741, lon: 7.5679 }, // Wintersweiler Dorfzentrum
      { lat: 47.6580, lon: 7.5900 }, // towards Egringen
    ],
  },
  // Road: Wintersweiler -> Welmlingen -> Mappach
  {
    id: 'road-wintersweiler-2',
    name: 'Wintersweiler - Welmlingen',
    type: 'road',
    category: 'local-road',
    coordinates: [
      { lat: 47.6741, lon: 7.5679 }, // Wintersweiler
      { lat: 47.6650, lon: 7.5680 }, // Welmlingen
      { lat: 47.6850, lon: 7.5850 }, // Mappach
    ],
  },
  // Road: Wintersweiler -> Huttingen -> Blansingen
  {
    id: 'road-wintersweiler-3',
    name: 'Wintersweiler - Huttingen - Blansingen',
    type: 'road',
    category: 'local-road',
    coordinates: [
      { lat: 47.6741, lon: 7.5679 }, // Wintersweiler
      { lat: 47.6620, lon: 7.5500 }, // Huttingen
      { lat: 47.6940, lon: 7.5450 }, // Blansingen
    ],
  },
  // Road: Wintersweiler -> Fischingen
  {
    id: 'road-wintersweiler-4',
    name: 'Wintersweiler - Fischingen',
    type: 'road',
    category: 'local-road',
    coordinates: [
      { lat: 47.6741, lon: 7.5679 }, // Wintersweiler
      { lat: 47.6520, lon: 7.5950 }, // Fischingen
      { lat: 47.6300, lon: 7.5900 }, // Binzen / Eimeldingen
    ],
  },
  // Lörrach - Weil Connection (Wiese River valley road)
  {
    id: 'road-loerrach-weil',
    name: 'Wiesental (Weil - Lörrach)',
    type: 'road',
    category: 'local-road',
    coordinates: [
      { lat: 47.595, lon: 7.610 }, // Weil am Rhein
      { lat: 47.600, lon: 7.635 }, // Lörrach Stetten
      { lat: 47.615, lon: 7.660 }, // Lörrach Stadt
      { lat: 47.635, lon: 7.675 }, // Steinen
    ],
  },
];

// Key Villages and Cities in the 10-15km Radius
export interface TownMarker {
  name: string;
  lat: number;
  lon: number;
  country: 'DE' | 'CH' | 'FR';
  isFocus?: boolean;
}

export const TOWNS: TownMarker[] = [
  { name: 'WINTERSWEILER', lat: 47.6741, lon: 7.5679, country: 'DE', isFocus: true },
  { name: 'Efringen-Kirchen', lat: 47.6535, lon: 7.5640, country: 'DE' },
  { name: 'Welmlingen', lat: 47.6650, lon: 7.5680, country: 'DE' },
  { name: 'Huttingen', lat: 47.6620, lon: 7.5500, country: 'DE' },
  { name: 'Egringen', lat: 47.6580, lon: 7.5900, country: 'DE' },
  { name: 'Blansingen', lat: 47.6940, lon: 7.5450, country: 'DE' },
  { name: 'Fischingen', lat: 47.6520, lon: 7.5950, country: 'DE' },
  { name: 'Eimeldingen', lat: 47.6300, lon: 7.5900, country: 'DE' },
  { name: 'Istein', lat: 47.6430, lon: 7.5340, country: 'DE' },
  { name: 'Haltingen', lat: 47.6100, lon: 7.5950, country: 'DE' },
  { name: 'Weil am Rhein', lat: 47.5950, lon: 7.6100, country: 'DE' },
  { name: 'Lörrach', lat: 47.6150, lon: 7.6600, country: 'DE' },
  { name: 'Kandern', lat: 47.7120, lon: 7.6600, country: 'DE' },
  { name: 'Bad Bellingen', lat: 47.7300, lon: 7.5380, country: 'DE' },

  // Switzerland
  { name: 'BASEL', lat: 47.5580, lon: 7.5900, country: 'CH' },
  { name: 'Riehen', lat: 47.5820, lon: 7.6480, country: 'CH' },

  // France
  { name: 'Saint-Louis', lat: 47.5850, lon: 7.5650, country: 'FR' },
  { name: 'Huningue', lat: 47.5900, lon: 7.5820, country: 'FR' },
  { name: 'Blotzheim', lat: 47.6020, lon: 7.4950, country: 'FR' },
  { name: 'Sierentz', lat: 47.6550, lon: 7.4550, country: 'FR' },
];

export const COUNTRY_LABELS = [
  { label: 'DEUTSCHLAND', lat: 47.6700, lon: 7.6200 },
  { label: 'SCHWEIZ', lat: 47.5400, lon: 7.6100 },
  { label: 'FRANKREICH', lat: 47.6500, lon: 7.4400 },
];
