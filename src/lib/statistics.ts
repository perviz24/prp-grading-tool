// Statistical computations for PRP study preview
// Disclaimer: these are preview calculations — verify in SPSS

export interface ScarRecord {
  fundusGrade: number;
  predictedOct: number;
  afGrade: number;
  revisedOct?: number;
  actualOct: number;
  ezStatus: string;
}

// Cross-tabulation: rows × columns → count matrix
export function crossTable(
  data: ScarRecord[],
  rowKey: keyof ScarRecord,
  colKey: keyof ScarRecord,
  rowLabels: string[],
  colLabels: string[]
): { matrix: number[][]; rowTotals: number[]; colTotals: number[]; total: number } {
  const rowValues = data.map((d) => d[rowKey] as number);
  const colValues = data.map((d) => d[colKey] as number);

  const matrix = rowLabels.map((_, ri) =>
    colLabels.map(
      (_, ci) =>
        rowValues.filter(
          (rv, i) => rv === ri + 1 && colValues[i] === ci + 1
        ).length
    )
  );

  const rowTotals = matrix.map((row) => row.reduce((a, b) => a + b, 0));
  const colTotals = colLabels.map((_, ci) =>
    matrix.reduce((sum, row) => sum + row[ci], 0)
  );
  const total = rowTotals.reduce((a, b) => a + b, 0);

  return { matrix, rowTotals, colTotals, total };
}

// Spearman's rank correlation coefficient
export function spearmanRho(x: number[], y: number[]): number | null {
  const n = x.length;
  if (n < 3) return null;

  // Rank with average ties
  const rank = (arr: number[]) => {
    const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(n).fill(0);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j < n - 1 && sorted[j + 1].v === sorted[j].v) j++;
      const avgRank = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[sorted[k].i] = avgRank;
      i = j + 1;
    }
    return ranks;
  };

  const rx = rank(x);
  const ry = rank(y);

  const d2 = rx.reduce((sum, r, i) => sum + (r - ry[i]) ** 2, 0);
  const rho = 1 - (6 * d2) / (n * (n * n - 1));
  return Math.round(rho * 1000) / 1000;
}

// Prediction accuracy summary
export function predictionAccuracySummary(data: ScarRecord[]) {
  const exact = data.filter((d) => d.predictedOct === d.actualOct).length;
  const offBy1 = data.filter(
    (d) => Math.abs(d.predictedOct - d.actualOct) === 1
  ).length;
  const offBy2Plus = data.length - exact - offBy1;

  return {
    total: data.length,
    exact,
    exactPct: data.length > 0 ? Math.round((exact / data.length) * 100) : 0,
    offBy1,
    offBy1Pct: data.length > 0 ? Math.round((offBy1 / data.length) * 100) : 0,
    offBy2Plus,
    offBy2PlusPct:
      data.length > 0 ? Math.round((offBy2Plus / data.length) * 100) : 0,
  };
}

// Mann-Whitney U test (two independent groups, ordinal data)
// Returns U statistic and approximate z-score
export function mannWhitneyU(
  group1: number[],
  group2: number[]
): { u: number; z: number } | null {
  const n1 = group1.length;
  const n2 = group2.length;
  if (n1 < 2 || n2 < 2) return null;

  // Combined ranking
  const combined = [
    ...group1.map((v) => ({ v, g: 1 })),
    ...group2.map((v) => ({ v, g: 2 })),
  ].sort((a, b) => a.v - b.v);

  const n = combined.length;
  const ranks = new Array(n).fill(0);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n - 1 && combined[j + 1].v === combined[j].v) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[k] = avg;
    i = j + 1;
  }

  const r1 = ranks
    .filter((_, idx) => combined[idx].g === 1)
    .reduce((a, b) => a + b, 0);
  const u1 = r1 - (n1 * (n1 + 1)) / 2;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);

  const mu = (n1 * n2) / 2;
  const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = sigma > 0 ? Math.round(((u - mu) / sigma) * 1000) / 1000 : 0;

  return { u: Math.round(u), z: Math.abs(z) };
}

