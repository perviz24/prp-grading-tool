"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradingWizard } from "@/components/grading-wizard";
import { Shuffle, Play } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface EligibleScar {
  _id: Id<"scars">;
  scarCode: string;
  patientId: Id<"patients">;
  patientCode: string;
  quadrant: string;
  zone: string;
  createdAt: number;
}

interface RegradeSelectorProps {
  eligible: EligibleScar[];
}

function daysAgo(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
}

export function RegradeSelector({ eligible }: RegradeSelectorProps) {
  const [selected, setSelected] = useState<EligibleScar | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  function selectRandom() {
    if (eligible.length === 0) return;
    const idx = Math.floor(Math.random() * eligible.length);
    setSelected(eligible[idx]);
    setIsGrading(false);
  }

  function handleComplete() {
    setIsGrading(false);
    setSelected(null);
  }

  if (eligible.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">No Scars Eligible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Scars become eligible for re-grading 14 days after the original
            grade. Already re-graded scars are excluded.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Grade more scars and come back in 2 weeks.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isGrading && selected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{selected.patientCode}</Badge>
          <span>Re-grading {selected.scarCode}</span>
          <Badge variant="secondary">
            Original: {daysAgo(selected.createdAt)} days ago
          </Badge>
        </div>
        <GradingWizard
          patientId={selected.patientId}
          scarCode={selected.scarCode}
          onComplete={handleComplete}
          isRegradeOf={selected._id}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Select Scar to Re-grade
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {eligible.length} scar{eligible.length !== 1 ? "s" : ""} eligible
          (graded 14+ days ago, not yet re-graded)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={selectRandom} variant="outline">
            <Shuffle className="mr-2 h-4 w-4" />
            Pick random scar
          </Button>
        </div>

        {selected && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{selected.scarCode}</span>
              <Badge variant="outline">{selected.patientCode}</Badge>
              <Badge variant="secondary">
                {selected.quadrant} / {selected.zone}
              </Badge>
              <Badge variant="outline">
                {daysAgo(selected.createdAt)} days ago
              </Badge>
            </div>
            <Button onClick={() => setIsGrading(true)}>
              <Play className="mr-2 h-4 w-4" />
              Start blinded re-grade
            </Button>
          </div>
        )}

        {/* Eligible scars list */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            All eligible scars
          </p>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {eligible.map((scar) => (
              <button
                key={scar._id}
                type="button"
                onClick={() => {
                  setSelected(scar);
                  setIsGrading(false);
                }}
                className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                  selected?._id === scar._id ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{scar.scarCode}</span>
                  <span className="text-muted-foreground">
                    {scar.patientCode}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {daysAgo(scar.createdAt)}d ago
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
