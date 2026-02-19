// Statistical computations for PRP study preview
// Disclaimer: these are preview calculations — verify in SPSS

export interface ScarRecord {
  fundusGrade: number;
  predictedOct: number;
  afGrade: number;
  revisedOct?: number;
  actualOct: number;
  ezIntact: boolean;
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

// EZ intact by OCT grade
export function ezByOctGrade(data: ScarRecord[]) {
  const grades = [1, 2, 3, 4];
  return grades.map((grade) => {
    const subset = data.filter((d) => d.actualOct === grade);
    const intact = subset.filter((d) => d.ezIntact).length;
    return {
      grade,
      total: subset.length,
      intact,
      intactPct: subset.length > 0 ? Math.round((intact / subset.length) * 100) : 0,
    };
  });
}
