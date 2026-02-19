"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ImagePlus, Upload, Clipboard } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  FUNDUS_GRADES,
  OCT_GRADES,
  AF_GRADES,
} from "@/lib/types";
import type { Id } from "../../../convex/_generated/dataModel";

const MAX_REFS_PER_GRADE = 4;

const MODALITIES = [
  { key: "fundus", label: "Fundus", grades: FUNDUS_GRADES },
  { key: "oct", label: "OCT", grades: OCT_GRADES },
  { key: "af", label: "AF", grades: AF_GRADES },
] as const;

export default function ReferenceBankPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Reference Bank</h1>
            <p className="text-muted-foreground">
              Upload reference photos for each grading scale. These appear during
              grading for all patients and scars.
            </p>
          </div>

          <Tabs defaultValue="fundus">
            <TabsList className="mb-4">
              {MODALITIES.map((m) => (
                <TabsTrigger key={m.key} value={m.key}>
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {MODALITIES.map((m) => (
              <TabsContent key={m.key} value={m.key}>
                <ModalityTab modality={m.key} grades={m.grades} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- Modality Tab: shows all grades for one modality ---

function ModalityTab({
  modality,
  grades,
}: {
  modality: string;
  grades: Record<number, { label: string; description: string }>;
}) {
  const images = useQuery(api.files.listReferenceImages, { modality });
  const isLoading = images === undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(grades).map(([num, grade]) => {
        const gradeNum = parseInt(num);
        const gradeImages = images?.filter(
          (img) => img.gradeNumber === gradeNum
        ) ?? [];

        return (
          <GradeCard
            key={gradeNum}
            modality={modality}
            gradeNumber={gradeNum}
            gradeLabel={grade.label}
            gradeDescription={grade.description}
            images={gradeImages}
            isLoading={isLoading}
          />
        );
      })}
    </div>
  );
}

// --- Grade Card: one grade's reference images + upload ---

interface RefImage {
  _id: Id<"referenceImages">;
  url: string | null;
  gradeNumber: number;
}

function GradeCard({
  modality,
  gradeNumber,
  gradeLabel,
  gradeDescription,
  images,
  isLoading,
}: {
  modality: string;
  gradeNumber: number;
  gradeLabel: string;
  gradeDescription: string;
  images: RefImage[];
  isLoading: boolean;
}) {
  const saveRef = useMutation(api.files.saveReferenceImage);
  const deleteRef = useMutation(api.files.deleteReferenceImage);
  const canUpload = images.length < MAX_REFS_PER_GRADE;

  const handleUpload = async (imageId: Id<"_storage">) => {
    await saveRef({ modality, gradeNumber, imageId });
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
            {gradeNumber}
          </span>
          <div>
            <p className="text-sm font-semibold">{gradeLabel}</p>
            <p className="text-xs text-muted-foreground">{gradeDescription}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {images.length}/{MAX_REFS_PER_GRADE}
        </Badge>
      </div>

      {/* Image grid */}
      {isLoading ? (
        <div className="flex gap-2">
          <Skeleton className="h-[120px] w-[120px] rounded-lg" />
          <Skeleton className="h-[120px] w-[120px] rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img._id} className="group relative">
              {img.url ? (
                <img
                  src={img.url}
                  alt={`${gradeLabel} reference`}
                  className="h-[120px] w-[120px] rounded-lg border object-cover"
                />
              ) : (
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-lg border bg-muted">
                  <span className="text-xs text-muted-foreground">Loading...</span>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-1 -top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteRef({ id: img._id })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Upload slot */}
          {canUpload && (
            <UploadSlot onUploaded={handleUpload} />
          )}

          {/* Empty state */}
          {images.length === 0 && !canUpload ? null : images.length === 0 && (
            <p className="flex items-center text-xs text-muted-foreground">
              No references yet — upload photos to help with grading
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// --- Upload Slot: paste / click / drag ---

function UploadSlot({
  onUploaded,
}: {
  onUploaded: (id: Id<"_storage">) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const url = await generateUploadUrl();
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        onUploaded(storageId as Id<"_storage">);
      } catch (err) {
        console.error("Reference upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, onUploaded]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) upload(file);
          return;
        }
      }
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) upload(file);
    },
    [upload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <>
      <div
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        tabIndex={0}
        className="flex h-[120px] w-[120px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground/50 transition-colors hover:border-primary/50 hover:text-primary/50 focus:border-primary focus:outline-none"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <span className="text-xs">Uploading...</span>
        ) : (
          <>
            <ImagePlus className="h-6 w-6" />
            <div className="flex items-center gap-1 text-[10px]">
              <Clipboard className="h-2.5 w-2.5" />
              <span>Paste</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <Upload className="h-2.5 w-2.5" />
              <span>or Click</span>
            </div>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
    </>
  );
}
