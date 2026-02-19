import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("scars")
      .withIndex("by_patient", (q) => q.eq("patientId", patientId))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return ctx.db
      .query("scars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
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
    fundusGrade: v.number(),
    fundusConfidence: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High")
    ),
    predictedOct: v.number(),
    afGrade: v.number(),
    afConfidence: v.optional(
      v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"))
    ),
    revisedOct: v.optional(v.number()),
    actualOct: v.number(),
    ezIntact: v.boolean(),
    // Images — actual patient photos
    fundusImageId: v.optional(v.id("_storage")),
    afImageId: v.optional(v.id("_storage")),
    octImageId: v.optional(v.id("_storage")),
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
    isRegradeOf: v.optional(v.id("scars")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return ctx.db.insert("scars", {
      ...args,
      userId: identity.subject,
      graderId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const listAllWithPatients = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const scars = await ctx.db
      .query("scars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    // Join with patient data
    const results = await Promise.all(
      scars.map(async (scar) => {
        const patient = await ctx.db.get(scar.patientId);
        return {
          ...scar,
          patientCode: patient?.patientCode ?? "Unknown",
          laserGroup: patient?.laserGroup ?? "Unknown",
          timeSinceTreatmentYears: patient?.timeSinceTreatmentYears ?? 0,
        };
      })
    );
    return results;
  },
});

// Inter-rater: list all scars for a patient by ALL graders
export const listByPatientAllGraders = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("scars")
      .withIndex("by_patient", (q) => q.eq("patientId", patientId))
      .collect();
  },
});

// Inter-rater: list distinct grader IDs across all scars
export const listGraders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    // Get all scars (not filtered by user — inter-rater needs all graders)
    const allScars = await ctx.db.query("scars").collect();
    const graderIds = [...new Set(allScars.map((s) => s.graderId))];
    return graderIds;
  },
});

// Inter-rater: list all scars grouped by scarCode (for pair matching)
export const listAllForInterRater = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    // Return all non-regrade scars with patient info
    const allScars = await ctx.db.query("scars").collect();
    const originals = allScars.filter((s) => !s.isRegradeOf);
    const results = await Promise.all(
      originals.map(async (scar) => {
        const patient = await ctx.db.get(scar.patientId);
        return {
          _id: scar._id,
          scarCode: scar.scarCode,
          graderId: scar.graderId,
          patientCode: patient?.patientCode ?? "Unknown",
          fundusGrade: scar.fundusGrade,
          predictedOct: scar.predictedOct,
          afGrade: scar.afGrade,
          actualOct: scar.actualOct,
          ezIntact: scar.ezIntact,
        };
      })
    );
    return results;
  },
});

// Intra-rater: list eligible scars for re-grading
// Original scars by this user, graded 14+ days ago, not already re-graded
export const listEligibleForRegrade = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const allScars = await ctx.db
      .query("scars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    // Find originals (not re-grades themselves)
    const originals = allScars.filter((s) => !s.isRegradeOf);
    // Find which originals have already been re-graded
    const regradeTargets = new Set(
      allScars.filter((s) => s.isRegradeOf).map((s) => s.isRegradeOf)
    );
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const eligible = originals.filter(
      (s) => s.createdAt < twoWeeksAgo && !regradeTargets.has(s._id)
    );
    // Join with patient data
    const results = await Promise.all(
      eligible.map(async (scar) => {
        const patient = await ctx.db.get(scar.patientId);
        return {
          _id: scar._id,
          scarCode: scar.scarCode,
          patientId: scar.patientId,
          patientCode: patient?.patientCode ?? "Unknown",
          quadrant: scar.quadrant,
          zone: scar.zone,
          createdAt: scar.createdAt,
        };
      })
    );
    return results;
  },
});

// Intra-rater: list re-grade pairs (original + re-grade) for this user
export const listRegradePairs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const allScars = await ctx.db
      .query("scars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const regrades = allScars.filter((s) => s.isRegradeOf);
    const pairs = await Promise.all(
      regrades.map(async (regrade) => {
        const original = await ctx.db.get(regrade.isRegradeOf!);
        const patient = await ctx.db.get(regrade.patientId);
        return {
          scarCode: regrade.scarCode,
          patientCode: patient?.patientCode ?? "Unknown",
          original: original
            ? {
                fundusGrade: original.fundusGrade,
                predictedOct: original.predictedOct,
                afGrade: original.afGrade,
                actualOct: original.actualOct,
              }
            : null,
          regrade: {
            fundusGrade: regrade.fundusGrade,
            predictedOct: regrade.predictedOct,
            afGrade: regrade.afGrade,
            actualOct: regrade.actualOct,
          },
        };
      })
    );
    return pairs.filter((p) => p.original !== null);
  },
});

export const nextScarCode = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return "S01";
    const patient = await ctx.db.get(patientId);
    if (!patient) return "S01";
    const scars = await ctx.db
      .query("scars")
      .withIndex("by_patient", (q) => q.eq("patientId", patientId))
      .collect();
    const num = scars.length + 1;
    return `${patient.patientCode}-S${String(num).padStart(2, "0")}`;
  },
});
