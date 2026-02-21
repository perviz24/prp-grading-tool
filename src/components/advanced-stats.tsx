"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  mannWhitneyU,
  wilcoxonSignedRank,
  spearmanRho,
  type ScarRecord,
} from "@/lib/statistics";

interface AdvancedStatsProps {
  data: ScarRecord[];
  // Patient-level data with laser group info
  groupedData?: {
    groupA: ScarRecord[];
    groupB: ScarRecord[];
  };
}

function pValueLabel(z: number): { label: string; significant: boolean } {
  // Approximate two-tailed p from z
  if (z >= 3.29) return { label: "p < 0.001", significant: true };
  if (z >= 2.58) return { label: "p < 0.01", significant: true };
  if (z >= 1.96) return { label: "p < 0.05", significant: true };
  if (z >= 1.65) return { label: "p < 0.10", significant: false };
  return { label: "p ≥ 0.10", significant: false };
}

export function AdvancedStats({ data, groupedData }: AdvancedStatsProps) {
  // Mann-Whitney U: Compare groups on each grading measure
  const mwResults =
    groupedData &&
    groupedData.groupA.length >= 2 &&
    groupedData.groupB.length >= 2
      ? {
          fundus: mannWhitneyU(
            groupedData.groupA.map((d) => d.fundusGrade),
            groupedData.groupB.map((d) => d.fundusGrade)
          ),
          actualOct: mannWhitneyU(
            groupedData.groupA.map((d) => d.actualOct),
            groupedData.groupB.map((d) => d.actualOct)
          ),
          predictedOct: mannWhitneyU(
            groupedData.groupA.map((d) => d.predictedOct),
            groupedData.groupB.map((d) => d.predictedOct)
          ),
        }
      : null;

  // Wilcoxon signed-rank: predicted vs actual OCT (paired)
  const wilcoxonPredVsActual =
    data.length >= 5
      ? wilcoxonSignedRank(
          data.map((d) => d.predictedOct),
          data.map((d) => d.actualOct)
        )
      : null;

  // Wilcoxon: revised vs actual OCT (for scars that have revised prediction)
  const revisedData = data.filter(
    (d) => d.revisedOct !== undefined && d.revisedOct !== null
  );
  const wilcoxonRevVsActual =
    revisedData.length >= 5
      ? wilcoxonSignedRank(
          revisedData.map((d) => d.revisedOct ?? d.predictedOct),
          revisedData.map((d) => d.actualOct)
        )
      : null;

  // Spearman: revised OCT vs actual OCT
  const rhoRevisedOct =
    revisedData.length >= 3
      ? spearmanRho(
          revisedData.map((d) => d.revisedOct ?? d.predictedOct),
          revisedData.map((d) => d.actualOct)
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Mann-Whitney U: Group comparisons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Mann-Whitney U — Group Comparisons (A-Modern vs B-Konventionell)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!mwResults ? (
            <p className="text-sm text-muted-foreground">
              Need ≥2 scars in each group to compute. Grade scars from both
              groups first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Measure</TableHead>
                  <TableHead className="text-center">
                    n (A)
                  </TableHead>
                  <TableHead className="text-center">
                    n (B)
                  </TableHead>
                  <TableHead className="text-center">U</TableHead>
                  <TableHead className="text-center">z</TableHead>
                  <TableHead className="text-center">Sig.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(
                  [
                    ["Fundus grade", mwResults.fundus],
                    ["Actual OCT grade", mwResults.actualOct],
                    ["Predicted OCT grade", mwResults.predictedOct],
                  ] as [string, ReturnType<typeof mannWhitneyU>][]
                ).map(([label, result]) => {
                  const pv = result ? pValueLabel(result.z) : null;
                  return (
                    <TableRow key={label}>
                      <TableCell>{label}</TableCell>
                      <TableCell className="text-center">
                        {groupedData!.groupA.length}
                      </TableCell>
                      <TableCell className="text-center">
                        {groupedData!.groupB.length}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {result ? result.u : "—"}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {result ? result.z : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {pv ? (
                          <Badge
                            variant={pv.significant ? "default" : "secondary"}
                          >
                            {pv.label}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Wilcoxon signed-rank: Paired comparisons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Wilcoxon Signed-Rank — Paired Comparisons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comparison</TableHead>
                <TableHead className="text-center">n</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">z</TableHead>
                <TableHead className="text-center">Sig.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Predicted OCT vs Actual OCT</TableCell>
                <TableCell className="text-center">
                  {wilcoxonPredVsActual ? wilcoxonPredVsActual.n : "—"}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {wilcoxonPredVsActual ? wilcoxonPredVsActual.w : "—"}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {wilcoxonPredVsActual ? wilcoxonPredVsActual.z : "—"}
                </TableCell>
                <TableCell className="text-center">
                  {wilcoxonPredVsActual ? (
                    <Badge
                      variant={
                        pValueLabel(wilcoxonPredVsActual.z).significant
                          ? "default"
                          : "secondary"
                      }
                    >
                      {pValueLabel(wilcoxonPredVsActual.z).label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Need ≥5 pairs
                    </span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Revised OCT vs Actual OCT</TableCell>
                <TableCell className="text-center">
                  {wilcoxonRevVsActual ? wilcoxonRevVsActual.n : "—"}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {wilcoxonRevVsActual ? wilcoxonRevVsActual.w : "—"}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {wilcoxonRevVsActual ? wilcoxonRevVsActual.z : "—"}
                </TableCell>
                <TableCell className="text-center">
                  {wilcoxonRevVsActual ? (
                    <Badge
                      variant={
                        pValueLabel(wilcoxonRevVsActual.z).significant
                          ? "default"
                          : "secondary"
                      }
                    >
                      {pValueLabel(wilcoxonRevVsActual.z).label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Need ≥5 revised scars
                    </span>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revision impact: Does AF info improve prediction? */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Revision Impact — Does AF Improve Prediction?
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revisedData.length < 3 ? (
            <p className="text-sm text-muted-foreground">
              Need ≥3 scars with revised predictions to analyze. Revise
              predictions during the AF step to see this analysis.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Revised scars
                  </p>
                  <p className="text-2xl font-bold">{revisedData.length}</p>
                  <p className="text-xs text-muted-foreground">
                    of {data.length} total
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Revised ↔ Actual rho
                  </p>
                  <p className="text-2xl font-bold font-mono">
                    {rhoRevisedOct ?? "—"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Compare Predicted OCT ↔ Actual (from correlations above) with
                Revised OCT ↔ Actual to see if AF imaging improves prediction
                accuracy.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
