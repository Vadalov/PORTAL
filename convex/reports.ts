import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate comprehensive report data
export const generateReport = query({
  args: {
    reportType: v.union(
      v.literal("financial"),
      v.literal("beneficiaries"),
      v.literal("donations"),
      v.literal("operations")
    ),
    startDate: v.string(),
    endDate: v.string(),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { reportType, startDate, endDate } = args;

    switch (reportType) {
      case "financial":
        return await generateFinancialReport(ctx, startDate, endDate);
      case "beneficiaries":
        return await generateBeneficiariesReport(ctx, startDate, endDate);
      case "donations":
        return await generateDonationsReport(ctx, startDate, endDate);
      case "operations":
        return await generateOperationsReport(ctx, startDate, endDate);
      default:
        throw new Error("Invalid report type");
    }
  },
});

// Financial Report
async function generateFinancialReport(ctx: any, startDate: string, endDate: string) {
  const financeRecords = await ctx.db.query("finance_records").collect();
  const donations = await ctx.db.query("donations").collect();

  // Filter by date range
  const filteredRecords = financeRecords.filter((record: any) => {
    const date = new Date(record.transaction_date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const filteredDonations = donations.filter((donation: any) => {
    const date = new Date(donation.created_at || donation.donation_date || startDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  // Calculate totals
  const totalIncome = filteredRecords
    .filter((r: any) => r.record_type === "income" && r.status === "approved")
    .reduce((sum: number, r: any) => sum + r.amount, 0);

  const totalExpenses = filteredRecords
    .filter((r: any) => r.record_type === "expense" && r.status === "approved")
    .reduce((sum: number, r: any) => sum + r.amount, 0);

  const totalDonations = filteredDonations
    .filter((d: any) => d.status === "completed")
    .reduce((sum: number, d: any) => sum + d.amount, 0);

  // Category breakdown
  const incomeByCategory: Record<string, number> = {};
  const expensesByCategory: Record<string, number> = {};

  filteredRecords.forEach((record: any) => {
    const category = record.category || "Other";
    if (record.record_type === "income" && record.status === "approved") {
      incomeByCategory[category] = (incomeByCategory[category] || 0) + record.amount;
    } else if (record.record_type === "expense" && record.status === "approved") {
      expensesByCategory[category] = (expensesByCategory[category] || 0) + record.amount;
    }
  });

  return {
    period: { startDate, endDate },
    summary: {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalDonations,
      transactionCount: filteredRecords.length,
    },
    breakdown: {
      incomeByCategory,
      expensesByCategory,
    },
    transactions: filteredRecords,
  };
}

// Beneficiaries Report
async function generateBeneficiariesReport(ctx: any, startDate: string, endDate: string) {
  const beneficiaries = await ctx.db.query("beneficiaries").collect();

  const filteredBeneficiaries = beneficiaries.filter((b: any) => {
    const date = new Date(b.registration_date || b.created_at || startDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  // Demographics
  const byStatus: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  const byAidType: Record<string, number> = {};

  filteredBeneficiaries.forEach((b: any) => {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    if (b.city) byCity[b.city] = (byCity[b.city] || 0) + 1;
  });

  return {
    period: { startDate, endDate },
    summary: {
      totalBeneficiaries: filteredBeneficiaries.length,
      activeBeneficiaries: filteredBeneficiaries.filter((b: any) => b.status === "active").length,
      newRegistrations: filteredBeneficiaries.length,
    },
    demographics: {
      byStatus,
      byCity,
    },
    beneficiaries: filteredBeneficiaries,
  };
}

// Donations Report
async function generateDonationsReport(ctx: any, startDate: string, endDate: string) {
  const donations = await ctx.db.query("donations").collect();

  const filteredDonations = donations.filter((d: any) => {
    const date = new Date(d.created_at || d.donation_date || startDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const totalAmount = filteredDonations
    .filter((d: any) => d.status === "completed")
    .reduce((sum: number, d: any) => sum + d.amount, 0);

  const byType: Record<string, number> = {};
  const byMethod: Record<string, number> = {};

  filteredDonations.forEach((d: any) => {
    byType[d.donation_type] = (byType[d.donation_type] || 0) + d.amount;
    byMethod[d.payment_method] = (byMethod[d.payment_method] || 0) + d.amount;
  });

  return {
    period: { startDate, endDate },
    summary: {
      totalDonations: filteredDonations.length,
      totalAmount,
      averageDonation: totalAmount / (filteredDonations.length || 1),
      completedDonations: filteredDonations.filter((d: any) => d.status === "completed").length,
    },
    breakdown: {
      byType,
      byMethod,
    },
    donations: filteredDonations,
  };
}

// Operations Report
async function generateOperationsReport(ctx: any, startDate: string, endDate: string) {
  const tasks = await ctx.db.query("tasks").collect();
  const meetings = await ctx.db.query("meetings").collect();
  const aidApplications = await ctx.db.query("aid_applications").collect();

  const filteredTasks = tasks.filter((t: any) => {
    const date = new Date(t.created_at || startDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const filteredMeetings = meetings.filter((m: any) => {
    const date = new Date(m.meeting_date || startDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const filteredApplications = aidApplications.filter((a: any) => {
    const date = new Date(a.application_date || startDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const tasksByStatus: Record<string, number> = {};
  filteredTasks.forEach((t: any) => {
    tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
  });

  return {
    period: { startDate, endDate },
    summary: {
      totalTasks: filteredTasks.length,
      completedTasks: filteredTasks.filter((t: any) => t.status === "completed").length,
      totalMeetings: filteredMeetings.length,
      totalApplications: filteredApplications.length,
      processedApplications: filteredApplications.filter((a: any) => a.status !== "pending").length,
    },
    breakdown: {
      tasksByStatus,
    },
  };
}

// Export data to CSV format
export const exportToCSV = query({
  args: {
    collection: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { collection, startDate, endDate } = args;

    let data: any[] = [];

    switch (collection) {
      case "finance_records":
        data = await ctx.db.query("finance_records").collect();
        break;
      case "beneficiaries":
        data = await ctx.db.query("beneficiaries").collect();
        break;
      case "donations":
        data = await ctx.db.query("donations").collect();
        break;
      default:
        throw new Error("Invalid collection");
    }

    // Filter by date if provided
    if (startDate && endDate) {
      data = data.filter((item: any) => {
        const itemDate = new Date(item.created_at || item.transaction_date || item.donation_date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }

    return data;
  },
});

// Save report configuration
export const saveReportConfig = mutation({
  args: {
    name: v.string(),
    reportType: v.string(),
    filters: v.any(),
    schedule: v.optional(v.object({
      frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      recipients: v.array(v.id("users")),
    })),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("report_configs", {
      name: args.name,
      report_type: args.reportType,
      filters: args.filters,
      schedule: args.schedule,
      created_by: args.createdBy,
      created_at: new Date().toISOString(),
      is_active: true,
    });
  },
});

// Get saved report configurations
export const getReportConfigs = query({
  args: {
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.createdBy) {
      return await ctx.db
        .query("report_configs")
        .filter((q) => q.eq(q.field("created_by"), args.createdBy))
        .collect();
    }
    return await ctx.db.query("report_configs").collect();
  },
});
