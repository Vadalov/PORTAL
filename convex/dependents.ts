import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { hashTcNumber, requireTcNumberAccess, maskTcNumber, validateTcNumber, logTcNumberAccess } from "./tc_security";

// Get all dependents for a beneficiary
export const getBeneficiaryDependents = query({
  args: {
    beneficiaryId: v.id("beneficiaries"),
  },
  handler: async (ctx, args) => {
    const dependents = await ctx.db
      .query("dependents")
      .withIndex("by_beneficiary", (q) => q.eq("beneficiary_id", args.beneficiaryId))
      .collect();

    return dependents;
  },
});

// Create dependent
export const createDependent = mutation({
  args: {
    beneficiaryId: v.id("beneficiaries"),
    name: v.string(),
    relationship: v.string(),
    birthDate: v.optional(v.string()),
    gender: v.optional(v.string()),
    tcNo: v.optional(v.string()),
    phone: v.optional(v.string()),
    educationLevel: v.optional(v.string()),
    occupation: v.optional(v.string()),
    healthStatus: v.optional(v.string()),
    hasDisability: v.optional(v.boolean()),
    disabilityDetail: v.optional(v.string()),
    monthlyIncome: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If TC number is provided, require authentication and proper role
    if (args.tcNo) {
      const userInfo = await requireTcNumberAccess(ctx);
      
      // Validate TC number format
      if (!validateTcNumber(args.tcNo)) {
        throw new Error("Invalid TC number format");
      }
      
      // Hash TC number before storing
      const hashedTc = await hashTcNumber(ctx, args.tcNo);
      
      // Log access for audit trail
      logTcNumberAccess("Dependent creation with TC number", userInfo, maskTcNumber(args.tcNo));
      
      const { beneficiaryId, ...data } = args;
      const dependentId = await ctx.db.insert("dependents", {
        beneficiary_id: beneficiaryId,
        name: data.name,
        relationship: data.relationship,
        birth_date: data.birthDate,
        gender: data.gender,
        tc_no: hashedTc,
        phone: data.phone,
        education_level: data.educationLevel,
        occupation: data.occupation,
        health_status: data.healthStatus,
        has_disability: data.hasDisability || false,
        disability_detail: data.disabilityDetail,
        monthly_income: data.monthlyIncome,
        notes: data.notes,
      });

      return dependentId;
    }
    
    // No TC number, proceed normally
    const { beneficiaryId, ...data } = args;
    const dependentId = await ctx.db.insert("dependents", {
      beneficiary_id: beneficiaryId,
      name: data.name,
      relationship: data.relationship,
      birth_date: data.birthDate,
      gender: data.gender,
      tc_no: undefined,
      phone: data.phone,
      education_level: data.educationLevel,
      occupation: data.occupation,
      health_status: data.healthStatus,
      has_disability: data.hasDisability || false,
      disability_detail: data.disabilityDetail,
      monthly_income: data.monthlyIncome,
      notes: data.notes,
    });

    return dependentId;
  },
});

