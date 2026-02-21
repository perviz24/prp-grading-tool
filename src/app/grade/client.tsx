"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PatientForm } from "@/components/patient-form";
import { PatientList } from "@/components/patient-list";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function GradePageClient() {
  const patients = useQuery(api.patients.list);
  const nextCode = useQuery(api.patients.nextCode);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Grade Scars
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create a patient, then grade their scars using the 6-step protocol
            </p>
          </div>

          {/* New Patient Form */}
          {nextCode === undefined ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : (
            <PatientForm nextCode={nextCode} />
          )}

          {/* Existing Patients */}
          {patients === undefined ? (
            <Skeleton className="h-[200px] w-full rounded-lg" />
          ) : patients.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                No patients yet. Create your first patient above.
              </p>
            </div>
          ) : (
            <PatientList patients={patients} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
