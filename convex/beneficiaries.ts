import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import {
  hashTcNumber,
  requireTcNumberAccess,
  maskTcNumber,
  validateTcNumber,
  logTcNumberAccess,
  canAccessTcNumber,
} from './tc_security';

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
        .query('beneficiaries')
        .withIndex('by_status', (q) =>
          q.eq('status', args.status as 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI')
        )
        .collect();
    } else if (args.city) {
      beneficiaries = await ctx.db
        .query('beneficiaries')
        .withIndex('by_city', (q) => q.eq('city', args.city!))
        .collect();
    } else {
      beneficiaries = await ctx.db.query('beneficiaries').collect();
    }

    // Apply search filter if provided
    let filtered = beneficiaries;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      // For TC number search, we need to hash the search term
      let hashedSearch: string | null = null;
      if (/^\d{11}$/.test(args.search)) {
        try {
          hashedSearch = await hashTcNumber(ctx, args.search);
        } catch {
          // Invalid TC number format, skip hashing
        }
      }

      filtered = beneficiaries.filter(
        (b) =>
          b.name.toLowerCase().includes(searchLower) ||
          (hashedSearch && b.tc_no === hashedSearch) ||
          (hashedSearch === null && b.tc_no.includes(searchLower)) || // Support legacy plain values during migration
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
  args: { id: v.id('beneficiaries') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get beneficiary by TC number
// Requires authentication and ADMIN/MANAGER role
export const getByTcNo = query({
  args: { tc_no: v.string() },
  handler: async (ctx, args) => {
    // Require authentication and proper role
    const userInfo = await requireTcNumberAccess(ctx);

    // Validate TC number format
    if (!validateTcNumber(args.tc_no)) {
      throw new Error('Invalid TC number format');
    }

    // Hash TC number for lookup
    const hashedTc = await hashTcNumber(ctx, args.tc_no);

    // Log access for audit trail
    logTcNumberAccess('TC number lookup', userInfo, maskTcNumber(args.tc_no));

    // Search using hashed value
    // Note: For migration, we check both hashed and plain values
    const beneficiary = await ctx.db
      .query('beneficiaries')
      .withIndex('by_tc_no', (q) => q.eq('tc_no', hashedTc))
      .first();

    // If not found with hash, try plain (for backward compatibility during migration)
    // Note: Migration to hashed values should be done via a separate migration script
    // For now, we just return null if not found with hash
    if (!beneficiary) {
      const plainBeneficiary = await ctx.db
        .query('beneficiaries')
        .withIndex('by_tc_no', (q) => q.eq('tc_no', args.tc_no))
        .first();

      // Return plain beneficiary if found (migration will happen separately)
      if (plainBeneficiary) {
        return plainBeneficiary;
      }
    }

    return beneficiary;
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
      v.literal('TASLAK'),
      v.literal('AKTIF'),
      v.literal('PASIF'),
      v.literal('SILINDI')
    ),
    approval_status: v.optional(
      v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected'))
    ),
    approved_by: v.optional(v.string()),
    approved_at: v.optional(v.string()),
    auth: v.optional(
      v.object({
        userId: v.string(),
        role: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { auth, ...payload } = args;

    // Require authentication and proper role for TC number access
    const userInfo = auth
      ? (() => {
          if (!canAccessTcNumber(auth.role)) {
            throw new Error('Unauthorized: Insufficient permissions to access TC number data');
          }
          return auth;
        })()
      : await requireTcNumberAccess(ctx);

    // Validate TC number format
    if (!validateTcNumber(payload.tc_no)) {
      throw new Error('Invalid TC number format');
    }

    // Hash TC number before storing
    const hashedTc = await hashTcNumber(ctx, payload.tc_no);

    // Log access for audit trail
    logTcNumberAccess('Beneficiary creation with TC number', userInfo, maskTcNumber(payload.tc_no));

    // Check if TC number already exists (using hashed value)
    const existing = await ctx.db
      .query('beneficiaries')
      .withIndex('by_tc_no', (q) => q.eq('tc_no', hashedTc))
      .first();

    if (existing) {
      throw new Error('Beneficiary with this TC number already exists');
    }

    // Insert with hashed TC number
    return await ctx.db.insert('beneficiaries', {
      ...payload,
      tc_no: hashedTc,
    });
  },
});

// Update beneficiary
export const update = mutation({
  args: {
    id: v.id('beneficiaries'),
    name: v.optional(v.string()),
    tc_no: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('TASLAK'), v.literal('AKTIF'), v.literal('PASIF'), v.literal('SILINDI'))
    ),
    auth: v.optional(
      v.object({
        userId: v.string(),
        role: v.string(),
      })
    ),
    // Add other optional fields as needed
  },
  handler: async (ctx, args) => {
    const { id, auth, ...rawUpdates } = args;

    // Require authentication and proper role for TC number access
    const userInfo = auth
      ? (() => {
          if (!canAccessTcNumber(auth.role)) {
            throw new Error('Unauthorized: Insufficient permissions to access TC number data');
          }
          return auth;
        })()
      : await requireTcNumberAccess(ctx);

    const updates = { ...rawUpdates };
    const beneficiary = await ctx.db.get(id);
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    // If TC number is being updated, validate and hash it
    if (updates.tc_no) {
      if (!validateTcNumber(updates.tc_no)) {
        throw new Error('Invalid TC number format');
      }

      const hashedTc = await hashTcNumber(ctx, updates.tc_no);

      // Log access for audit trail
      logTcNumberAccess('Beneficiary TC number update', userInfo, maskTcNumber(updates.tc_no));

      // Check for duplicates using hashed value
      if (hashedTc !== beneficiary.tc_no) {
        const existing = await ctx.db
          .query('beneficiaries')
          .withIndex('by_tc_no', (q) => q.eq('tc_no', hashedTc))
          .first();

        if (existing) {
          throw new Error('Beneficiary with this TC number already exists');
        }
      }

      // Replace with hashed value
      updates.tc_no = hashedTc;
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete beneficiary
export const remove = mutation({
  args: { id: v.id('beneficiaries') },
  handler: async (ctx, args) => {
    const beneficiary = await ctx.db.get(args.id);
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
