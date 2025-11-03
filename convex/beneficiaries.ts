import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List beneficiaries with pagination and filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let beneficiaries;
    
    if (args.status) {
      beneficiaries = await ctx.db
        .query("beneficiaries")
        .withIndex("by_status", (q) => q.eq("status", args.status as "TASLAK" | "AKTIF" | "PASIF" | "SILINDI"))
        .collect();
    } else if (args.city) {
      beneficiaries = await ctx.db
        .query("beneficiaries")
        .withIndex("by_city", (q) => q.eq("city", args.city!))
        .collect();
    } else {
      beneficiaries = await ctx.db.query("beneficiaries").collect();
    }

    // Apply search filter if provided
    let filtered = beneficiaries;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filtered = beneficiaries.filter(
        (b) =>
          b.name.toLowerCase().includes(searchLower) ||
          b.tc_no.includes(searchLower) ||
          b.phone.includes(searchLower) ||
          (b.email && b.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: filtered.length,
    };
  },
});

// Get beneficiary by ID
export const get = query({
  args: { id: v.id("beneficiaries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get beneficiary by TC number
export const getByTcNo = query({
  args: { tc_no: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("beneficiaries")
      .withIndex("by_tc_no", (q) => q.eq("tc_no", args.tc_no))
      .first();
  },
});

// Create beneficiary
export const create = mutation({
  args: {
    name: v.string(),
    tc_no: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    birth_date: v.optional(v.string()),
    gender: v.optional(v.string()),
    nationality: v.optional(v.string()),
    religion: v.optional(v.string()),
    marital_status: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    district: v.string(),
    neighborhood: v.string(),
    family_size: v.number(),
    children_count: v.optional(v.number()),
    orphan_children_count: v.optional(v.number()),
    elderly_count: v.optional(v.number()),
    disabled_count: v.optional(v.number()),
    income_level: v.optional(v.string()),
    income_source: v.optional(v.string()),
    has_debt: v.optional(v.boolean()),
    housing_type: v.optional(v.string()),
    has_vehicle: v.optional(v.boolean()),
    health_status: v.optional(v.string()),
    has_chronic_illness: v.optional(v.boolean()),
    chronic_illness_detail: v.optional(v.string()),
    has_disability: v.optional(v.boolean()),
    disability_detail: v.optional(v.string()),
    has_health_insurance: v.optional(v.boolean()),
    regular_medication: v.optional(v.string()),
    education_level: v.optional(v.string()),
    occupation: v.optional(v.string()),
    employment_status: v.optional(v.string()),
    aid_type: v.optional(v.string()),
    totalAidAmount: v.optional(v.number()),
    aid_duration: v.optional(v.string()),
    priority: v.optional(v.string()),
    reference_name: v.optional(v.string()),
    reference_phone: v.optional(v.string()),
    reference_relation: v.optional(v.string()),
    application_source: v.optional(v.string()),
    notes: v.optional(v.string()),
    previous_aid: v.optional(v.boolean()),
    other_organization_aid: v.optional(v.boolean()),
    emergency: v.optional(v.boolean()),
    contact_preference: v.optional(v.string()),
    status: v.union(
      v.literal("TASLAK"),
      v.literal("AKTIF"),
      v.literal("PASIF"),
      v.literal("SILINDI")
    ),
    approval_status: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
    ),
    approved_by: v.optional(v.string()),
    approved_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if TC number already exists
    const existing = await ctx.db
      .query("beneficiaries")
      .withIndex("by_tc_no", (q) => q.eq("tc_no", args.tc_no))
      .first();

    if (existing) {
      throw new Error("Beneficiary with this TC number already exists");
    }

    return await ctx.db.insert("beneficiaries", args);
  },
});

// Update beneficiary
export const update = mutation({
  args: {
    id: v.id("beneficiaries"),
    name: v.optional(v.string()),
    tc_no: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("TASLAK"),
        v.literal("AKTIF"),
        v.literal("PASIF"),
        v.literal("SILINDI")
      )
    ),
    // Add other optional fields as needed
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const beneficiary = await ctx.db.get(id);
    if (!beneficiary) {
      throw new Error("Beneficiary not found");
    }

    // If TC number is being updated, check for duplicates
    if (updates.tc_no && updates.tc_no !== beneficiary.tc_no) {
      const existing = await ctx.db
        .query("beneficiaries")
        .withIndex("by_tc_no", (q) => q.eq("tc_no", updates.tc_no as string))
        .first();

      if (existing) {
        throw new Error("Beneficiary with this TC number already exists");
      }
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete beneficiary
export const remove = mutation({
  args: { id: v.id("beneficiaries") },
  handler: async (ctx, args) => {
    const beneficiary = await ctx.db.get(args.id);
    if (!beneficiary) {
      throw new Error("Beneficiary not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

