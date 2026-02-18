"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  type LaserGroup,
  type LaserApparatus,
  type LaserPattern,
  getTimeCategory,
} from "@/lib/types";

interface PatientFormProps {
  nextCode: string;
}

export function PatientForm({ nextCode }: PatientFormProps) {
  const createPatient = useMutation(api.patients.create);

  const [laserGroup, setLaserGroup] = useState<LaserGroup>("A-Modern");
  const [laserApparatus, setLaserApparatus] =
    useState<LaserApparatus>("Valon");
  const [pattern, setPattern] = useState<LaserPattern>("Single");
  const [power, setPower] = useState("");
  const [spotSize, setSpotSize] = useState("");
  const [duration, setDuration] = useState("");
  const [wavelength, setWavelength] = useState("");
  const [numBurns, setNumBurns] = useState("");
  const [timeSince, setTimeSince] = useState("");
  const [saving, setSaving] = useState(false);

  function handleGroupChange(group: LaserGroup) {
    setLaserGroup(group);
    if (group === "A-Modern") {
      setLaserApparatus("Valon");
    } else {
      setLaserApparatus("Argon");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const years = parseFloat(timeSince);
    if (isNaN(years) || years < 0) return;

    setSaving(true);
    try {
      await createPatient({
        patientCode: nextCode,
        laserGroup,
        laserApparatus,
        pattern,
        timeSinceTreatmentYears: years,
        ...(power ? { power_mW: parseFloat(power) } : {}),
        ...(spotSize ? { spotSize_um: parseFloat(spotSize) } : {}),
        ...(duration ? { duration_ms: parseFloat(duration) } : {}),
        ...(wavelength ? { wavelength_nm: parseFloat(wavelength) } : {}),
        ...(numBurns ? { numBurns: parseInt(numBurns) } : {}),
      });
      toast.success(`Patient ${nextCode} created`);
      // Reset form
      setPower("");
      setSpotSize("");
      setDuration("");
      setWavelength("");
      setNumBurns("");
      setTimeSince("");
    } catch {
      toast.error("Failed to create patient. Are you signed in?");
    } finally {
      setSaving(false);
    }
  }

  const timeCategory =
    timeSince && !isNaN(parseFloat(timeSince))
      ? getTimeCategory(parseFloat(timeSince))
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          New Patient
          <Badge variant="secondary">{nextCode}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Laser Group & Apparatus */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Laser Group</Label>
              <Select value={laserGroup} onValueChange={handleGroupChange}>
                <SelectTrigger>
                  <SelectValue />
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
                value={laserApparatus}
                onValueChange={(v) =>
                  setLaserApparatus(v as LaserApparatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
              Laser Parameters (optional — fill what&apos;s available)
            </Label>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="power">Power (mW)</Label>
                <Input
                  id="power"
                  type="number"
                  placeholder="e.g. 200"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotSize">Spot Size (μm)</Label>
                <Input
                  id="spotSize"
                  type="number"
                  placeholder="e.g. 400"
                  value={spotSize}
                  onChange={(e) => setSpotSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (ms)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g. 100"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wavelength">Wavelength (nm)</Label>
                <Input
                  id="wavelength"
                  type="number"
                  placeholder="e.g. 532"
                  value={wavelength}
                  onChange={(e) => setWavelength(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Pattern</Label>
                <Select
                  value={pattern}
                  onValueChange={(v) => setPattern(v as LaserPattern)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Pattern">Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numBurns">Number of Burns</Label>
                <Input
                  id="numBurns"
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
              <Label htmlFor="timeSince">
                Time Since Treatment (years)
              </Label>
              <Input
                id="timeSince"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 5"
                value={timeSince}
                onChange={(e) => setTimeSince(e.target.value)}
                required
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

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Creating..." : `Create Patient ${nextCode}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
