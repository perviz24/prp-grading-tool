"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { InterRaterStats } from "@/components/inter-rater-stats";
import { AlertTriangle, Users } from "lucide-react";

export function InterRaterPageClient() {
  const scars = useQuery(api.scars.listAllForInterRater);
  const graders = useQuery(api.scars.listGraders);
  const isLoading = scars === undefined || graders === undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Inter-Rater Reliability
            </h1>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>Preview — verify in SPSS.</strong> Weighted Kappa
              (linear weights) computed in-browser. Multiple graders must
              grade the same scars for agreement analysis.
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

          {/* No graders / no data */}
          {!isLoading && (graders.length < 2 || (scars?.length ?? 0) === 0) && (
            <div className="mt-12 text-center">
              <p className="text-lg font-medium">
                {graders.length < 2
                  ? "Need at least 2 graders"
                  : "No graded scars yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {graders.length < 2
                  ? "Have a second person sign in and grade the same scars to see inter-rater agreement."
                  : "Grade some scars first, then return here."}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Currently {graders.length} grader{graders.length !== 1 ? "s" : ""} detected.
              </p>
            </div>
          )}

          {/* Stats */}
          {!isLoading && graders.length >= 2 && (scars?.length ?? 0) > 0 && (
            <InterRaterStats
              scars={scars.map((s) => ({
                ...s,
                // Backward compat: old records have ezIntact, new ones have ezStatus
                ezStatus: s.ezStatus ?? (s.ezIntact === false ? "Disrupted" : "Intact"),
              }))}
              graderIds={graders}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
