import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate upload URL for Convex fileStorage
 * This action generates a signed URL that can be used to upload files directly
 */
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    // Generate upload URL using Convex fileStorage
    // Note: This requires Convex fileStorage to be enabled
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Store file metadata after successful upload
 * This mutation stores metadata about the uploaded file
 */
export const storeFileMetadata = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    bucket: v.string(),
    storageId: v.id("_storage"), // Convex fileStorage ID
    uploadedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      bucket: args.bucket,
      storageId: args.storageId,
      uploadedBy: args.uploadedBy,
      uploadedAt: new Date().toISOString(),
    });
  },
});

/**
 * Get file download URL from Convex fileStorage
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Get file URL from Convex fileStorage
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete file from Convex fileStorage
 */
export const deleteFile = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Delete file from Convex fileStorage
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});

/**
 * Get file metadata
 */
export const getFileMetadata = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

/**
 * Get file metadata by storage ID
 */
export const getFileMetadataByStorageId = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .first();
  },
});

/**
 * Delete file metadata
 */
export const deleteFileMetadata = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    await ctx.db.delete(args.fileId);
    return { success: true };
  },
});

