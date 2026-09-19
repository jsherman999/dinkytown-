export interface Interval {
  start_year: number;
  /** First year the record no longer applies (exclusive). null = still current. */
  end_year: number | null;
}

export type Confidence = 'high' | 'medium' | 'low' | 'placeholder';
export type Material = 'brick' | 'wood' | 'stucco' | 'glass' | 'concrete';

export interface BuildingProps {
  id: string;
  name: string;
  addresses: string[];
  built_year: number;
  demolished_year: number | null;
  stories: number;
  height_m: number;
  material: Material;
  confidence: Confidence;
  geometry_status: 'placeholder' | 'traced' | 'parcel';
  sources: string[];
}

export interface Tenant extends Interval {
  building_id: string;
  unit: string;
  name: string;
  category: string;
  start_precision: 'exact' | 'circa' | 'directory-year';
  confidence: Confidence;
  source_ids: string[];
}

export interface Photo {
  id: string;
  building_id: string;
  year: number;
  year_precision: string;
  url: string;
  thumbnail: string;
  credit: string;
  rights: 'public-domain' | 'permission-granted' | 'link-only';
  source_ids: string[];
}

export interface Source {
  id: string;
  type: string;
  citation: string;
  url: string;
  sheet_or_page: string;
  retrieved_at: string;
}

export interface Keyframe {
  year: number;
  confidence: Confidence;
  note?: string;
}

export interface FeatureProps extends Interval {
  id: string;
  kind: 'block' | 'street' | 'streetcar' | 'rail' | 'greenway';
  name?: string;
  surface?: 'dirt' | 'paved';
  width_m?: number;
  confidence?: Confidence;
}

export interface Bundle {
  meta: { generated_at: string; min_year: number; max_year: number; geometry_status: string };
  buildings: GeoJSON.FeatureCollection<GeoJSON.Polygon, BuildingProps>;
  features: GeoJSON.FeatureCollection<GeoJSON.Geometry, FeatureProps>;
  tenants: Tenant[];
  photos: Photo[];
  sources: Source[];
  keyframes: Keyframe[];
}
