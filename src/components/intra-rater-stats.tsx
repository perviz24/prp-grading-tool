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
import { weightedKappa } from "@/lib/statistics";

interface RegradePair {
  scarCode: string;
  patientCode: string;
  original: {
    fundusGrade: number;
    predictedOct: number;
    afGrade: number;
    actualOct: number;
  };
  regrade: {
    fundusGrade: number;
    predictedOct: number;
    afGrade: number;
    actualOct: number;
  };
}

interface IntraRaterStatsProps {
  pairs: RegradePair[];
}

function kappaVariant(label: string): "default" | "secondary" | "destructive" {
  if (label === "Almost perfect" || label === "Substantial") return "default";
  if (label === "Moderate" || label === "Fair") return "secondary";
  return "destructive";
}

const MEASURES: {
  label: string;
  field: "fundusGrade" | "predictedOct" | "afGrade" | "actualOct";
  categories: number;
}[] = [
  { label: "Fundus grade", field: "fundusGrade", categories: 3 },
  { label: "Predicted OCT", field: "predictedOct", categories: 4 },
  { label: "AF grade", field: "afGrade", categories: 3 },
  { label: "Actual OCT", field: "actualOct", categories: 4 },
];

export function IntraRaterStats({ pairs }: IntraRaterStatsProps) {
  // Compute exact agreement per scar
  const exactMatches = pairs.filter(
    (p) =>
      p.original.fundusGrade === p.regrade.fundusGrade &&
      p.original.predictedOct === p.regrade.predictedOct &&
      p.original.afGrade === p.regrade.afGrade &&
      p.original.actualOct === p.regrade.actualOct
  ).length;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intra-Rater Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{pairs.length}</p>
              <p className="text-xs text-muted-foreground">Re-graded scars</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{exactMatches}</p>
              <p className="text-xs text-muted-foreground">Exact matches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {pairs.length > 0
                  ? Math.round((exactMatches / pairs.length) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">
                Full agreement rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weighted Kappa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Weighted Kappa — Original vs Re-grade
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {pairs.length} paired observations
          </p>
        </CardHeader>
        <CardContent>
          {pairs.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Need ≥2 re-graded scars to compute Kappa.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Measure</TableHead>
                  <TableHead className="text-center">n</TableHead>
                  <TableHead className="text-center">Kappa</TableHead>
                  <TableHead className="text-center">Agreement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MEASURES.map(({ label, field, categories }) => {
                  const originals = pairs.map((p) => p.original[field]);
                  const regrades = pairs.map((p) => p.regrade[field]);
                  const result = weightedKappa(originals, regrades, categories);
                  return (
                    <TableRow key={field}>
                      <TableCell>{label}</TableCell>
                      <TableCell className="text-center">
                        {pairs.length}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {result ? result.kappa : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {result ? (
                          <Badge variant={kappaVariant(result.label)}>
                            {result.label}
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

      {/* Per-scar detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Per-Scar Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scar</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-center">Fundus</TableHead>
                  <TableHead className="text-center">Pred. OCT</TableHead>
                  <TableHead className="text-center">AF</TableHead>
                  <TableHead className="text-center">Act. OCT</TableHead>
                  <TableHead className="text-center">Match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairs.map((pair) => {
                  const allMatch =
                    pair.original.fundusGrade === pair.regrade.fundusGrade &&
                    pair.original.predictedOct === pair.regrade.predictedOct &&
                    pair.original.afGrade === pair.regrade.afGrade &&
                    pair.original.actualOct === pair.regrade.actualOct;
                  return (
                    <>
                      <TableRow key={`${pair.scarCode}-orig`}>
                        <TableCell className="font-mono text-sm" rowSpan={2}>
                          {pair.scarCode}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Original
                        </TableCell>
                        <TableCell className="text-center">
                          {pair.original.fundusGrade}
                        </TableCell>
                        <TableCell className="text-center">
                          {pair.original.predictedOct}
                        </TableCell>
                        <TableCell className="text-center">
                          {pair.original.afGrade}
                        </TableCell>
                        <TableCell className="text-center">
                          {pair.original.actualOct}
                        </TableCell>
                        <TableCell className="text-center" rowSpan={2}>
                          <Badge
                            variant={allMatch ? "default" : "secondary"}
                          >
                            {allMatch ? "Exact" : "Differs"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow
                        key={`${pair.scarCode}-regrade`}
                        className="border-t-0"
                      >
                        <TableCell className="text-xs text-amber-600 dark:text-amber-400">
                          Re-grade
                        </TableCell>
                        <TableCell
                          className={`text-center ${
                            pair.original.fundusGrade !== pair.regrade.fundusGrade
                              ? "font-bold text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {pair.regrade.fundusGrade}
                        </TableCell>
                        <TableCell
                          className={`text-center ${
                            pair.original.predictedOct !==
                            pair.regrade.predictedOct
                              ? "font-bold text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {pair.regrade.predictedOct}
                        </TableCell>
                        <TableCell
                          className={`text-center ${
                            pair.original.afGrade !== pair.regrade.afGrade
                              ? "font-bold text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {pair.regrade.afGrade}
                        </TableCell>
                        <TableCell
                          className={`text-center ${
                            pair.original.actualOct !== pair.regrade.actualOct
                              ? "font-bold text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {pair.regrade.actualOct}
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
