import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all documents for a beneficiary
export const getBeneficiaryDocuments = query({
  args: {
    beneficiaryId: v.id("beneficiaries"),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("files")
      .withIndex("by_beneficiary", (q) => q.eq("beneficiary_id", args.beneficiaryId))
      .collect();

    // Get file URLs for each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );

    return documentsWithUrls;
  },
});

// Get file by storage ID
export const getFileByStorageId = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("files")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .first();

    if (!file) {
      return null;
    }

    const url = await ctx.storage.getUrl(args.storageId);

    return {
      ...file,
      url,
    };
  },
});

// Create document metadata
export const createDocument = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    bucket: v.string(),
    storageId: v.id("_storage"),
    beneficiaryId: v.id("beneficiaries"),
    documentType: v.optional(v.string()),
    uploadedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("files", {
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      bucket: args.bucket,
      storageId: args.storageId,
      beneficiary_id: args.beneficiaryId,
      document_type: args.documentType || "other",
      uploadedBy: args.uploadedBy,
      uploadedAt: new Date().toISOString(),
    });

    return documentId;
  },
});

// Delete document
export const deleteDocument = mutation({
  args: {
    documentId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete from storage
    await ctx.storage.delete(document.storageId);

    // Delete metadata
    await ctx.db.delete(args.documentId);

    return { success: true };
  },
});

// Get upload URL
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

