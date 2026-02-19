"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImagePasteUpload } from "./image-paste-upload";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface ReferenceImagesProps {
  /** "fundus" | "oct" | "af" */
  modality: string;
  /** Grade number to show references for */
  gradeNumber: number;
  /** Grade label for display */
  gradeLabel: string;
}

export function ReferenceImages({
  modality,
  gradeNumber,
  gradeLabel,
}: ReferenceImagesProps) {
  const images = useQuery(api.files.listReferenceImages, { modality });
  const saveRef = useMutation(api.files.saveReferenceImage);
  const deleteRef = useMutation(api.files.deleteReferenceImage);

  // Filter images for this specific grade
  const gradeImages = images?.filter((img) => img.gradeNumber === gradeNumber) ?? [];

  const handleUpload = async (imageId: Id<"_storage">) => {
    await saveRef({ modality, gradeNumber, imageId });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Reference: {gradeLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        {gradeImages.map((img) => (
          <div key={img._id} className="group relative">
            {img.url ? (
              <img
                src={img.url}
                alt={`Reference ${gradeLabel}`}
                className="h-20 w-20 rounded border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded border bg-muted">
                <span className="text-xs text-muted-foreground">...</span>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-1 -top-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteRef({ id: img._id })}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {/* Upload slot for new reference */}
        <div className="h-20 w-20">
          <MiniUpload onUploaded={handleUpload} />
        </div>
      </div>
    </div>
  );
}

// Compact upload target for reference images
function MiniUpload({
  onUploaded,
}: {
  onUploaded: (id: Id<"_storage">) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await upload(file);
        return;
      }
    }
  };

  const upload = async (file: File) => {
    const url = await generateUploadUrl();
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    onUploaded(storageId as Id<"_storage">);
  };

  return (
    <label
      onPaste={handlePaste}
      tabIndex={0}
      className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground/50 transition-colors hover:border-primary/50 hover:text-primary/50 focus:border-primary focus:outline-none"
    >
      <span className="text-lg">+</span>
      <span className="text-[10px]">Ref</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await upload(file);
        }}
      />
    </label>
  );
}
