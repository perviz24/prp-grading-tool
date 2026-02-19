"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex,
  title,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const total = images.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : total - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < total - 1 ? i + 1 : 0));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext, onClose]);

  if (total === 0) return null;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-3xl p-2">
        <DialogTitle className="sr-only">{title} reference image</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {index + 1} of {total}
          </p>
        </div>

        {/* Image */}
        <div className="relative flex items-center justify-center">
          {total > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-1 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
              onClick={goPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <img
            src={images[index]}
            alt={`${title} reference ${index + 1}`}
            className="max-h-[70vh] w-full rounded-lg object-contain"
          />

          {total > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
              onClick={goNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 pb-1">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-10 w-10 overflow-hidden rounded border transition-all ${
                  i === index
                    ? "ring-2 ring-primary border-primary"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
