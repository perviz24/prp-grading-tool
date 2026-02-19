// Statistical computations for PRP study preview
// Disclaimer: these are preview calculations — verify in SPSS

interface ScarRecord {
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