// Update dependent
export const updateDependent = mutation({
  args: {
    dependentId: v.id("dependents"),
    name: v.optional(v.string()),
    relationship: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    gender: v.optional(v.string()),
    tcNo: v.optional(v.string()),
    phone: v.optional(v.string()),
    educationLevel: v.optional(v.string()),
    occupation: v.optional(v.string()),
    healthStatus: v.optional(v.string()),
    hasDisability: v.optional(v.boolean()),
    disabilityDetail: v.optional(v.string()),
    monthlyIncome: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If TC number is being updated, require authentication and proper role
    if (args.tcNo !== undefined) {
      const userInfo = await requireTcNumberAccess(ctx);
      
      if (args.tcNo) {
        // Validate TC number format
        if (!validateTcNumber(args.tcNo)) {
          throw new Error("Invalid TC number format");
        }
        
        // Hash TC number before storing
        const hashedTc = await hashTcNumber(ctx, args.tcNo);
        
        // Log access for audit trail
        logTcNumberAccess("Dependent TC number update", userInfo, maskTcNumber(args.tcNo));
        
        const { dependentId, ...updates } = args;
        const patch: {
          name?: string;
          relationship?: string;
          birth_date?: string;
          gender?: string;
          tc_no?: string;
          phone?: string;
          education_level?: string;
          occupation?: string;
          health_status?: string;
          has_disability?: boolean;
          disability_detail?: string;
          monthly_income?: number;
          notes?: string;
        } = {};
        
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.relationship !== undefined) patch.relationship = updates.relationship;
        if (updates.birthDate !== undefined) patch.birth_date = updates.birthDate;
        if (updates.gender !== undefined) patch.gender = updates.gender;
        patch.tc_no = hashedTc; // Use hashed value
        if (updates.phone !== undefined) patch.phone = updates.phone;
        if (updates.educationLevel !== undefined) patch.education_level = updates.educationLevel;
        if (updates.occupation !== undefined) patch.occupation = updates.occupation;
        if (updates.healthStatus !== undefined) patch.health_status = updates.healthStatus;
        if (updates.hasDisability !== undefined) patch.has_disability = updates.hasDisability;
        if (updates.disabilityDetail !== undefined) patch.disability_detail = updates.disabilityDetail;
        if (updates.monthlyIncome !== undefined) patch.monthly_income = updates.monthlyIncome;
        if (updates.notes !== undefined) patch.notes = updates.notes;

        await ctx.db.patch(dependentId, patch);
        return { success: true };
      } else {
        // TC number is being removed (set to undefined)
        const { dependentId, ...updates } = args;
        const patch: {
          name?: string;
          relationship?: string;
          birth_date?: string;
          gender?: string;
          tc_no?: string;
          phone?: string;
          education_level?: string;
          occupation?: string;
          health_status?: string;
          has_disability?: boolean;
          disability_detail?: string;
          monthly_income?: number;
          notes?: string;
        } = {};
        
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.relationship !== undefined) patch.relationship = updates.relationship;
        if (updates.birthDate !== undefined) patch.birth_date = updates.birthDate;
        if (updates.gender !== undefined) patch.gender = updates.gender;
        patch.tc_no = undefined;
        if (updates.phone !== undefined) patch.phone = updates.phone;
        if (updates.educationLevel !== undefined) patch.education_level = updates.educationLevel;
        if (updates.occupation !== undefined) patch.occupation = updates.occupation;
        if (updates.healthStatus !== undefined) patch.health_status = updates.healthStatus;
        if (updates.hasDisability !== undefined) patch.has_disability = updates.hasDisability;
        if (updates.disabilityDetail !== undefined) patch.disability_detail = updates.disabilityDetail;
        if (updates.monthlyIncome !== undefined) patch.monthly_income = updates.monthlyIncome;
        if (updates.notes !== undefined) patch.notes = updates.notes;

        await ctx.db.patch(dependentId, patch);
        return { success: true };
      }
    }
    
    // No TC number update, proceed normally
    const { dependentId, ...updates } = args;
    const patch: {
      name?: string;
      relationship?: string;
      birth_date?: string;
      gender?: string;
      phone?: string;
      education_level?: string;
      occupation?: string;
      health_status?: string;
      has_disability?: boolean;
      disability_detail?: string;
      monthly_income?: number;
      notes?: string;
    } = {};
    
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.relationship !== undefined) patch.relationship = updates.relationship;
    if (updates.birthDate !== undefined) patch.birth_date = updates.birthDate;
    if (updates.gender !== undefined) patch.gender = updates.gender;
    if (updates.phone !== undefined) patch.phone = updates.phone;
    if (updates.educationLevel !== undefined) patch.education_level = updates.educationLevel;
    if (updates.occupation !== undefined) patch.occupation = updates.occupation;
    if (updates.healthStatus !== undefined) patch.health_status = updates.healthStatus;
    if (updates.hasDisability !== undefined) patch.has_disability = updates.hasDisability;
    if (updates.disabilityDetail !== undefined) patch.disability_detail = updates.disabilityDetail;
    if (updates.monthlyIncome !== undefined) patch.monthly_income = updates.monthlyIncome;
    if (updates.notes !== undefined) patch.notes = updates.notes;

    await ctx.db.patch(dependentId, patch);
    return { success: true };
  },
});

// Delete dependent
export const deleteDependent = mutation({
  args: {
    dependentId: v.id("dependents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.dependentId);
    return { success: true };
  },
});

