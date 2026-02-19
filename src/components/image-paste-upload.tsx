"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Clipboard, Upload } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface ImagePasteUploadProps {
  label: string;
  /** Called with the Convex storage ID after upload completes */
  onUploaded: (storageId: Id<"_storage">) => void;
  /** Current storage ID (to show existing image) */
  storageId?: Id<"_storage"> | null;
  /** Called when user removes the image */
  onRemove?: () => void;
}

export function ImagePasteUpload({
  label,
  onUploaded,
  storageId,
  onRemove,
}: ImagePasteUploadProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        // Generate the upload URL from Convex
        const url = await generateUploadUrl();
        // Upload the file
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId: id } = await result.json();
        onUploaded(id as Id<"_storage">);

        // Create local preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, onUploaded]
  );

  // Handle paste events
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) uploadFile(file);
          return;
        }
      }
    },
    [uploadFile]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleRemove = useCallback(() => {
    setPreview(null);
    onRemove?.();
  }, [onRemove]);

  const hasImage = preview || storageId;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      {hasImage && preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt={label}
            className="max-h-48 rounded-lg border object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : hasImage && storageId ? (
        <div className="relative inline-block">
          <StorageImage storageId={storageId} alt={label} />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          ref={dropRef}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          tabIndex={0}
          className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-4 transition-colors hover:border-muted-foreground/50 focus:border-primary focus:outline-none"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <p className="text-sm text-muted-foreground">Uploading...</p>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clipboard className="h-3 w-3" />
                <span>Paste screenshot</span>
                <span className="text-muted-foreground/50">or</span>
                <Upload className="h-3 w-3" />
                <span>Click to upload</span>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// Helper component that loads image URL from Convex storage
function StorageImage({
  storageId,
  alt,
}: {
  storageId: Id<"_storage">;
  alt: string;
}) {
  const url = useStorageUrl(storageId);
  if (!url) {
    return (
      <div className="flex h-32 w-48 items-center justify-center rounded-lg border bg-muted">
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className="max-h-48 rounded-lg border object-contain"
    />
  );
}

// Hook to get URL from storage ID
import { useQuery } from "convex/react";

function useStorageUrl(storageId: Id<"_storage"> | null) {
  return useQuery(
    api.files.getUrl,
    storageId ? { storageId } : "skip"
  );
}
