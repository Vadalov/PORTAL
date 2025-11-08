/**
 * Convex API Helper
 * Provides a unified interface for calling Convex functions from API routes
 */

import { convexHttp, api } from './server';
import { Id } from '@/convex/_generated/dataModel';

export interface ConvexQueryParams {
  limit?: number;
  skip?: number;
  search?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Convert Next.js query params to Convex query params
 */
export function normalizeQueryParams(searchParams: URLSearchParams): ConvexQueryParams {
  const params: ConvexQueryParams = {};

  const limit = searchParams.get('limit');
  const skip = searchParams.get('skip') || searchParams.get('page');
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  if (limit) params.limit = Math.min(parseInt(limit, 10), 100);
  if (skip) {
    const page = parseInt(skip, 10);
    const limitNum = params.limit || 20;
    params.skip = (page - 1) * limitNum;
  }
  if (search) params.search = search;
  if (status) params.status = status;

  return params;
}

/**
 * Beneficiaries API
 */
export const convexBeneficiaries = {
  list: async (params?: ConvexQueryParams) => {
    return await convexHttp.query(api.beneficiaries.list, params || {});
  },
  get: async (id: Id<'beneficiaries'>) => {
    return await convexHttp.query(api.beneficiaries.get, { id });
  },
  getByTcNo: async (tc_no: string) => {
    return await convexHttp.query(api.beneficiaries.getByTcNo, { tc_no });
  },
  create: async (data: unknown) => {
    return await convexHttp.mutation(api.beneficiaries.create, data as any);
  },
  update: async (id: Id<'beneficiaries'>, data: unknown) => {
    return await convexHttp.mutation(api.beneficiaries.update, { id, data } as any);
  },
  remove: async (id: Id<'beneficiaries'>) => {
    return await convexHttp.mutation(api.beneficiaries.remove, { id });
  },
};

/**
 * Donations API
 */
export const convexDonations = {
  list: async (params?: ConvexQueryParams) => {
    return await convexHttp.query(api.donations.list, params || {});
  },
  get: async (id: Id<'donations'>) => {
    return await convexHttp.query(api.donations.get, { id });
  },
  getByReceiptNumber: async (receipt_number: string) => {
    return await convexHttp.query(api.donations.getByReceiptNumber, { receipt_number });
  },
  create: async (data: unknown) => {
    return await convexHttp.mutation(api.donations.create, data as any);
  },
  update: async (id: Id<'donations'>, data: unknown) => {
    return await convexHttp.mutation(api.donations.update, { id, data } as any);
  },
  remove: async (id: Id<'donations'>) => {
    return await convexHttp.mutation(api.donations.remove, { id });
  },
};

/**
 * Tasks API
 */
export const convexTasks = {
  list: async (
    params?: ConvexQueryParams & { assigned_to?: Id<'users'>; created_by?: Id<'users'> }
  ) => {
    return await convexHttp.query(api.tasks.list, params || {});
  },
  get: async (id: Id<'tasks'>) => {
    return await convexHttp.query(api.tasks.get, { id });
  },
  create: async (data: unknown) => {
    return await convexHttp.mutation(api.tasks.create, data as any);
  },
  update: async (id: Id<'tasks'>, data: unknown) => {
    return await convexHttp.mutation(api.tasks.update, { id, data } as any);
  },
  remove: async (id: Id<'tasks'>) => {
    return await convexHttp.mutation(api.tasks.remove, { id });
  },
};

/**
 * Meetings API
 */
export const convexMeetings = {
  list: async (params?: ConvexQueryParams & { organizer?: Id<'users'> }) => {
    return await convexHttp.query(api.meetings.list, params || {});
  },
  get: async (id: Id<'meetings'>) => {
    return await convexHttp.query(api.meetings.get, { id });
  },
  create: async (data: unknown) => {
    return await convexHttp.mutation(api.meetings.create, data as any);
  },
  update: async (id: Id<'meetings'>, data: unknown) => {
    return await convexHttp.mutation(api.meetings.update, { id, data } as any);
  },
  remove: async (id: Id<'meetings'>) => {
    return await convexHttp.mutation(api.meetings.remove, { id });
  },
};

/**
 * Messages API
 */
export const convexMessages = {
  list: async (params?: ConvexQueryParams & { sender?: Id<'users'> }) => {
    return await convexHttp.query(api.messages.list, params || {});
  },
  get: async (id: Id<'messages'>) => {
    return await convexHttp.query(api.messages.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.messages.create, data);
  },
  update: async (id: Id<'messages'>, data: any) => {
    return await convexHttp.mutation(api.messages.update, { id, ...data });
  },
  remove: async (id: Id<'messages'>) => {
    return await convexHttp.mutation(api.messages.remove, { id });
  },
};

/**
 * Users API
 */
export const convexUsers = {
  list: async () => {
    return await convexHttp.query(api.users.list, {});
  },
  get: async (id: Id<'users'>) => {
    return await convexHttp.query(api.users.get, { id });
  },
  getByEmail: async (email: string) => {
    return await convexHttp.query(api.users.getByEmail, { email });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.users.create, data);
  },
  update: async (id: Id<'users'>, data: any) => {
    return await convexHttp.mutation(api.users.update, { id, ...data });
  },
  remove: async (id: Id<'users'>) => {
    return await convexHttp.mutation(api.users.remove, { id });
  },
};