// Wilcoxon signed-rank test (paired data)
// Returns W statistic (smaller of W+ and W-)
export function wilcoxonSignedRank(
  before: number[],
  after: number[]
): { w: number; z: number; n: number } | null {
  if (before.length !== after.length || before.length < 5) return null;

  const diffs = before
    .map((b, i) => after[i] - b)
    .filter((d) => d !== 0);
  const n = diffs.length;
  if (n < 5) return null;

  const absDiffs = diffs.map((d) => ({ abs: Math.abs(d), sign: d > 0 ? 1 : -1 }));
  absDiffs.sort((a, b) => a.abs - b.abs);

  // Assign ranks with ties
  const ranks = new Array(n).fill(0);
  let idx = 0;
  while (idx < n) {
    let j = idx;
    while (j < n - 1 && absDiffs[j + 1].abs === absDiffs[j].abs) j++;
    const avg = (idx + j) / 2 + 1;
    for (let k = idx; k <= j; k++) ranks[k] = avg;
    idx = j + 1;
  }

  const wPlus = ranks
    .filter((_, i) => absDiffs[i].sign === 1)
    .reduce((a, b) => a + b, 0);
  const wMinus = ranks
    .filter((_, i) => absDiffs[i].sign === -1)
    .reduce((a, b) => a + b, 0);
  const w = Math.min(wPlus, wMinus);

  const mu = (n * (n + 1)) / 4;
  const sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
  const z = sigma > 0 ? Math.abs(Math.round(((w - mu) / sigma) * 1000) / 1000) : 0;

  return { w: Math.round(w), z, n };
}

// Weighted Kappa (linear weights) for inter-rater agreement on ordinal scales
// Returns kappa value and interpretation label
export function weightedKappa(
  rater1: number[],
  rater2: number[],
  numCategories: number
): { kappa: number; label: string } | null {
  if (rater1.length !== rater2.length || rater1.length < 2) return null;
  const n = rater1.length;
  const k = numCategories;

  // Build observed confusion matrix
  const observed: number[][] = Array.from({ length: k }, () =>
    new Array(k).fill(0)
  );
  for (let i = 0; i < n; i++) {
    const r1 = rater1[i] - 1; // convert 1-based to 0-based
    const r2 = rater2[i] - 1;
    if (r1 >= 0 && r1 < k && r2 >= 0 && r2 < k) {
      observed[r1][r2]++;
    }
  }

  // Row and column marginals
  const rowSums = observed.map((row) => row.reduce((a, b) => a + b, 0));
  const colSums = Array.from({ length: k }, (_, j) =>
    observed.reduce((sum, row) => sum + row[j], 0)
  );

  // Linear weight matrix: w(i,j) = 1 - |i-j| / (k-1)
  const weight = (i: number, j: number) =>
    k > 1 ? 1 - Math.abs(i - j) / (k - 1) : 1;

  // Weighted observed agreement
  let po = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      po += weight(i, j) * (observed[i][j] / n);
    }
  }

  // Weighted expected agreement (by chance)
  let pe = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      pe += weight(i, j) * ((rowSums[i] / n) * (colSums[j] / n));
    }
  }

  if (pe >= 1) return { kappa: 1, label: "Perfect" };
  const kappa = Math.round(((po - pe) / (1 - pe)) * 1000) / 1000;

  // Landis & Koch interpretation
  let label: string;
  if (kappa >= 0.81) label = "Almost perfect";
  else if (kappa >= 0.61) label = "Substantial";
  else if (kappa >= 0.41) label = "Moderate";
  else if (kappa >= 0.21) label = "Fair";
  else if (kappa >= 0) label = "Slight";
  else label = "Poor";

  return { kappa, label };
}

// EZ status by OCT grade
export function ezByOctGrade(data: ScarRecord[]) {
  const grades = [1, 2, 3, 4];
  return grades.map((grade) => {
    const subset = data.filter((d) => d.actualOct === grade);
    const intact = subset.filter((d) => d.ezStatus === "Intact").length;
    const disrupted = subset.filter((d) => d.ezStatus === "Disrupted").length;
    const notVisible = subset.filter((d) => d.ezStatus === "Not visible").length;
    return {
      grade,
      total: subset.length,
      intact,
      disrupted,
      notVisible,
      intactPct: subset.length > 0 ? Math.round((intact / subset.length) * 100) : 0,
    };
  });
}
