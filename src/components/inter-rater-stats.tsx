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

interface ScarEntry {
  _id: string;
  scarCode: string;
  graderId: string;
  patientCode: string;
  fundusGrade: number;
  predictedOct: number;
  afGrade: number;
  actualOct: number;
  ezStatus: string;
}

interface InterRaterStatsProps {
  scars: ScarEntry[];
  graderIds: string[];
}

// Group scars by scarCode — for each scar, collect all grader ratings
function groupByScar(scars: ScarEntry[]) {
  const map = new Map<string, ScarEntry[]>();
  for (const s of scars) {
    const existing = map.get(s.scarCode) ?? [];
    existing.push(s);
    map.set(s.scarCode, existing);
  }
  return map;
}

// Extract paired ratings for two graders on a specific measure
function pairedRatings(
  grouped: Map<string, ScarEntry[]>,
  graderA: string,
  graderB: string,
  field: keyof Pick<ScarEntry, "fundusGrade" | "predictedOct" | "afGrade" | "actualOct">
): { ratingsA: number[]; ratingsB: number[] } {
  const ratingsA: number[] = [];
  const ratingsB: number[] = [];
  for (const entries of grouped.values()) {
    const a = entries.find((e) => e.graderId === graderA);
    const b = entries.find((e) => e.graderId === graderB);
    if (a && b) {
      ratingsA.push(a[field]);
      ratingsB.push(b[field]);
    }
  }
  return { ratingsA, ratingsB };
}

function kappaVariant(label: string): "default" | "secondary" | "destructive" {
  if (label === "Almost perfect" || label === "Substantial") return "default";
  if (label === "Moderate" || label === "Fair") return "secondary";
  return "destructive";
}

function truncateGraderId(id: string) {
  // Show first 8 characters for readability
  return id.length > 12 ? `${id.slice(0, 8)}...` : id;
}

const MEASURES: {
  label: string;
  field: keyof Pick<ScarEntry, "fundusGrade" | "predictedOct" | "afGrade" | "actualOct">;
  categories: number;
}[] = [
  { label: "Fundus grade", field: "fundusGrade", categories: 3 },
  { label: "Predicted OCT", field: "predictedOct", categories: 4 },
  { label: "AF grade", field: "afGrade", categories: 3 },
  { label: "Actual OCT", field: "actualOct", categories: 4 },
];

export function InterRaterStats({ scars, graderIds }: InterRaterStatsProps) {
  const grouped = groupByScar(scars);

  // Count scars graded by multiple graders
  const multiGraded = Array.from(grouped.values()).filter(
    (entries) => {
      const uniqueGraders = new Set(entries.map((e) => e.graderId));
      return uniqueGraders.size >= 2;
    }
  );

  // Generate grader pairs
  const pairs: [string, string][] = [];
  for (let i = 0; i < graderIds.length; i++) {
    for (let j = i + 1; j < graderIds.length; j++) {
      pairs.push([graderIds[i], graderIds[j]]);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{graderIds.length}</p>
              <p className="text-xs text-muted-foreground">Graders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{scars.length}</p>
              <p className="text-xs text-muted-foreground">Total ratings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{multiGraded.length}</p>
              <p className="text-xs text-muted-foreground">
                Scars rated by 2+ graders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kappa per grader pair */}
      {pairs.map(([gA, gB]) => {
        const pairScars = pairedRatings(grouped, gA, gB, "fundusGrade");
        const pairCount = pairScars.ratingsA.length;

        return (
          <Card key={`${gA}-${gB}`}>
            <CardHeader>
              <CardTitle className="text-lg">
                Weighted Kappa — {truncateGraderId(gA)} vs{" "}
                {truncateGraderId(gB)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {pairCount} scars graded by both
              </p>
            </CardHeader>
            <CardContent>
              {pairCount < 2 ? (
                <p className="text-sm text-muted-foreground">
                  Need ≥2 shared scars to compute Kappa.
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
                      const { ratingsA, ratingsB } = pairedRatings(
                        grouped,
                        gA,
                        gB,
                        field
                      );
                      const result = weightedKappa(
                        ratingsA,
                        ratingsB,
                        categories
                      );
                      return (
                        <TableRow key={field}>
                          <TableCell>{label}</TableCell>
                          <TableCell className="text-center">
                            {ratingsA.length}
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
        );
      })}

      {/* Agreement detail per scar (for scars with 2+ graders) */}
      {multiGraded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Per-Scar Agreement Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scar</TableHead>
                    <TableHead>Grader</TableHead>
                    <TableHead className="text-center">Fundus</TableHead>
                    <TableHead className="text-center">Pred. OCT</TableHead>
                    <TableHead className="text-center">AF</TableHead>
                    <TableHead className="text-center">Act. OCT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {multiGraded.flatMap(([first, ...rest]) => {
                    const entries = [first, ...rest];
                    return entries.map((entry, idx) => (
                      <TableRow
                        key={entry._id}
                        className={idx > 0 ? "border-t-0" : ""}
                      >
                        <TableCell className="font-mono text-sm">
                          {idx === 0 ? entry.scarCode : ""}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {truncateGraderId(entry.graderId)}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.fundusGrade}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.predictedOct}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.afGrade}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.actualOct}
                        </TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
