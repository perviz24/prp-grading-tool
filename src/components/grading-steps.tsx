import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ImagePasteUpload } from "@/components/image-paste-upload";
import { ReferenceGallery } from "@/components/reference-gallery";
import {
  type Quadrant,
  type Zone,
  type Confidence,
  type EZStatus,
  FUNDUS_GRADES,
  OCT_GRADES,
  AF_GRADES,
} from "@/lib/types";
import type { Id } from "../../convex/_generated/dataModel";

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

// --- Helper: Reference images for all grades in a modality ---

function ReferenceImageGrid({
  modality,
  grades,
}: {
  modality: string;
  grades: Record<number, { label: string; description: string }>;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">Reference Photos</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(grades).map(([num, grade]) => (
          <ReferenceGallery
            key={num}
            modality={modality}
            gradeNumber={parseInt(num)}
            gradeLabel={`${grade.label}: ${grade.description}`}
          />
        ))}
      </div>
    </div>
  );
}

// --- Step components ---

export function StepFundus({
  grade, setGrade, confidence, setConfidence,
  imageId, onImageUploaded, onImageRemove,
}: {
  grade: number;
  setGrade: (n: number) => void;
  confidence: Confidence;
  setConfidence: (c: Confidence) => void;
  imageId?: Id<"_storage"> | null;
  onImageUploaded: (id: Id<"_storage">) => void;
  onImageRemove: () => void;
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
      <Separator />
      <ImagePasteUpload
        label="Actual Fundus Photo"
        onUploaded={onImageUploaded}
        storageId={imageId}
        onRemove={onImageRemove}
      />
      <Separator />
      <ReferenceImageGrid modality="fundus" grades={FUNDUS_GRADES} />
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
      <Separator />
      <ReferenceImageGrid modality="oct" grades={OCT_GRADES} />
    </div>
  );
}

export function StepAF({
  grade, setGrade, confidence, setConfidence,
  imageId, onImageUploaded, onImageRemove,
}: {
  grade: number;
  setGrade: (n: number) => void;
  confidence: Confidence;
  setConfidence: (c: Confidence) => void;
  imageId?: Id<"_storage"> | null;
  onImageUploaded: (id: Id<"_storage">) => void;
  onImageRemove: () => void;
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
      <Separator />
      <ImagePasteUpload
        label="Actual AF Photo"
        onUploaded={onImageUploaded}
        storageId={imageId}
        onRemove={onImageRemove}
      />
      <Separator />
      <ReferenceImageGrid modality="af" grades={AF_GRADES} />
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
  grade, setGrade,
  ezStatus, setEzStatus, ezConfidence, setEzConfidence,
  imageId, onImageUploaded, onImageRemove,
}: {
  grade: number;
  setGrade: (n: number) => void;
  ezStatus: EZStatus;
  setEzStatus: (s: EZStatus) => void;
  ezConfidence: Confidence;
  setEzConfidence: (c: Confidence) => void;
  imageId?: Id<"_storage"> | null;
  onImageUploaded: (id: Id<"_storage">) => void;
  onImageRemove: () => void;
}) {
  const ezOptions: { value: EZStatus; label: string }[] = [
    { value: "Intact", label: "Intact" },
    { value: "Disrupted", label: "Disrupted" },
    { value: "Not visible", label: "Not visible to assess" },
  ];
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
        <div className="flex flex-wrap gap-2">
          {ezOptions.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant={ezStatus === opt.value ? "default" : "outline"}
              onClick={() => setEzStatus(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>EZ Confidence</Label>
        <ConfidenceSelector value={ezConfidence} onChange={setEzConfidence} />
      </div>
      <Separator />
      <ImagePasteUpload
        label="Actual OCT Photo"
        onUploaded={onImageUploaded}
        storageId={imageId}
        onRemove={onImageRemove}
      />
      <Separator />
      <ReferenceImageGrid modality="oct" grades={OCT_GRADES} />
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
