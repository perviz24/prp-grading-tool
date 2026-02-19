import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate an upload URL for the client to upload files directly
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a serving URL for a storage ID
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// Save a reference image for a specific modality + grade
export const saveReferenceImage = mutation({
  args: {
    modality: v.string(),
    gradeNumber: v.number(),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, { modality, gradeNumber, imageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return ctx.db.insert("referenceImages", {
      userId: identity.subject,
      modality,
      gradeNumber,
      imageId,
      createdAt: Date.now(),
    });
  },
});

// Get all reference images for a modality
export const listReferenceImages = query({
  args: { modality: v.string() },
  handler: async (ctx, { modality }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const images = await ctx.db
      .query("referenceImages")
      .withIndex("by_modality", (q) => q.eq("modality", modality))
      .collect();
    // Resolve URLs
    const result = await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.imageId),
      }))
    );
    return result;
  },
});

// Delete a reference image
export const deleteReferenceImage = mutation({
  args: { id: v.id("referenceImages") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const img = await ctx.db.get(id);
    if (img) {
      await ctx.storage.delete(img.imageId);
      await ctx.db.delete(id);
    }
  },
});
