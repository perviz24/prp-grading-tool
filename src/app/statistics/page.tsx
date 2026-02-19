"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
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
import { AlertTriangle } from "lucide-react";
import {
  crossTable,
  spearmanRho,
  predictionAccuracySummary,
  ezByOctGrade,
} from "@/lib/statistics";

const FUNDUS_LABELS = ["Grade 1", "Grade 2", "Grade 3"];
const OCT_LABELS = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"];

export default function StatisticsPage() {
  const scars = useQuery(api.scars.listAll);
  const isLoading = scars === undefined;
  const data = scars ?? [];

  // Cross-table: Fundus × Actual OCT
  const fundusVsOct = data.length > 0
    ? crossTable(data, "fundusGrade", "actualOct", FUNDUS_LABELS, OCT_LABELS)
    : null;

  // Spearman correlations
  const rhoFundusOct = data.length >= 3
    ? spearmanRho(data.map((d) => d.fundusGrade), data.map((d) => d.actualOct))
    : null;
  const rhoAfOct = data.length >= 3
    ? spearmanRho(data.map((d) => d.afGrade), data.map((d) => d.actualOct))
    : null;
  const rhoPredictedOct = data.length >= 3
    ? spearmanRho(data.map((d) => d.predictedOct), data.map((d) => d.actualOct))
    : null;

  const accuracy = predictionAccuracySummary(data);
  const ezData = ezByOctGrade(data);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Statistics Preview
          </h1>

          {/* Transparency disclaimer */}
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>Förhandsvisning — verifiera i SPSS.</strong> These are
              preview calculations computed in the browser. Always verify
              results using SPSS or R before publication.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && data.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-lg font-medium">No data yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Grade some scars first, then return here for statistics
              </p>
            </div>
          )}

          {/* Statistics cards */}
          {data.length > 0 && (
            <div className="mt-6 space-y-6">
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
                  <CardTitle className="text-lg">
                    Spearman Correlations (rho)
                  </CardTitle>
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
                                      variant={
                                        ri === ci ? "default" : "secondary"
                                      }
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
                  <CardTitle className="text-lg">
                    EZ Intact by OCT Grade
                  </CardTitle>
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
