/**
 * Appwrite Server API Service
 * Server-side Appwrite SDK (node-appwrite) wrappers for API routes
 * Mirrors the shape of appwrite-api.ts but uses server clients.
 *
 * IMPORTANT: Use this only on the server (API routes, server actions).
 */

import { ID } from 'node-appwrite';
import {
  serverDatabases as databases,
  serverStorage as storage,
  Query,
} from '@/lib/appwrite/server';
import { DATABASE_ID } from '@/lib/appwrite/config';
import { COLLECTIONS } from '@/lib/appwrite/config';
import type {
  AppwriteResponse,
  QueryParams,
  UserDocument,
  BeneficiaryDocument,
  DonationDocument,
  TaskDocument,
  MeetingDocument,
  MessageDocument,
  CreateDocumentData,
  UpdateDocumentData,
  UploadedFile,
} from '@/types/collections';

/**
 * Shared helpers
 */
function buildQueries(
  params?: QueryParams,
  defaults?: { limit?: number; orderDescField?: string }
) {
  const queries: string[] = [];
  const limit = params?.limit ?? defaults?.limit ?? 20;
  const page = params?.page ?? 1;

  queries.push(Query.limit(limit));
  queries.push(Query.offset((page - 1) * limit));

  if (defaults?.orderDescField) {
    queries.push(Query.orderDesc(defaults.orderDescField));
  }

  if (params?.search) {
    // Generic search field name must be specified at call site if needed
    // This helper does not add Query.search by itself
  }

  return queries;
}

/**
 * Users API
 */
export const usersApi = {
  async getUsers(params?: QueryParams): Promise<AppwriteResponse<UserDocument[]>> {
    const queries = buildQueries(params, { limit: 10, orderDescField: '$createdAt' });
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, queries);
    return {
      data: response.documents as unknown as UserDocument[],
      error: null,
      total: response.total,
    };
  },

  async getUser(id: string): Promise<AppwriteResponse<UserDocument>> {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, id);
    return { data: doc as unknown as UserDocument, error: null };
  },

  async createUser(
    data: CreateDocumentData<UserDocument>
  ): Promise<AppwriteResponse<UserDocument>> {
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.USERS, ID.unique(), data);
    return { data: doc as unknown as UserDocument, error: null };
  },

  async updateUser(
    id: string,
    data: UpdateDocumentData<UserDocument>
  ): Promise<AppwriteResponse<UserDocument>> {
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, id, data);
    return { data: doc as unknown as UserDocument, error: null };
  },

  async deleteUser(id: string): Promise<AppwriteResponse<null>> {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USERS, id);
    return { data: null, error: null };
  },
};

/**
 * Beneficiaries API
 */
export const beneficiariesApi = {
  async getBeneficiaries(params?: QueryParams): Promise<AppwriteResponse<BeneficiaryDocument[]>> {
    const queries = buildQueries(params, { limit: 10, orderDescField: '$createdAt' });
    if (params?.search) queries.push(Query.search('name', params.search));
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BENEFICIARIES, queries);
    return {
      data: response.documents as unknown as BeneficiaryDocument[],
      error: null,
      total: response.total,
    };
  },

  async getBeneficiary(id: string): Promise<AppwriteResponse<BeneficiaryDocument>> {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.BENEFICIARIES, id);
    return { data: doc as unknown as BeneficiaryDocument, error: null };
  },

  async createBeneficiary(
    data: CreateDocumentData<BeneficiaryDocument>
  ): Promise<AppwriteResponse<BeneficiaryDocument>> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.BENEFICIARIES,
      ID.unique(),
      data
    );
    return { data: doc as unknown as BeneficiaryDocument, error: null };
  },

  async updateBeneficiary(
    id: string,
    data: UpdateDocumentData<BeneficiaryDocument>
  ): Promise<AppwriteResponse<BeneficiaryDocument>> {
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.BENEFICIARIES, id, data);
    return { data: doc as unknown as BeneficiaryDocument, error: null };
  },

  async deleteBeneficiary(id: string): Promise<AppwriteResponse<null>> {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.BENEFICIARIES, id);
    return { data: null, error: null };
  },
};

/**
 * Donations API
 */
