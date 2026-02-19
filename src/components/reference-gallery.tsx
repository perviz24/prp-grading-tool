"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { ImageLightbox } from "./image-lightbox";

interface ReferenceGalleryProps {
  /** "fundus" | "oct" | "af" */
  modality: string;
  /** Grade number to show references for */
  gradeNumber: number;
  /** Grade label for display */
  gradeLabel: string;
}

export function ReferenceGallery({
  modality,
  gradeNumber,
  gradeLabel,
}: ReferenceGalleryProps) {
  const images = useQuery(api.files.listReferenceImages, { modality });
  const gradeImages =
    images?.filter((img) => img.gradeNumber === gradeNumber) ?? [];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Build array of image URLs for the lightbox
  const imageUrls = gradeImages
    .map((img) => img.url)
    .filter((url): url is string => url !== null);

  if (images === undefined) {
    // Loading state — show placeholder strips
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Reference: {gradeLabel}
        </p>
        <div className="flex gap-1.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-[60px] w-[60px] animate-pulse rounded border bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (gradeImages.length === 0) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Reference: {gradeLabel}
        </p>
        <Link
          href="/references"
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
        >
          <ImageOff className="h-3.5 w-3.5" />
          <span>No reference photos — add in Reference Bank</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">
        Reference: {gradeLabel}
      </p>
      <div className="flex gap-1.5">
        {gradeImages.map((img, idx) =>
          img.url ? (
            <button
              key={img._id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className="h-[60px] w-[60px] overflow-hidden rounded border transition-all hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={img.url}
                alt={`${gradeLabel} ref ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ) : (
            <div
              key={img._id}
              className="flex h-[60px] w-[60px] items-center justify-center rounded border bg-muted"
            >
              <span className="text-[10px] text-muted-foreground">...</span>
            </div>
          )
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={imageUrls}
          initialIndex={lightboxIndex}
          title={gradeLabel}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
