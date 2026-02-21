import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  type Quadrant,
  type Zone,
  type Confidence,
  type EZStatus,
  FUNDUS_GRADES,
  OCT_GRADES,
  AF_GRADES,
} from "@/lib/types";

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
    ezStatus: EZStatus;
    ezConfidence: Confidence;
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
        <SummaryItem label="EZ Line" value={`${data.ezStatus} — ${data.ezConfidence}`} />
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