export const donationsApi = {
  async getDonations(params?: QueryParams): Promise<AppwriteResponse<DonationDocument[]>> {
    const queries = buildQueries(params, { limit: 10, orderDescField: '$createdAt' });
    if (params?.search) queries.push(Query.search('donor_name', params.search));
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DONATIONS, queries);
    return {
      data: response.documents as unknown as DonationDocument[],
      error: null,
      total: response.total,
    };
  },

  async getDonation(id: string): Promise<AppwriteResponse<DonationDocument>> {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.DONATIONS, id);
    return { data: doc as unknown as DonationDocument, error: null };
  },

  async createDonation(
    data: CreateDocumentData<DonationDocument>
  ): Promise<AppwriteResponse<DonationDocument>> {
    if (data.amount <= 0) {
      return { data: null, error: 'Amount must be positive' };
    }
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DONATIONS,
      ID.unique(),
      data
    );
    return { data: doc as unknown as DonationDocument, error: null };
  },

  async updateDonation(
    id: string,
    data: UpdateDocumentData<DonationDocument>
  ): Promise<AppwriteResponse<DonationDocument>> {
    if (data.amount !== undefined && data.amount <= 0) {
      return { data: null, error: 'Amount must be positive' };
    }
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.DONATIONS, id, data);
    return { data: doc as unknown as DonationDocument, error: null };
  },

  async deleteDonation(id: string): Promise<AppwriteResponse<null>> {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.DONATIONS, id);
    return { data: null, error: null };
  },
};

/**
 * Tasks API
 */
export const tasksApi = {
  async getTasks(params?: QueryParams): Promise<AppwriteResponse<TaskDocument[]>> {
    const queries = buildQueries(params, { limit: 20, orderDescField: '$createdAt' });
    if (params?.search) queries.push(Query.search('title', params.search));
    if (params?.filters?.status) queries.push(Query.equal('status', params.filters.status));
    if (params?.filters?.priority) queries.push(Query.equal('priority', params.filters.priority));
    if (params?.filters?.assigned_to)
      queries.push(Query.equal('assigned_to', params.filters.assigned_to));
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
    return {
      data: response.documents as unknown as TaskDocument[],
      error: null,
      total: response.total,
    };
  },

  async getTask(id: string): Promise<AppwriteResponse<TaskDocument>> {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.TASKS, id);
    return { data: doc as unknown as TaskDocument, error: null };
  },

  async createTask(
    data: CreateDocumentData<TaskDocument>
  ): Promise<AppwriteResponse<TaskDocument>> {
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.TASKS, ID.unique(), {
      ...data,
      is_read: false,
      status: data.status || 'pending',
    });
    return { data: doc as unknown as TaskDocument, error: null };
  },

  async updateTask(
    id: string,
    data: UpdateDocumentData<TaskDocument>
  ): Promise<AppwriteResponse<TaskDocument>> {
    const updateData = { ...data };
    if (data.status === 'completed' && !data.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, id, updateData);
    return { data: doc as unknown as TaskDocument, error: null };
  },

  async deleteTask(id: string): Promise<AppwriteResponse<null>> {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, id);
    return { data: null, error: null };
  },
};

/**
 * Meetings API
 */
export const meetingsApi = {
  async getMeetings(params?: QueryParams): Promise<AppwriteResponse<MeetingDocument[]>> {
    const queries = buildQueries(params, { limit: 20, orderDescField: 'meeting_date' });
    if (params?.search) queries.push(Query.search('title', params.search));
    if (params?.filters?.status) queries.push(Query.equal('status', params.filters.status));
    if (params?.filters?.meeting_type)
      queries.push(Query.equal('meeting_type', params.filters.meeting_type));
    if (params?.filters?.organizer)
      queries.push(Query.equal('organizer', params.filters.organizer));
    if (params?.filters?.date_from)
      queries.push(Query.greaterThanEqual('meeting_date', params.filters.date_from));
    if (params?.filters?.date_to)
      queries.push(Query.lessThanEqual('meeting_date', params.filters.date_to));
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MEETINGS, queries);
    return {
      data: response.documents as unknown as MeetingDocument[],
      error: null,
      total: response.total,
    };
  },

  async getMeeting(id: string): Promise<AppwriteResponse<MeetingDocument>> {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEETINGS, id);
    return { data: doc as unknown as MeetingDocument, error: null };
  },

  async createMeeting(
    data: CreateDocumentData<MeetingDocument>
  ): Promise<AppwriteResponse<MeetingDocument>> {
    const participants = data.participants || [];
    if (data.organizer && !participants.includes(data.organizer)) {
      participants.push(data.organizer);
    }
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.MEETINGS, ID.unique(), {
      ...data,
      participants,
    });
    return { data: doc as unknown as MeetingDocument, error: null };
  },

  async updateMeeting(
    id: string,
    data: UpdateDocumentData<MeetingDocument>
  ): Promise<AppwriteResponse<MeetingDocument>> {
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.MEETINGS, id, data);
    return { data: doc as unknown as MeetingDocument, error: null };
  },

  async deleteMeeting(id: string): Promise<AppwriteResponse<null>> {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MEETINGS, id);
    return { data: null, error: null };
  },

  async updateMeetingStatus(
    id: string,
    status: MeetingDocument['status']
  ): Promise<AppwriteResponse<MeetingDocument>> {
    return this.updateMeeting(id, { status });
  },
};

