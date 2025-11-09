import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Export data from any collection
export const exportCollectionData = query({
  args: {
    collectionName: v.union(
      v.literal("users"),
      v.literal("beneficiaries"),
      v.literal("donations"),
      v.literal("finance_records"),
      v.literal("tasks"),
      v.literal("meetings")
    ),
    filters: v.optional(v.object({
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      status: v.optional(v.string()),
    })),
    format: v.optional(v.union(v.literal("json"), v.literal("csv"))),
  },
  handler: async (ctx, args) => {
    const { collectionName, filters, format = "json" } = args;

    // Fetch data based on collection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] = [];
    
    switch (collectionName) {
      case "users":
        data = await ctx.db.query("users").collect();
        break;
      case "beneficiaries":
        data = await ctx.db.query("beneficiaries").collect();
        break;
      case "donations":
        data = await ctx.db.query("donations").collect();
        break;
      case "finance_records":
        data = await ctx.db.query("finance_records").collect();
        break;
      case "tasks":
        data = await ctx.db.query("tasks").collect();
        break;
      case "meetings":
        data = await ctx.db.query("meetings").collect();
        break;
    }

    // Apply filters if provided
    if (filters) {
      if (filters.startDate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = data.filter((item: any) => {
          const itemDate = new Date(item.created_at || item.transaction_date || item.donation_date);
          return itemDate >= new Date(filters.startDate!);
        });
      }
      if (filters.endDate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = data.filter((item: any) => {
          const itemDate = new Date(item.created_at || item.transaction_date || item.donation_date);
          return itemDate <= new Date(filters.endDate!);
        });
      }
      if (filters.status) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = data.filter((item: any) => item.status === filters.status);
      }
    }

    return {
      collection: collectionName,
      count: data.length,
      data,
      exportedAt: new Date().toISOString(),
      format,
    };
  },
});

// Batch import data validation
export const validateImportData = query({
  args: {
    collectionName: v.string(),
    data: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const { collectionName, data } = args;
    const errors: Array<{ row: number; field: string; message: string }> = [];
    const warnings: Array<{ row: number; field: string; message: string }> = [];

    // Validation rules per collection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((item: any, index: number) => {
      const rowNum = index + 1;

      // Common validations
      if (collectionName === "beneficiaries") {
        if (!item.name) {
          errors.push({ row: rowNum, field: "name", message: "Name is required" });
        }
        if (!item.tc_number || item.tc_number.length !== 11) {
          errors.push({ row: rowNum, field: "tc_number", message: "TC number must be 11 digits" });
        }
        if (item.phone && !item.phone.match(/^\+90\d{10}$/)) {
          warnings.push({ row: rowNum, field: "phone", message: "Phone format should be +90XXXXXXXXXX" });
        }
      }

      if (collectionName === "donations") {
        if (!item.donor_name) {
          errors.push({ row: rowNum, field: "donor_name", message: "Donor name is required" });
        }
        if (!item.amount || item.amount <= 0) {
          errors.push({ row: rowNum, field: "amount", message: "Amount must be positive" });
        }
      }

      if (collectionName === "finance_records") {
        if (!item.record_type || !["income", "expense"].includes(item.record_type)) {
          errors.push({ row: rowNum, field: "record_type", message: "Record type must be income or expense" });
        }
        if (!item.amount || item.amount <= 0) {
          errors.push({ row: rowNum, field: "amount", message: "Amount must be positive" });
        }
      }
    });

    return {
      valid: errors.length === 0,
      totalRows: data.length,
      errors,
      warnings,
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
      },
    };
  },
});

// Import data with validation
export const importData = mutation({
  args: {
    collectionName: v.union(
      v.literal("beneficiaries"),
      v.literal("donations"),
      v.literal("finance_records")
    ),
    data: v.array(v.any()),
    mode: v.union(
      v.literal("insert"),
      v.literal("update"),
      v.literal("upsert")
    ),
    importedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { collectionName, data, mode, importedBy } = args;
    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        // const rowNum = i + 1;

        if (mode === "insert") {
          // Insert new record
          await ctx.db.insert(collectionName, {
            ...item,
            created_at: new Date().toISOString(),
            imported_by: importedBy,
          });
          results.inserted++;
        } else if (mode === "update" && item._id) {
          // Update existing record
          await ctx.db.patch(item._id, {
            ...item,
            updated_at: new Date().toISOString(),
            updated_by: importedBy,
          });
          results.updated++;
        } else if (mode === "upsert") {
          // Check if record exists (by unique field)
          let existing = null;
          
          if (collectionName === "beneficiaries" && item.tc_number) {
            const beneficiaries = await ctx.db.query("beneficiaries").collect();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            existing = beneficiaries.find((b: any) => b.tc_number === item.tc_number);
          }

          if (existing) {
            await ctx.db.patch(existing._id, {
              ...item,
              updated_at: new Date().toISOString(),
              updated_by: importedBy,
            });
            results.updated++;
          } else {
            await ctx.db.insert(collectionName, {
              ...item,
              created_at: new Date().toISOString(),
              imported_by: importedBy,
            });
            results.inserted++;
          }
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Log import activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.insert("import_logs" as any, {
      collection: collectionName,
      mode,
      imported_by: importedBy,
      imported_at: new Date().toISOString(),
      total_rows: data.length,
      inserted: results.inserted,
      updated: results.updated,
      failed: results.failed,
    });

    return results;
  },
});

// Get import history
export const getImportHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await ctx.db
      .query("import_logs" as any)
      .order("desc")
      .take(limit);
  },
});

// Create backup snapshot
export const createBackupSnapshot = mutation({
  args: {
    collections: v.array(v.string()),
    createdBy: v.id("users"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { collections, createdBy, description } = args;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshotData: Record<string, any[]> = {};

    // Collect data from each collection
    for (const collectionName of collections) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await ctx.db.query(collectionName as any).collect();
        snapshotData[collectionName] = data;
      } catch (error) {
        console.error(`Error backing up ${collectionName}:`, error);
      }
    }

    // Save snapshot metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshotId = await ctx.db.insert("backup_snapshots" as any, {
      collections,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      description: description || `Backup created on ${new Date().toISOString()}`,
      record_count: Object.values(snapshotData).reduce((sum, arr) => sum + arr.length, 0),
      size_bytes: JSON.stringify(snapshotData).length,
    });

    return {
      snapshotId,
      collections: collections.length,
      totalRecords: Object.values(snapshotData).reduce((sum, arr) => sum + arr.length, 0),
    };
  },
});

// List backup snapshots
export const listBackupSnapshots = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await ctx.db
      .query("backup_snapshots" as any)
      .order("desc")
      .take(limit);
  },
});
