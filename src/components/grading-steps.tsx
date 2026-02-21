import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImagePasteUpload } from "@/components/image-paste-upload";
import {
  GradeSelector,
  ConfidenceSelector,
  ReferenceImageGrid,
} from "@/components/grading-selectors";
import {
  type Confidence,
  type EZStatus,
  FUNDUS_GRADES,
  OCT_GRADES,
  AF_GRADES,
} from "@/lib/types";
import type { Id } from "../../convex/_generated/dataModel";

// Re-export for backward compatibility with grading-wizard imports
export { StepConfirm } from "@/components/step-confirm";
export { GradeSelector, ConfidenceSelector } from "@/components/grading-selectors";

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
