import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const patient = await ctx.db.get(patientId);
    if (!patient || patient.userId !== identity.subject) return null;
    return patient;
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return ctx.db.insert("patients", {
      ...args,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const nextCode = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return "P001";
    const userId = identity.subject;
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const num = patients.length + 1;
    return `P${String(num).padStart(3, "0")}`;
  },
});
