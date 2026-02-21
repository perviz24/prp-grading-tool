"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GradingWizard } from "@/components/grading-wizard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { getTimeCategory } from "@/lib/types";
import { PatientEditDialog } from "@/components/patient-edit-dialog";
import { useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";

export function PatientGradePageClient() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as Id<"patients">;

  const patient = useQuery(api.patients.get, { patientId });
  const scars = useQuery(api.scars.listByPatient, { patientId });
  const nextScarCode = useQuery(api.scars.nextScarCode, { patientId });

  const [isGrading, setIsGrading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Loading state
  if (patient === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Patient not found or unauthorized
  if (patient === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="rounded-lg border border-dashed p-8 text-center space-y-4">
              <p className="text-muted-foreground">
                Patient not found or you don&apos;t have access.
              </p>
              <Button variant="outline" onClick={() => router.push("/grade")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to patients
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const timeCategory = patient.timeSinceTreatmentYears != null
    ? getTimeCategory(patient.timeSinceTreatmentYears)
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          {/* Back button + patient info */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/grade")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                All patients
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {patient.patientCode}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {patient.laserGroup && (
                  <Badge variant="outline">{patient.laserGroup}</Badge>
                )}
                {patient.laserApparatus && (
                  <Badge variant="secondary">{patient.laserApparatus}</Badge>
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
                {(!patient.laserGroup || !patient.laserApparatus || patient.timeSinceTreatmentYears == null) && (
                  <Badge variant="destructive" className="text-xs">
                    Incomplete
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {patient.timeSinceTreatmentYears != null
                  ? `${patient.timeSinceTreatmentYears}yr`
                  : "Time not set"}
                {patient.power_mW ? ` • ${patient.power_mW}mW` : ""}
                {patient.spotSize_um ? ` • ${patient.spotSize_um}μm` : ""}
                {patient.duration_ms ? ` • ${patient.duration_ms}ms` : ""}
                {patient.numBurns ? ` • ${patient.numBurns} burns` : ""}
              </p>
            </div>
          </div>

          {/* Edit patient dialog */}
          <PatientEditDialog
            open={isEditing}
            onOpenChange={setIsEditing}
            patientId={patientId}
            patient={patient}
          />

          {/* Grading wizard or new scar button */}
          {isGrading && nextScarCode ? (
            <GradingWizard
              patientId={patientId}
              scarCode={nextScarCode}
              onComplete={() => setIsGrading(false)}
            />
          ) : (
            <Button onClick={() => setIsGrading(true)} disabled={!nextScarCode}>
              <Plus className="mr-2 h-4 w-4" />
              Grade new scar
            </Button>
          )}

          {/* Existing scars list */}
          {scars === undefined ? (
            <Skeleton className="h-[200px] w-full rounded-lg" />
          ) : scars.length === 0 && !isGrading ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                No scars graded yet. Click &quot;Grade new scar&quot; to start.
              </p>
            </div>
          ) : scars.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Graded Scars ({scars.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scars.map((scar) => (
                  <div
                    key={scar._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scar.scarCode}</span>
                        <Badge variant="outline">
                          {scar.quadrant} / {scar.zone}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Fundus: {scar.fundusGrade} • OCT predicted:{" "}
                        {scar.predictedOct} • AF: {scar.afGrade} • OCT actual:{" "}
                        {scar.actualOct}
                        {scar.revisedOct
                          ? ` • Revised: ${scar.revisedOct}`
                          : ""}
                      </div>
                    </div>
                    <Badge
                      variant={
                        (scar.revisedOct ?? scar.predictedOct) ===
                        scar.actualOct
                          ? "default"
                          : "secondary"
                      }
                    >
                      {(scar.revisedOct ?? scar.predictedOct) ===
                      scar.actualOct
                        ? "Correct"
                        : `Off by ${Math.abs((scar.revisedOct ?? scar.predictedOct) - scar.actualOct)}`}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
