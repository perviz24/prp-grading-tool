"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle2, ArrowLeft, ArrowRight, Eye, Scan, Sun, RefreshCw, Microscope, ClipboardCheck } from "lucide-react";
import {
  type Quadrant,
  type Zone,
  type Confidence,
  type EZStatus,
} from "@/lib/types";
import type { Id } from "../../convex/_generated/dataModel";
import {
  StepFundus,
  StepPredictOct,
  StepAF,
  StepRevise,
  StepActualOct,
  StepConfirm,
} from "@/components/grading-steps";

const STEPS = [
  { label: "Fundus", icon: Eye, desc: "Grade fundus appearance" },
  { label: "Predict OCT", icon: Scan, desc: "Predict OCT from fundus" },
  { label: "AF", icon: Sun, desc: "Grade autofluorescence" },
  { label: "Revise", icon: RefreshCw, desc: "Revise OCT after AF" },
  { label: "Actual OCT", icon: Microscope, desc: "Record actual OCT" },
  { label: "Confirm", icon: ClipboardCheck, desc: "Review & save" },
] as const;

interface GradingWizardProps {
  patientId: Id<"patients">;
  scarCode: string;
  onComplete: () => void;
  isRegradeOf?: Id<"scars">;
}

interface Timestamps {
  fundusStart?: number;
  fundusEnd?: number;
  predictStart?: number;
  predictEnd?: number;
  afStart?: number;
  afEnd?: number;
  reviseStart?: number;
  reviseEnd?: number;
  octStart?: number;
  octEnd?: number;
  confirmEnd?: number;
}

