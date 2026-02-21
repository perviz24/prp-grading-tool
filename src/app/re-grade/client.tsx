"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { IntraRaterStats } from "@/components/intra-rater-stats";
import { RegradeSelector } from "@/components/regrade-selector";
import { AlertTriangle, RotateCcw } from "lucide-react";

export function RegradePageClient() {
  const eligible = useQuery(api.scars.listEligibleForRegrade);
  const rawPairs = useQuery(api.scars.listRegradePairs);
  const isLoading = eligible === undefined || rawPairs === undefined;

  // Filter pairs with non-null originals (already done server-side, but TS needs client narrowing)
  const pairs = rawPairs?.filter(
    (p): p is typeof p & { original: NonNullable<typeof p.original> } =>
      p.original !== null
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Intra-Rater Reliability
            </h1>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>Blinded re-grade.</strong> Re-grade scars you graded 2+
              weeks ago to measure your own consistency. Original grades are
              hidden during re-grading.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <div className="mt-6 space-y-6">
              {/* Re-grade selector */}
              <RegradeSelector eligible={eligible} />

              {/* Results */}
              {pairs && pairs.length > 0 ? (
                <IntraRaterStats pairs={pairs} />
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">
                    No re-grades completed yet. Select scars above to start.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
