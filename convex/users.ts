import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all users
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get user by ID
export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Create user
export const create = mutation({
args: {
  name: v.string(),
  email: v.string(),
  role: v.string(),
  avatar: v.optional(v.string()),
  isActive: v.boolean(),
  labels: v.optional(v.array(v.string())),
  createdAt: v.optional(v.string()),
  lastLogin: v.optional(v.string()),
  passwordHash: v.optional(v.string()),
},
handler: async (ctx, args) => {
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", args.email))
    .first();

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  return await ctx.db.insert("users", {
    name: args.name,
    email: args.email,
    role: args.role,
    avatar: args.avatar,
    isActive: args.isActive,
    labels: args.labels,
    createdAt: args.createdAt,
    lastLogin: args.lastLogin,
    passwordHash: args.passwordHash,
  });
},
});

// Update user
export const update = mutation({
args: {
  id: v.id("users"),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  role: v.optional(v.string()),
  avatar: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
  labels: v.optional(v.array(v.string())),
  createdAt: v.optional(v.string()),
  lastLogin: v.optional(v.string()),
  passwordHash: v.optional(v.string()),
},
handler: async (ctx, args) => {
  const { id, ...updates } = args;
  const user = await ctx.db.get(id);
  if (!user) {
    throw new Error("User not found");
  }
  await ctx.db.patch(id, updates);
  return await ctx.db.get(id);
},
});

// Delete user
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

