"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getTimeCategory } from "@/lib/types";
import { exportCsv } from "@/lib/csv-export";

export default function DataPage() {
  const scars = useQuery(api.scars.listAllWithPatients);
  const [filterGroup, setFilterGroup] = useState<string>("all");

  const filtered =
    scars?.filter((s) =>
      filterGroup === "all" ? true : s.laserGroup === filterGroup
    ) ?? [];

  const predictionAccuracy = (predicted: number, actual: number) => {
    const diff = Math.abs(predicted - actual);
    if (diff === 0) return { label: "Exact", variant: "default" as const };
    if (diff === 1) return { label: "±1", variant: "secondary" as const };
    return { label: `±${diff}`, variant: "destructive" as const };
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Data Table
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {scars === undefined
                  ? "Loading..."
                  : `${filtered.length} graded scars`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-[160px] sm:w-[200px]">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  <SelectItem value="A-Modern">A-Modern</SelectItem>
                  <SelectItem value="B-Konventionell">B-Konventionell</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                disabled={filtered.length === 0}
                onClick={() => exportCsv(filtered)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {scars === undefined && (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {scars !== undefined && scars.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-lg font-medium">No graded scars yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Go to Grade &rarr; select a patient &rarr; grade scars first
              </p>
            </div>
          )}

          {/* Filtered empty state */}
          {scars !== undefined &&
            scars.length > 0 &&
            filtered.length === 0 && (
              <div className="mt-12 text-center">
                <p className="text-lg font-medium">
                  No scars in this group
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing the filter above
                </p>
              </div>
            )}

          {/* Data table */}
          {filtered.length > 0 && (
            <div className="mt-6 overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scar</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Fundus</TableHead>
                    <TableHead className="text-center">Predicted</TableHead>
                    <TableHead className="text-center">AF</TableHead>
                    <TableHead className="text-center">Revised</TableHead>
                    <TableHead className="text-center">Actual OCT</TableHead>
                    <TableHead className="text-center">EZ</TableHead>
                    <TableHead className="text-center">Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((scar) => {
                    const acc = predictionAccuracy(
                      scar.predictedOct,
                      scar.actualOct
                    );
                    const timeCategory = getTimeCategory(
                      scar.timeSinceTreatmentYears
                    );
                    return (
                      <TableRow key={scar._id}>
                        <TableCell className="font-mono text-sm">
                          {scar.scarCode}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {scar.patientCode}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              scar.laserGroup === "A-Modern"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {scar.laserGroup === "A-Modern" ? "A" : "B"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {timeCategory}
                        </TableCell>
                        <TableCell className="text-xs">
                          {scar.quadrant} / {scar.zone}
                        </TableCell>
                        <TableCell className="text-center">
                          {scar.fundusGrade}
                        </TableCell>
                        <TableCell className="text-center">
                          {scar.predictedOct}
                        </TableCell>
                        <TableCell className="text-center">
                          {scar.afGrade}
                        </TableCell>
                        <TableCell className="text-center">
                          {scar.revisedOct ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {scar.actualOct}
                        </TableCell>
                        <TableCell className="text-center">
                          {scar.ezIntact ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={acc.variant} className="text-xs">
                            {acc.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
