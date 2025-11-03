import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List finance records with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    record_type: v.optional(v.string()),
    status: v.optional(v.string()),
    created_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let records;
    
    if (args.record_type) {
      records = await ctx.db
        .query("finance_records")
        .withIndex("by_record_type", (q) => q.eq("record_type", args.record_type as "income" | "expense"))
        .collect();
    } else if (args.status) {
      records = await ctx.db
        .query("finance_records")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "approved" | "rejected"))
        .collect();
    } else if (args.created_by) {
      records = await ctx.db
        .query("finance_records")
        .withIndex("by_created_by", (q) => q.eq("created_by", args.created_by!))
        .collect();
    } else {
      records = await ctx.db.query("finance_records").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = records.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: records.length,
    };
  },
});

// Get finance record by ID
export const get = query({
  args: { id: v.id("finance_records") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create finance record
export const create = mutation({
  args: {
    record_type: v.union(v.literal("income"), v.literal("expense")),
    category: v.string(),
    amount: v.number(),
    currency: v.union(v.literal("TRY"), v.literal("USD"), v.literal("EUR")),
    description: v.string(),
    transaction_date: v.string(),
    payment_method: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    receipt_file_id: v.optional(v.string()),
    related_to: v.optional(v.string()),
    created_by: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("finance_records", args);
  },
});

// Update finance record
export const update = mutation({
  args: {
    id: v.id("finance_records"),
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.union(v.literal("TRY"), v.literal("USD"), v.literal("EUR"))),
    description: v.optional(v.string()),
    transaction_date: v.optional(v.string()),
    payment_method: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    receipt_file_id: v.optional(v.string()),
    related_to: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
    approved_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const record = await ctx.db.get(id);
    if (!record) {
      throw new Error("Finance record not found");
    }

    // Auto-set approved_by when status changes to approved
    if (updates.status === "approved" && !updates.approved_by && record.created_by) {
      // In a real scenario, you'd get this from auth context
      // For now, we'll leave it as is
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete finance record
export const remove = mutation({
  args: { id: v.id("finance_records") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) {
      throw new Error("Finance record not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

