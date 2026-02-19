import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  type Quadrant,
  type Zone,
  type Confidence,
  FUNDUS_GRADES,
  OCT_GRADES,
  AF_GRADES,
} from "@/lib/types";

// --- Reusable selectors ---

export function GradeSelector({
  grades,
  value,
  onChange,
}: {
  grades: Record<number, { label: string; description: string }>;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Object.entries(grades).map(([num, grade]) => {
        const n = parseInt(num);
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rounded-lg border-2 p-4 text-left transition-colors ${
              selected
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:bg-muted"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                {n}
              </span>
              <span className="text-sm font-medium">{grade.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ConfidenceSelector({
  value,
  onChange,
}: {
  value: Confidence;
  onChange: (c: Confidence) => void;
}) {
  const levels: Confidence[] = ["Low", "Medium", "High"];
  return (
    <div className="flex gap-2">
      {levels.map((c) => (
        <Button
          key={c}
          type="button"
          variant={value === c ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(c)}
        >
          {c}
        </Button>
      ))}
    </div>
  );
}

// --- Step components ---

export function StepFundus({
  grade, setGrade, confidence, setConfidence,
}: {
  grade: number;
  setGrade: (n: number) => void;
  confidence: Confidence;
  setConfidence: (c: Confidence) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Fundus Grade (1–3)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          How does the scar appear on color fundus photography?
        </p>
        <GradeSelector grades={FUNDUS_GRADES} value={grade} onChange={setGrade} />
      </div>
      <div className="space-y-2">
        <Label>Confidence</Label>
        <ConfidenceSelector value={confidence} onChange={setConfidence} />
      </div>
    </div>
  );
}

export function StepPredictOct({
  grade, setGrade,
}: {
  grade: number;
  setGrade: (n: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Predicted OCT Penetration (1–4)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Based on fundus appearance ONLY — predict the OCT penetration depth
        </p>
        <GradeSelector grades={OCT_GRADES} value={grade} onChange={setGrade} />
      </div>
    </div>
  );
}

export function StepAF({
  grade, setGrade, confidence, setConfidence,
}: {
  grade: number;
  setGrade: (n: number) => void;
  confidence: Confidence;
  setConfidence: (c: Confidence) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          AF Grade (1–4)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Grade the autofluorescence (532nm) appearance
        </p>
        <GradeSelector grades={AF_GRADES} value={grade} onChange={setGrade} />
      </div>
      <div className="space-y-2">
        <Label>Confidence</Label>
        <ConfidenceSelector value={confidence} onChange={setConfidence} />
      </div>
    </div>
  );
}

export function StepRevise({
  predictedOct, revisedOct, setRevisedOct,
}: {
  predictedOct: number;
  revisedOct: number | null;
  setRevisedOct: (n: number | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Revise OCT Prediction (optional)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          After seeing AF, do you want to change your OCT prediction?
        </p>
        <div className="mb-4 rounded-lg bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">
            Your original prediction:{" "}
          </span>
          <Badge variant="outline">
            Grade {predictedOct} — {OCT_GRADES[predictedOct as keyof typeof OCT_GRADES]?.description}
          </Badge>
        </div>
        <GradeSelector
          grades={OCT_GRADES}
          value={revisedOct ?? 0}
          onChange={(n) => setRevisedOct(n)}
        />
        {revisedOct !== null && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setRevisedOct(null)}
          >
            Keep original prediction
          </Button>
        )}
      </div>
    </div>
  );
}

export function StepActualOct({
  grade, setGrade, ezIntact, setEzIntact,
}: {
  grade: number;
  setGrade: (n: number) => void;
  ezIntact: boolean;
  setEzIntact: (b: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Actual OCT Grade (1–4)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Record the actual OCT penetration depth (reference standard)
        </p>
        <GradeSelector grades={OCT_GRADES} value={grade} onChange={setGrade} />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          EZ Line (Ellipsoid Zone)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Is the EZ line intact at the scar site?
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={ezIntact ? "default" : "outline"}
            onClick={() => setEzIntact(true)}
          >
            Intact
          </Button>
          <Button
            type="button"
            variant={!ezIntact ? "default" : "outline"}
            onClick={() => setEzIntact(false)}
          >
            Disrupted
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StepConfirm({
  data,
  comment,
  setComment,
}: {
  data: {
    scarCode: string;
    quadrant: Quadrant;
    zone: Zone;
    fundusGrade: number;
    fundusConfidence: Confidence;
    predictedOct: number;
    afGrade: number;
    afConfidence: Confidence;
    revisedOct: number | null;
    actualOct: number;
    ezIntact: boolean;
  };
  comment: string;
  setComment: (s: string) => void;
}) {
  const prediction = data.revisedOct ?? data.predictedOct;
  const accurate = prediction === data.actualOct;

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Review & Save</Label>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Location" value={`${data.quadrant} / ${data.zone}`} />
        <SummaryItem
          label="Fundus"
          value={`Grade ${data.fundusGrade} (${FUNDUS_GRADES[data.fundusGrade as keyof typeof FUNDUS_GRADES]?.description}) — ${data.fundusConfidence}`}
        />
        <SummaryItem
          label="Predicted OCT"
          value={`Grade ${data.predictedOct} (${OCT_GRADES[data.predictedOct as keyof typeof OCT_GRADES]?.description})`}
        />
        <SummaryItem
          label="AF"
          value={`Grade ${data.afGrade} (${AF_GRADES[data.afGrade as keyof typeof AF_GRADES]?.description}) — ${data.afConfidence}`}
        />
        {data.revisedOct !== null && (
          <SummaryItem
            label="Revised OCT"
            value={`Grade ${data.revisedOct} (${OCT_GRADES[data.revisedOct as keyof typeof OCT_GRADES]?.description})`}
          />
        )}
        <SummaryItem
          label="Actual OCT"
          value={`Grade ${data.actualOct} (${OCT_GRADES[data.actualOct as keyof typeof OCT_GRADES]?.description})`}
        />
        <SummaryItem label="EZ Line" value={data.ezIntact ? "Intact" : "Disrupted"} />
        <SummaryItem
          label="Prediction Accuracy"
          value={accurate ? "Correct" : `Off by ${Math.abs(prediction - data.actualOct)} grade(s)`}
          highlight={accurate ? "green" : "amber"}
        />
      </div>

      <Separator />
      <div className="space-y-2">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Any notes about this scar..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "amber";
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-medium ${
          highlight === "green"
            ? "text-green-600 dark:text-green-400"
            : highlight === "amber"
              ? "text-amber-600 dark:text-amber-400"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
