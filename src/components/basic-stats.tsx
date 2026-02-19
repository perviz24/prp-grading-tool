"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  crossTable,
  spearmanRho,
  predictionAccuracySummary,
  ezByOctGrade,
  type ScarRecord,
} from "@/lib/statistics";

const FUNDUS_LABELS = ["Grade 1", "Grade 2", "Grade 3"];
const OCT_LABELS = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"];

interface BasicStatsProps {
  data: ScarRecord[];
}

export function BasicStats({ data }: BasicStatsProps) {
  const fundusVsOct =
    data.length > 0
      ? crossTable(data, "fundusGrade", "actualOct", FUNDUS_LABELS, OCT_LABELS)
      : null;

  const rhoFundusOct =
    data.length >= 3
      ? spearmanRho(
          data.map((d) => d.fundusGrade),
          data.map((d) => d.actualOct)
        )
      : null;
  const rhoAfOct =
    data.length >= 3
      ? spearmanRho(
          data.map((d) => d.afGrade),
          data.map((d) => d.actualOct)
        )
      : null;
  const rhoPredictedOct =
    data.length >= 3
      ? spearmanRho(
          data.map((d) => d.predictedOct),
          data.map((d) => d.actualOct)
        )
      : null;

  const accuracy = predictionAccuracySummary(data);
  const ezData = ezByOctGrade(data);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.length} scars graded
          </p>
        </CardContent>
      </Card>

      {/* Prediction accuracy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Prediction Accuracy (Fundus → OCT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{accuracy.exactPct}%</p>
              <p className="text-xs text-muted-foreground">
                Exact ({accuracy.exact}/{accuracy.total})
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{accuracy.offBy1Pct}%</p>
              <p className="text-xs text-muted-foreground">
                ±1 ({accuracy.offBy1}/{accuracy.total})
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">
                {accuracy.offBy2PlusPct}%
              </p>
              <p className="text-xs text-muted-foreground">
                ±2+ ({accuracy.offBy2Plus}/{accuracy.total})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correlations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spearman Correlations (rho)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comparison</TableHead>
                <TableHead className="text-center">rho</TableHead>
                <TableHead className="text-center">n</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Fundus grade ↔ Actual OCT</TableCell>
                <TableCell className="text-center font-mono">
                  {rhoFundusOct !== null ? rhoFundusOct : "—"}
                </TableCell>
                <TableCell className="text-center">{data.length}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>AF grade ↔ Actual OCT</TableCell>
                <TableCell className="text-center font-mono">
                  {rhoAfOct !== null ? rhoAfOct : "—"}
                </TableCell>
                <TableCell className="text-center">{data.length}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Predicted OCT ↔ Actual OCT</TableCell>
                <TableCell className="text-center font-mono">
                  {rhoPredictedOct !== null ? rhoPredictedOct : "—"}
                </TableCell>
                <TableCell className="text-center">{data.length}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cross-table: Fundus × OCT */}
      {fundusVsOct && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Cross-table: Fundus Grade × Actual OCT Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fundus ↓ / OCT →</TableHead>
                    {OCT_LABELS.map((l) => (
                      <TableHead key={l} className="text-center">
                        {l}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-semibold">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FUNDUS_LABELS.map((label, ri) => (
                    <TableRow key={label}>
                      <TableCell className="font-medium">{label}</TableCell>
                      {fundusVsOct.matrix[ri].map((count, ci) => (
                        <TableCell key={ci} className="text-center">
                          {count > 0 ? (
                            <Badge
                              variant={ri === ci ? "default" : "secondary"}
                            >
                              {count}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold">
                        {fundusVsOct.rowTotals[ri]}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-semibold">Total</TableCell>
                    {fundusVsOct.colTotals.map((t, i) => (
                      <TableCell
                        key={i}
                        className="text-center font-semibold"
                      >
                        {t}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">
                      {fundusVsOct.total}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EZ intact by OCT grade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">EZ Intact by OCT Grade</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OCT Grade</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">EZ Intact</TableHead>
                <TableHead className="text-center">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ezData.map((row) => (
                <TableRow key={row.grade}>
                  <TableCell>Grade {row.grade}</TableCell>
                  <TableCell className="text-center">{row.total}</TableCell>
                  <TableCell className="text-center">{row.intact}</TableCell>
                  <TableCell className="text-center">
                    {row.total > 0 ? `${row.intactPct}%` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
