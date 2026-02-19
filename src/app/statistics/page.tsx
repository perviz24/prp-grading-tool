"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BasicStats } from "@/components/basic-stats";
import { AdvancedStats } from "@/components/advanced-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import type { ScarRecord } from "@/lib/statistics";

function toScarRecord(s: {
  fundusGrade: number;
  predictedOct: number;
  afGrade: number;
  revisedOct?: number;
  actualOct: number;
  ezIntact: boolean;
}): ScarRecord {
  return {
    fundusGrade: s.fundusGrade,
    predictedOct: s.predictedOct,
    afGrade: s.afGrade,
    revisedOct: s.revisedOct,
    actualOct: s.actualOct,
    ezIntact: s.ezIntact,
  };
}

export default function StatisticsPage() {
  const scars = useQuery(api.scars.listAllWithPatients);
  const isLoading = scars === undefined;
  const allScars = scars ?? [];
  const data = allScars.map(toScarRecord);

  // Group by laser group for Mann-Whitney comparisons
  const groupA = allScars
    .filter((s) => s.laserGroup === "A-Modern")
    .map(toScarRecord);
  const groupB = allScars
    .filter((s) => s.laserGroup === "B-Konventionell")
    .map(toScarRecord);

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

          {/* Statistics sections */}
          {data.length > 0 && (
            <div className="mt-6 space-y-6">
              <BasicStats data={data} />
              <AdvancedStats
                data={data}
                groupedData={{ groupA, groupB }}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
