"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FUNDUS_GRADES, OCT_GRADES, AF_GRADES } from "@/lib/types";
import { GradeCard } from "@/components/reference-upload";

const MODALITIES = [
  { key: "fundus", label: "Fundus", grades: FUNDUS_GRADES },
  { key: "oct", label: "OCT", grades: OCT_GRADES },
  { key: "af", label: "AF", grades: AF_GRADES },
] as const;

export function ReferenceBankPageClient() {
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
                <TabsTrigger key={m.key} value={m.key}>{m.label}</TabsTrigger>
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
        const gradeImages = images?.filter((img) => img.gradeNumber === gradeNum) ?? [];

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