/**
 * Messages API
 */
export const messagesApi = {
  async getMessages(params?: QueryParams): Promise<AppwriteResponse<MessageDocument[]>> {
    const queries = buildQueries(params, { limit: 20, orderDescField: '$createdAt' });
    if (params?.search) queries.push(Query.search('subject', params.search));
    if (params?.filters?.message_type)
      queries.push(Query.equal('message_type', params.filters.message_type));
    if (params?.filters?.status) queries.push(Query.equal('status', params.filters.status));
    if (params?.filters?.sender) queries.push(Query.equal('sender', params.filters.sender));
    if (params?.filters?.is_bulk !== undefined)
      queries.push(Query.equal('is_bulk', params.filters.is_bulk));
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, queries);
    return {
      data: response.documents as unknown as MessageDocument[],
      error: null,
      total: response.total,
    };
  },

  async getMessage(id: string): Promise<AppwriteResponse<MessageDocument>> {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id);
    return { data: doc as unknown as MessageDocument, error: null };
  },

  async createMessage(
    data: CreateDocumentData<MessageDocument>
  ): Promise<AppwriteResponse<MessageDocument>> {
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), {
      ...data,
      status: data.status || 'draft',
    });
    return { data: doc as unknown as MessageDocument, error: null };
  },

  async updateMessage(
    id: string,
    data: UpdateDocumentData<MessageDocument>
  ): Promise<AppwriteResponse<MessageDocument>> {
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id, data);
    return { data: doc as unknown as MessageDocument, error: null };
  },

  async deleteMessage(id: string): Promise<AppwriteResponse<null>> {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id);
    return { data: null, error: null };
  },

  async sendMessage(id: string): Promise<AppwriteResponse<MessageDocument>> {
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
    return { data: doc as unknown as MessageDocument, error: null };
  },
};

/**
 * Storage API
 */
export const storageApi = {
  async uploadFile(args: {
    bucketId: string;
    file: Blob;
    permissions?: string[];
  }): Promise<AppwriteResponse<UploadedFile>> {
    const { bucketId, file, permissions } = args;
    const uploaded = await storage.createFile(
      bucketId,
      ID.unique(),
      file as unknown as File,
      permissions
    );
    return { data: uploaded as unknown as UploadedFile, error: null };
  },

  async deleteFile(bucketId: string, fileId: string): Promise<AppwriteResponse<null>> {
    await storage.deleteFile(bucketId, fileId);
    return { data: null, error: null };
  },

  async getFile(bucketId: string, fileId: string): Promise<AppwriteResponse<UploadedFile>> {
    const file = await storage.getFile(bucketId, fileId);
    return { data: file as unknown as UploadedFile, error: null };
  },
};

/**
 * Dashboard API
 */

interface DashboardMetrics {
  totalBeneficiaries: number;
  totalDonations: number;
  totalDonationAmount: number;
  activeUsers: number;
}

export const dashboardApi = {
  async getMetrics(): Promise<AppwriteResponse<DashboardMetrics>> {
    const beneficiariesResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BENEFICIARIES,
      [Query.limit(1)]
    );
    const donationsResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DONATIONS, [
      Query.limit(1000),
    ]);
    const usersResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
      Query.equal('isActive', true),
      Query.limit(1),
    ]);

    const totalDonationAmount = (donationsResponse.documents as unknown as DonationDocument[])
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      data: {
        totalBeneficiaries: beneficiariesResponse.total,
        totalDonations: donationsResponse.total,
        totalDonationAmount,
        activeUsers: usersResponse.total,
      },
      error: null,
    };
  },
};

/**
 * Auth (server-side placeholder)
 * Server SDK does not manage per-user sessions; we clear our HttpOnly cookie in API route.
 */
export const auth = {
  async logout(): Promise<boolean> {
    return true;
  },
};

/**
 * Main export matching api surface
 */
export const appwriteServerApi = {
  auth,
  users: usersApi,
  beneficiaries: beneficiariesApi,
  donations: donationsApi,
  tasks: tasksApi,
  meetings: meetingsApi,
  messages: messagesApi,
  storage: storageApi,
  dashboard: dashboardApi,
};

export default appwriteServerApi;
