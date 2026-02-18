// Shared types used across components
// These mirror the Convex schema but for client-side use

export type LaserGroup = "A-Modern" | "B-Konventionell";
export type LaserApparatus = "Valon" | "Navilas" | "Argon" | "Other";
export type LaserPattern = "Single" | "Pattern";
export type Quadrant = "Superior" | "Inferior" | "Nasal" | "Temporal";
export type Zone = "Central" | "Mid" | "Peripheral";
export type Confidence = "Low" | "Medium" | "High";

export interface PatientData {
  patientCode: string;
  laserGroup: LaserGroup;
  laserApparatus: LaserApparatus;
  power_mW?: number;
  spotSize_um?: number;
  duration_ms?: number;
  pattern: LaserPattern;
  wavelength_nm?: number;
  numBurns?: number;
  timeSinceTreatmentYears: number;
}

export interface ScarData {
  scarCode: string;
  quadrant: Quadrant;
  zone: Zone;
  fundusGrade: number;
  fundusConfidence: Confidence;
  predictedOct: number;
  afGrade: number;
  afConfidence?: Confidence;
  revisedOct?: number;
  actualOct: number;
  ezIntact: boolean;
  comment?: string;
  stepTimestamps: StepTimestamps;
}

export interface StepTimestamps {
  fundusStart?: number;
  fundusEnd?: number;
  predictStart?: number;
  predictEnd?: number;
  afStart?: number;
  afEnd?: number;
  reviseStart?: number;
  reviseEnd?: number;
  octStart?: number;
  octEnd?: number;
  confirmEnd?: number;
}

// Grade descriptions for reference images
export const FUNDUS_GRADES = {
  1: { label: "Grade 1", description: "Mild — light, faint scar" },
  2: { label: "Grade 2", description: "Moderate — visible, well-defined scar" },
  3: { label: "Grade 3", description: "Heavy — dark, intense scar" },
} as const;

export const OCT_GRADES = {
  1: { label: "Grade 1", description: "Superficial — inner retina only" },
  2: { label: "Grade 2", description: "Partial — into outer nuclear layer" },
  3: { label: "Grade 3", description: "Full — reaching RPE" },
  4: { label: "Grade 4", description: "Deep — through RPE, choroidal damage" },
} as const;

export const AF_GRADES = {
  1: { label: "Grade 1", description: "Minimal hypo-AF" },
  2: { label: "Grade 2", description: "Moderate hypo-AF" },
  3: { label: "Grade 3", description: "Marked hypo-AF" },
  4: { label: "Grade 4", description: "Complete hypo-AF with hyper-AF ring" },
} as const;

// Compute time category based on 2-year cutoff
export function getTimeCategory(years: number): "Recent ≤2yr" | "Mature >2yr" {
  return years <= 2 ? "Recent ≤2yr" : "Mature >2yr";
}
