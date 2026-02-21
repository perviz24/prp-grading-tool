import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LaserPattern } from "@/lib/types";

interface LaserParamsFormProps {
  power: string;
  setPower: (v: string) => void;
  spotSize: string;
  setSpotSize: (v: string) => void;
  duration: string;
  setDuration: (v: string) => void;
  wavelength: string;
  setWavelength: (v: string) => void;
  pattern: LaserPattern | "";
  setPattern: (v: LaserPattern | "") => void;
  numBurns: string;
  setNumBurns: (v: string) => void;
}

export function LaserParamsForm({
  power, setPower,
  spotSize, setSpotSize,
  duration, setDuration,
  wavelength, setWavelength,
  pattern, setPattern,
  numBurns, setNumBurns,
}: LaserParamsFormProps) {
  return (
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
  );
}
