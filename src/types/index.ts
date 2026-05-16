export interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  nativeRange: string;
  bloomSeason: [string, string]; // ["June", "August"]
  height: string;
  sunRequirement: string;
  waterRequirement: string;
  pollinators: string[];
  color: string; // hex, used for map region fill
  tags: string[];
  /** Local path (e.g. /plants/purple-coneflower.jpg) or external URL. Empty = show placeholder. */
  imageUrl: string;
  /** 3–4 short field-identification tips to help a visitor recognize this plant in person. */
  distinguishingFeatures: string[];
  /** Wikipedia article URL for this species. */
  wikiUrl: string;
}

export type FeatureType =
  | 'bird_nest'
  | 'butterfly_waystation'
  | 'bee_hive'
  | 'water_feature'
  | 'bench'
  | 'sign';

export interface GardenFeature {
  id: string;
  type: FeatureType;
  position: [number, number]; // SVG coordinates [x, y]
  label: string;
  description: string;
}

export interface PlantRegion {
  id: string;
  plantId: string;
  /** Freeform polygon — array of [x, y] SVG coordinate pairs. */
  polygon?: [number, number][];
  /** Circular region — center + radius in SVG units. */
  circle?: { cx: number; cy: number; r: number };
  /** Elliptical region — center, radii, and optional rotation in degrees. */
  ellipse?: { cx: number; cy: number; rx: number; ry: number; rotation?: number };
  label: string;
  notes: string;
}

export interface WalkwayPath {
  id: string;
  label: string;
  polygon: [number, number][]; // filled polygon for the path
}

export interface GardenBed {
  id: string;
  name: string;
  description: string;
  viewBox: string; // SVG viewBox, e.g. "0 0 800 520"
  boundary: [number, number][]; // outer bed outline polygon
  paths: WalkwayPath[];
  regions: PlantRegion[];
  features: GardenFeature[];
}

// Union for the panel: what was clicked
export type SelectedItem =
  | { type: 'region'; region: PlantRegion; plant: Plant }
  | { type: 'feature'; feature: GardenFeature };

// ── Bloom observation types ───────────────────────────────────────────────────

export type BloomStatus = 'not_blooming' | 'budding' | 'peak' | 'fading';

/** A single monthly bloom observation recorded during a garden walk. */
export interface BloomObservation {
  year: number;
  month: number;    // 1 = January … 12 = December
  plantId: string;
  bedId: string;
  status: BloomStatus;
  notes?: string;
  observer?: string; // volunteer name or initials, optional
}

/** All observations for one garden bed across all years. */
export interface BedObservationRecord {
  bedId: string;
  description: string;
  observations: BloomObservation[];
}

/** Computed bloom summary for a single plant in the current month. */
export interface PlantBloomInfo {
  plant: Plant;
  isExpectedBloom: boolean;       // within the stated bloomSeason range
  historicalRate: number | null;  // 0–1, fraction of recorded years with bloom in this month
  latestStatus: BloomStatus | null; // most recent recorded observation for this month
  yearsOfData: number;
}
