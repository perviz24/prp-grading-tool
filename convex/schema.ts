import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    userId: v.string(),
    patientCode: v.string(),
    laserGroup: v.union(v.literal("A-Modern"), v.literal("B-Konventionell")),
    laserApparatus: v.union(
      v.literal("Valon"),
      v.literal("Navilas"),
      v.literal("Argon"),
      v.literal("Other")
    ),
    power_mW: v.optional(v.number()),
    spotSize_um: v.optional(v.number()),
    duration_ms: v.optional(v.number()),
    pattern: v.union(v.literal("Single"), v.literal("Pattern")),
    wavelength_nm: v.optional(v.number()),
    numBurns: v.optional(v.number()),
    timeSinceTreatmentYears: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  scars: defineTable({
    userId: v.string(),
    patientId: v.id("patients"),
    scarCode: v.string(),
    quadrant: v.union(
      v.literal("Superior"),
      v.literal("Inferior"),
      v.literal("Nasal"),
      v.literal("Temporal")
    ),
    zone: v.union(
      v.literal("Central"),
      v.literal("Mid"),
      v.literal("Peripheral")
    ),
    // Step 1: Fundus grading
    fundusGrade: v.number(),
    fundusConfidence: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High")
    ),
    // Step 2: Predict OCT from fundus
    predictedOct: v.number(),
    // Step 3: AF grading
    afGrade: v.number(),
    afConfidence: v.optional(
      v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"))
    ),
    // Step 4: Revised OCT prediction (after seeing AF)
    revisedOct: v.optional(v.number()),
    // Step 5: Actual OCT + EZ line status
    actualOct: v.number(),
    ezStatus: v.union(
      v.literal("Intact"),
      v.literal("Disrupted"),
      v.literal("Not visible")
    ),
    ezConfidence: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    // Images — actual patient photos (storage IDs)
    fundusImageId: v.optional(v.id("_storage")),
    afImageId: v.optional(v.id("_storage")),
    octImageId: v.optional(v.id("_storage")),
    // Metadata
    comment: v.optional(v.string()),
    stepTimestamps: v.object({
      fundusStart: v.optional(v.number()),
      fundusEnd: v.optional(v.number()),
      predictStart: v.optional(v.number()),
      predictEnd: v.optional(v.number()),
      afStart: v.optional(v.number()),
      afEnd: v.optional(v.number()),
      reviseStart: v.optional(v.number()),
      reviseEnd: v.optional(v.number()),
      octStart: v.optional(v.number()),
      octEnd: v.optional(v.number()),
      confirmEnd: v.optional(v.number()),
    }),
    // Inter-rater: which grader
    graderId: v.string(),
    // Intra-rater: links to original scar being re-graded
    isRegradeOf: v.optional(v.id("scars")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_patient", ["patientId"])
    .index("by_grader", ["graderId"]),

  // Reference images — example photos for each grade level
  referenceImages: defineTable({
    userId: v.string(),
    // "fundus" | "oct" | "af"
    modality: v.string(),
    // Grade number (1–4)
    gradeNumber: v.number(),
    imageId: v.id("_storage"),
    createdAt: v.number(),
  }).index("by_modality", ["modality", "gradeNumber"]),
});
