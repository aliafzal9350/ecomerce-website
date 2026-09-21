/**
 * Luxury & Inspired Product Metadata Definitions for Medusa v2
 */

export interface PerfumeMetadata {
  concentration: 'Parfum' | 'Extrait de Parfum' | 'Eau de Parfum' | 'Eau de Toilette';
  scent_family: 'Woody' | 'Amber / Oriental' | 'Floral' | 'Fresh / Citrus' | 'Gourmand' | 'Aromatic';
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  longevity_hours: number;
  sillage: 'Intimate' | 'Moderate' | 'Strong' | 'Enormous';
  seasonality: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[];
  inspired_by_profile?: string;
}

export interface HandbagMetadata {
  material_finish: 'Quilted Leather' | 'Grained Calfskin' | 'Smooth Patent' | 'Suede' | 'Canvas';
  hardware_tone: 'Polished Gold' | 'Brushed Champagne Gold' | 'Silver Palladium' | 'Ruthenium';
  strap_type: 'Chain & Leather' | 'Crossbody Leather' | 'Top Handle Only';
  dimensions_cm: {
    length: number;
    width: number;
    height: number;
  };
}

export interface FootwearMetadata {
  silhouette: 'Stiletto Pump' | 'Slingback' | 'Strappy Sandal' | 'Platform Heel' | 'Mule';
  heel_height_cm: number;
  material: string;
  hardware_tone?: 'Gold' | 'Silver' | 'None';
  fit_guidance: 'True to size' | 'Runs small (size up)' | 'Runs large (size down)';
}

export interface WatchMetadata {
  movement_type: 'Automatic' | 'Quartz' | 'Mechanical Manual';
  case_diameter_mm: number;
  bezel_style: 'Fluted' | 'Smooth' | 'Diamond-set' | 'Ceramic Tachymeter';
  case_material: 'Stainless Steel' | 'Two-Tone Gold & Steel' | 'Rose Gold Finish';
  dial_color: string;
  water_resistance_atm: number;
}

export type LuxuryProductMetadata =
  | PerfumeMetadata
  | HandbagMetadata
  | FootwearMetadata
  | WatchMetadata;
