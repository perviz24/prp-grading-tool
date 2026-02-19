"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  type LaserGroup,
  type LaserApparatus,
  type LaserPattern,
  getTimeCategory,
} from "@/lib/types";
import type { Id } from "../../convex/_generated/dataModel";

interface PatientEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: Id<"patients">;
  patient: {
    patientCode: string;
    laserGroup?: string;
    laserApparatus?: string;
    pattern?: string;
    power_mW?: number;
    spotSize_um?: number;
    duration_ms?: number;
    wavelength_nm?: number;
    numBurns?: number;
    timeSinceTreatmentYears?: number;
  };
}

export function PatientEditDialog({
  open,
  onOpenChange,
  patientId,
  patient,
}: PatientEditDialogProps) {
  const updatePatient = useMutation(api.patients.update);

  const [laserGroup, setLaserGroup] = useState<LaserGroup | "">("");
  const [laserApparatus, setLaserApparatus] = useState<LaserApparatus | "">("");
  const [pattern, setPattern] = useState<LaserPattern | "">("");
  const [power, setPower] = useState("");
  const [spotSize, setSpotSize] = useState("");
  const [duration, setDuration] = useState("");
  const [wavelength, setWavelength] = useState("");
  const [numBurns, setNumBurns] = useState("");
  const [timeSince, setTimeSince] = useState("");
  const [saving, setSaving] = useState(false);

  // Pre-fill form when dialog opens or patient data changes
  useEffect(() => {
    if (open) {
      setLaserGroup((patient.laserGroup as LaserGroup) ?? "");
      setLaserApparatus((patient.laserApparatus as LaserApparatus) ?? "");
      setPattern((patient.pattern as LaserPattern) ?? "");
      setPower(patient.power_mW?.toString() ?? "");
      setSpotSize(patient.spotSize_um?.toString() ?? "");
      setDuration(patient.duration_ms?.toString() ?? "");
      setWavelength(patient.wavelength_nm?.toString() ?? "");
      setNumBurns(patient.numBurns?.toString() ?? "");
      setTimeSince(patient.timeSinceTreatmentYears?.toString() ?? "");
    }
  }, [open, patient]);

  function handleGroupChange(group: LaserGroup | "") {
    setLaserGroup(group);
    if (group === "A-Modern" && !laserApparatus) {
      setLaserApparatus("Valon");
    } else if (group === "B-Konventionell" && !laserApparatus) {
      setLaserApparatus("Argon");
    }
  }

  async function handleSave() {
    const years = timeSince ? parseFloat(timeSince) : undefined;
    if (years !== undefined && (isNaN(years) || years < 0)) {
      toast.error("Invalid time value");
      return;
    }

    setSaving(true);
    try {
      await updatePatient({
        patientId,
        ...(laserGroup ? { laserGroup: laserGroup as LaserGroup } : {}),
        ...(laserApparatus
          ? { laserApparatus: laserApparatus as LaserApparatus }
          : {}),
        ...(pattern ? { pattern: pattern as LaserPattern } : {}),
        ...(years !== undefined ? { timeSinceTreatmentYears: years } : {}),
        ...(power ? { power_mW: parseFloat(power) } : {}),
        ...(spotSize ? { spotSize_um: parseFloat(spotSize) } : {}),
        ...(duration ? { duration_ms: parseFloat(duration) } : {}),
        ...(wavelength ? { wavelength_nm: parseFloat(wavelength) } : {}),
        ...(numBurns ? { numBurns: parseInt(numBurns) } : {}),
      });
      toast.success(`Patient ${patient.patientCode} updated`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update patient. Are you signed in?");
    } finally {
      setSaving(false);
    }
  }

  const timeCategory =
    timeSince && !isNaN(parseFloat(timeSince))
      ? getTimeCategory(parseFloat(timeSince))
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Patient{" "}
            <Badge variant="secondary" className="ml-2">
              {patient.patientCode}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Update laser parameters and treatment details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Laser Group & Apparatus */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Laser Group</Label>
              <Select
                value={laserGroup || undefined}
                onValueChange={handleGroupChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A-Modern">A — Modern</SelectItem>
                  <SelectItem value="B-Konventionell">
                    B — Konventionell
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Laser Apparatus</Label>
              <Select
                value={laserApparatus || undefined}
                onValueChange={(v) =>
                  setLaserApparatus(v as LaserApparatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select apparatus..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Valon">Valon</SelectItem>
                  <SelectItem value="Navilas">Navilas</SelectItem>
                  <SelectItem value="Argon">Argon</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Laser Parameters */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Laser Parameters
            </Label>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-power">Power (mW)</Label>
                <Input
                  id="edit-power"
                  type="number"
                  placeholder="e.g. 200"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-spotSize">Spot Size (μm)</Label>
                <Input
                  id="edit-spotSize"
                  type="number"
                  placeholder="e.g. 400"
                  value={spotSize}
                  onChange={(e) => setSpotSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (ms)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  placeholder="e.g. 100"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-wavelength">Wavelength (nm)</Label>
                <Input
                  id="edit-wavelength"
                  type="number"
                  placeholder="e.g. 532"
                  value={wavelength}
                  onChange={(e) => setWavelength(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Pattern</Label>
                <Select
                  value={pattern || undefined}
                  onValueChange={(v) => setPattern(v as LaserPattern)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Pattern">Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-numBurns">Number of Burns</Label>
                <Input
                  id="edit-numBurns"
                  type="number"
                  placeholder="e.g. 1500"
                  value={numBurns}
                  onChange={(e) => setNumBurns(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Time Since Treatment */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-timeSince">
                Time Since Treatment (years)
              </Label>
              <Input
                id="edit-timeSince"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 5"
                value={timeSince}
                onChange={(e) => setTimeSince(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              {timeCategory && (
                <Badge
                  variant={
                    timeCategory === "Recent ≤2yr" ? "default" : "secondary"
                  }
                >
                  {timeCategory}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
