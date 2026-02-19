// SPSS-formatted CSV export for scar grading data

interface ScarRow {
  scarCode: string;
  patientCode: string;
  laserGroup?: string;
  timeSinceTreatmentYears?: number;
  quadrant: string;
  zone: string;
  fundusGrade: number;
  fundusConfidence: string;
  predictedOct: number;
  afGrade: number;
  afConfidence?: string;
  revisedOct?: number;
  actualOct: number;
  ezStatus: string;
  ezConfidence?: string;
  graderId: string;
  isRegradeOf?: string;
  createdAt: number;
}

const quadrantCode: Record<string, number> = {
  Superior: 1,
  Inferior: 2,
  Nasal: 3,
  Temporal: 4,
};
const zoneCode: Record<string, number> = { Central: 1, Mid: 2, Peripheral: 3 };
const confCode: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
const groupCode: Record<string, number> = {
  "A-Modern": 1,
  "B-Konventionell": 2,
};

const headers = [
  "scar_code",
  "patient_code",
  "laser_group",
  "laser_group_num",
  "time_years",
  "time_category",
  "quadrant",
  "quadrant_num",
  "zone",
  "zone_num",
  "fundus_grade",
  "fundus_confidence",
  "fundus_confidence_num",
  "predicted_oct",
  "af_grade",
  "af_confidence",
  "af_confidence_num",
  "revised_oct",
  "actual_oct",
  "ez_status",
  "ez_confidence",
  "ez_confidence_num",
  "prediction_diff",
  "prediction_exact",
  "grader_id",
  "is_regrade",
  "timestamp",
];

export function exportCsv(rows: ScarRow[]) {
  const csvRows = rows.map((r) => [
    r.scarCode,
    r.patientCode,
    r.laserGroup ?? "",
    r.laserGroup ? (groupCode[r.laserGroup] ?? "") : "",
    r.timeSinceTreatmentYears ?? "",
    r.timeSinceTreatmentYears != null ? (r.timeSinceTreatmentYears <= 2 ? 1 : 2) : "",
    r.quadrant,
    quadrantCode[r.quadrant] ?? "",
    r.zone,
    zoneCode[r.zone] ?? "",
    r.fundusGrade,
    r.fundusConfidence,
    confCode[r.fundusConfidence] ?? "",
    r.predictedOct,
    r.afGrade,
    r.afConfidence ?? "",
    r.afConfidence ? (confCode[r.afConfidence] ?? "") : "",
    r.revisedOct ?? "",
    r.actualOct,
    r.ezStatus,
    r.ezConfidence ?? "",
    r.ezConfidence ? (confCode[r.ezConfidence] ?? "") : "",
    r.predictedOct - r.actualOct,
    r.predictedOct === r.actualOct ? 1 : 0,
    r.graderId,
    r.isRegradeOf ? 1 : 0,
    new Date(r.createdAt).toISOString(),
  ]);

  const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prp-scars-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
