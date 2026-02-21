import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ReferenceGallery } from "@/components/reference-gallery";
import type { Confidence } from "@/lib/types";

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

export function ReferenceImageGrid({
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
