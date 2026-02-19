"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTimeCategory } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Doc } from "../../convex/_generated/dataModel";

interface PatientListProps {
  patients: Doc<"patients">[];
}

export function PatientList({ patients }: PatientListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients ({patients.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patients.map((p) => {
          const timeCategory = p.timeSinceTreatmentYears != null
            ? getTimeCategory(p.timeSinceTreatmentYears)
            : null;
          const isIncomplete = !p.laserGroup || !p.laserApparatus || p.timeSinceTreatmentYears == null;
          return (
            <div
              key={p._id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.patientCode}</span>
                  {p.laserGroup && (
                    <Badge variant="outline">{p.laserGroup}</Badge>
                  )}
                  {p.laserApparatus && (
                    <Badge variant="secondary">{p.laserApparatus}</Badge>
                  )}
                  {timeCategory && (
                    <Badge
                      variant={
                        timeCategory === "Recent ≤2yr" ? "default" : "secondary"
                      }
                    >
                      {timeCategory}
                    </Badge>
                  )}
                  {isIncomplete && (
                    <Badge variant="destructive" className="text-xs">
                      Incomplete
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {p.timeSinceTreatmentYears != null
                    ? `${p.timeSinceTreatmentYears}yr`
                    : "Time not set"}
                  {p.power_mW ? ` • ${p.power_mW}mW` : ""}
                  {p.spotSize_um ? ` • ${p.spotSize_um}μm` : ""}
                  {p.duration_ms ? ` • ${p.duration_ms}ms` : ""}
                  {p.numBurns ? ` • ${p.numBurns} burns` : ""}
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/grade/${p._id}`}>
                  Grade scars
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
