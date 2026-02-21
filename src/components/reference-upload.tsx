"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, ImagePlus, Upload, Clipboard } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

const MAX_REFS_PER_GRADE = 4;

export interface RefImage {
  _id: Id<"referenceImages">;
  url: string | null;
  gradeNumber: number;
}

export function GradeCard({
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

          {canUpload && <UploadSlot onUploaded={handleUpload} />}

          {images.length === 0 && (
            <p className="flex items-center text-xs text-muted-foreground">
              No references yet — upload photos to help with grading
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function UploadSlot({ onUploaded }: { onUploaded: (id: Id<"_storage">) => void }) {
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
      } catch {
        toast.error("Reference upload failed. Please try again.");
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