/**
 * Aid Applications API
 */
export const convexAidApplications = {
  list: async (
    params?: ConvexQueryParams & {
      stage?: string;
      beneficiary_id?: Id<'beneficiaries'>;
    }
  ) => {
    return await convexHttp.query(api.aid_applications.list, params || {});
  },
  get: async (id: Id<'aid_applications'>) => {
    return await convexHttp.query(api.aid_applications.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.aid_applications.create, data);
  },
  update: async (id: Id<'aid_applications'>, data: any) => {
    return await convexHttp.mutation(api.aid_applications.update, { id, ...data });
  },
  remove: async (id: Id<'aid_applications'>) => {
    return await convexHttp.mutation(api.aid_applications.remove, { id });
  },
};

/**
 * Finance Records API
 */
export const convexFinanceRecords = {
  list: async (
    params?: ConvexQueryParams & {
      record_type?: 'income' | 'expense';
      created_by?: Id<'users'>;
    }
  ) => {
    return await convexHttp.query(api.finance_records.list, params || {});
  },
  get: async (id: Id<'finance_records'>) => {
    return await convexHttp.query(api.finance_records.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.finance_records.create, data);
  },
  update: async (id: Id<'finance_records'>, data: any) => {
    return await convexHttp.mutation(api.finance_records.update, { id, ...data });
  },
  remove: async (id: Id<'finance_records'>) => {
    return await convexHttp.mutation(api.finance_records.remove, { id });
  },
};

/**
 * Partners API
 */
export const convexPartners = {
  list: async (
    params?: ConvexQueryParams & {
      type?: 'organization' | 'individual' | 'sponsor';
      status?: 'active' | 'inactive' | 'pending';
      partnership_type?: 'donor' | 'supplier' | 'volunteer' | 'sponsor' | 'service_provider';
    }
  ) => {
    // @ts-expect-error - partners types
    return await convexHttp.query(api.partners.list, params || {});
  },
  get: async (id: Id<'partners'>) => {
    // @ts-expect-error - partners types
    return await convexHttp.query(api.partners.get, { id });
  },
  create: async (data: any) => {
    // @ts-expect-error - partners types
    return await convexHttp.mutation(api.partners.create, data);
  },
  update: async (id: Id<'partners'>, data: any) => {
    // @ts-expect-error - partners types
    return await convexHttp.mutation(api.partners.update, { id, ...data });
  },
  remove: async (id: Id<'partners'>) => {
    // @ts-expect-error - partners types
    return await convexHttp.mutation(api.partners.remove, { id });
  },
};