export function GradingWizard({ patientId, scarCode, onComplete, isRegradeOf }: GradingWizardProps) {
  const createScar = useMutation(api.scars.create);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Location
  const [quadrant, setQuadrant] = useState<Quadrant>("Superior");
  const [zone, setZone] = useState<Zone>("Mid");

  // Step 1: Fundus
  const [fundusGrade, setFundusGrade] = useState<number>(0);
  const [fundusConfidence, setFundusConfidence] = useState<Confidence>("Medium");

  // Step 2: Predict OCT
  const [predictedOct, setPredictedOct] = useState<number>(0);

  // Step 3: AF
  const [afGrade, setAfGrade] = useState<number>(0);
  const [afConfidence, setAfConfidence] = useState<Confidence>("Medium");

  // Step 4: Revise
  const [revisedOct, setRevisedOct] = useState<number | null>(null);

  // Step 5: Actual OCT
  const [actualOct, setActualOct] = useState<number>(0);
  const [ezStatus, setEzStatus] = useState<EZStatus>("Intact");
  const [ezConfidence, setEzConfidence] = useState<Confidence>("Medium");

  // Images — actual patient photos
  const [fundusImageId, setFundusImageId] = useState<Id<"_storage"> | null>(null);
  const [afImageId, setAfImageId] = useState<Id<"_storage"> | null>(null);
  const [octImageId, setOctImageId] = useState<Id<"_storage"> | null>(null);

  // Step 6: Comment
  const [comment, setComment] = useState("");

  // Timestamps
  const [timestamps, setTimestamps] = useState<Timestamps>({});

  const markTime = useCallback(
    (field: keyof Timestamps) => {
      setTimestamps((prev) => ({ ...prev, [field]: Date.now() }));
    },
    []
  );

  // Auto-mark start times when entering a step
  function goToStep(next: number) {
    const startFields: Record<number, keyof Timestamps> = {
      0: "fundusStart",
      1: "predictStart",
      2: "afStart",
      3: "reviseStart",
      4: "octStart",
    };
    const endFields: Record<number, keyof Timestamps> = {
      0: "fundusEnd",
      1: "predictEnd",
      2: "afEnd",
      3: "reviseEnd",
      4: "octEnd",
    };

    // Mark end of current step
    if (endFields[step]) markTime(endFields[step]);

    // Mark start of next step
    if (startFields[next] && !timestamps[startFields[next]]) {
      markTime(startFields[next]);
    }

    setStep(next);
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return fundusGrade > 0;
      case 1:
        return predictedOct > 0;
      case 2:
        return afGrade > 0;
      case 3:
        return true; // Revision is optional
      case 4:
        return actualOct > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }

  async function handleSave() {
    setSaving(true);
    const finalTimestamps = { ...timestamps, confirmEnd: Date.now() };
    try {
      await createScar({
        patientId,
        scarCode,
        quadrant,
        zone,
        fundusGrade,
        fundusConfidence,
        predictedOct,
        afGrade,
        afConfidence,
        ...(revisedOct !== null ? { revisedOct } : {}),
        actualOct,
        ezStatus,
        ezConfidence,
        ...(fundusImageId ? { fundusImageId } : {}),
        ...(afImageId ? { afImageId } : {}),
        ...(octImageId ? { octImageId } : {}),
        ...(comment ? { comment } : {}),
        stepTimestamps: finalTimestamps,
        ...(isRegradeOf ? { isRegradeOf } : {}),
      });
      toast.success(
        isRegradeOf
          ? `Re-grade of ${scarCode} saved`
          : `Scar ${scarCode} graded and saved`
      );
      onComplete();
    } catch {
      toast.error("Failed to save scar. Are you signed in?");
    } finally {
      setSaving(false);
    }
  }

  // Initialize fundus start timestamp on first render
  if (!timestamps.fundusStart) {
    markTime("fundusStart");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {isRegradeOf ? "Re-grade Scar" : "Grade Scar"}
          <Badge variant="secondary">{scarCode}</Badge>
          {isRegradeOf && (
            <Badge variant="outline" className="text-amber-600">
              Intra-rater
            </Badge>
          )}
        </CardTitle>

        {/* Step indicator */}
        <div className="flex items-center gap-1 pt-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex items-center gap-1">
                {i > 0 && (
                  <div
                    className={`h-0.5 w-4 sm:w-8 ${isDone ? "bg-primary" : "bg-muted"}`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => i <= step && goToStep(i)}
                  disabled={i > step}
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-primary/20 text-primary cursor-pointer"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scar Location (always visible at top) */}
        {step === 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Quadrant</Label>
                <Select value={quadrant} onValueChange={(v) => setQuadrant(v as Quadrant)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Superior">Superior</SelectItem>
                    <SelectItem value="Inferior">Inferior</SelectItem>
                    <SelectItem value="Nasal">Nasal</SelectItem>
                    <SelectItem value="Temporal">Temporal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select value={zone} onValueChange={(v) => setZone(v as Zone)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Peripheral">Peripheral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Step 1: Fundus */}
        {step === 0 && (
          <StepFundus
            grade={fundusGrade}
            setGrade={setFundusGrade}
            confidence={fundusConfidence}
            setConfidence={setFundusConfidence}
            imageId={fundusImageId}
            onImageUploaded={setFundusImageId}
            onImageRemove={() => setFundusImageId(null)}
          />
        )}

        {/* Step 2: Predict OCT */}
        {step === 1 && (
          <StepPredictOct grade={predictedOct} setGrade={setPredictedOct} />
        )}

        {/* Step 3: AF */}
        {step === 2 && (
          <StepAF
            grade={afGrade}
            setGrade={setAfGrade}
            confidence={afConfidence}
            setConfidence={setAfConfidence}
            imageId={afImageId}
            onImageUploaded={setAfImageId}
            onImageRemove={() => setAfImageId(null)}
          />
        )}

        {/* Step 4: Revise */}
        {step === 3 && (
          <StepRevise
            predictedOct={predictedOct}
            revisedOct={revisedOct}
            setRevisedOct={setRevisedOct}
          />
        )}

        {/* Step 5: Actual OCT */}
        {step === 4 && (
          <StepActualOct
            grade={actualOct}
            setGrade={setActualOct}
            ezStatus={ezStatus}
            setEzStatus={setEzStatus}
            ezConfidence={ezConfidence}
            setEzConfidence={setEzConfidence}
            imageId={octImageId}
            onImageUploaded={setOctImageId}
            onImageRemove={() => setOctImageId(null)}
          />
        )}

        {/* Step 6: Confirm */}
        {step === 5 && (
          <StepConfirm
            data={{
              scarCode, quadrant, zone,
              fundusGrade, fundusConfidence,
              predictedOct, afGrade, afConfidence,
              revisedOct, actualOct, ezStatus, ezConfidence,
            }}
            comment={comment}
            setComment={setComment}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => goToStep(step - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={() => goToStep(step + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Scar Grade"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
