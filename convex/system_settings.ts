import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all settings
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("system_settings").collect();
    
    // Group by category
    const grouped: Record<string, Record<string, any>> = {};
    for (const setting of settings) {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }
      grouped[setting.category][setting.key] = setting.value;
    }
    
    return grouped;
  },
});

// Get settings by category
export const getSettingsByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("system_settings")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    
    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    
    return result;
  },
});

// Get a single setting
export const getSetting = query({
  args: {
    category: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("system_settings")
      .withIndex("by_category_key", (q) => 
        q.eq("category", args.category).eq("key", args.key)
      )
      .first();
    
    return setting?.value ?? null;
  },
});

// Update settings for a category (bulk update)
export const updateSettings = mutation({
  args: {
    category: v.string(),
    settings: v.object({}), // Dynamic object with key-value pairs
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const settingsObj = args.settings as Record<string, any>;
    const updatedAt = new Date().toISOString();
    
    for (const [key, value] of Object.entries(settingsObj)) {
      // Determine data type
      let dataType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';
      if (typeof value === 'number') dataType = 'number';
      else if (typeof value === 'boolean') dataType = 'boolean';
      else if (Array.isArray(value)) dataType = 'array';
      else if (typeof value === 'object' && value !== null) dataType = 'object';
      
      // Check if setting exists
      const existing = await ctx.db
        .query("system_settings")
        .withIndex("by_category_key", (q) => 
          q.eq("category", args.category).eq("key", key)
        )
        .first();
      
      if (existing) {
        // Update existing
        await ctx.db.patch(existing._id, {
          value,
          data_type: dataType,
          updated_by: args.updatedBy,
          updated_at: updatedAt,
        });
      } else {
        // Create new
        await ctx.db.insert("system_settings", {
          category: args.category,
          key,
          value,
          data_type: dataType,
          is_sensitive: key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key'),
          updated_by: args.updatedBy,
          updated_at: updatedAt,
        });
      }
    }
    
    return { success: true };
  },
});

// Update a single setting
export const updateSetting = mutation({
  args: {
    category: v.string(),
    key: v.string(),
    value: v.any(),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const updatedAt = new Date().toISOString();
    
    // Determine data type
    let dataType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';
    if (typeof args.value === 'number') dataType = 'number';
    else if (typeof args.value === 'boolean') dataType = 'boolean';
    else if (Array.isArray(args.value)) dataType = 'array';
    else if (typeof args.value === 'object' && args.value !== null) dataType = 'object';
    
    // Check if setting exists
    const existing = await ctx.db
      .query("system_settings")
      .withIndex("by_category_key", (q) => 
        q.eq("category", args.category).eq("key", args.key)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        data_type: dataType,
        updated_by: args.updatedBy,
        updated_at: updatedAt,
      });
    } else {
      await ctx.db.insert("system_settings", {
        category: args.category,
        key: args.key,
        value: args.value,
        data_type: dataType,
        is_sensitive: args.key.toLowerCase().includes('password') || args.key.toLowerCase().includes('secret') || args.key.toLowerCase().includes('key'),
        updated_by: args.updatedBy,
        updated_at: updatedAt,
      });
    }
    
    return { success: true };
  },
});

// Reset settings to defaults
export const resetSettings = mutation({
  args: {
    category: v.optional(v.string()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // If category specified, reset only that category
    if (args.category) {
      const category = args.category; // Type narrowing
      const settings = await ctx.db
        .query("system_settings")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
      
      for (const setting of settings) {
        await ctx.db.delete(setting._id);
      }
    } else {
      // Reset all settings
      const allSettings = await ctx.db.query("system_settings").collect();
      for (const setting of allSettings) {
        await ctx.db.delete(setting._id);
      }
    }
    
    return { success: true };
  },
});

