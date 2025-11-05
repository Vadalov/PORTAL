// Unified API resolver - Now using Convex only
// Import concrete implementations
import * as mock from './mock-api';
import { convexApiClient } from './convex-api-client';
import type {
  QueryParams,
  CreateDocumentData,
  UpdateDocumentData,
  AppwriteResponse,
} from '@/types/database';
import type {
  BeneficiaryDocument,
  UserDocument,
  DonationDocument,
  TaskDocument,
  MeetingDocument,
  MessageDocument,
} from '@/types/database';

// Infer provider from environment (client-safe first)
const clientProvider =
  typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BACKEND_PROVIDER : undefined;
const serverProvider = process.env.BACKEND_PROVIDER;

// Decide provider with sensible defaults
// IMPORTANT: Set BACKEND_PROVIDER=convex|mock or NEXT_PUBLIC_BACKEND_PROVIDER=convex|mock
// Default is 'convex' - Appwrite has been completely removed
const provider = (clientProvider || serverProvider || 'convex').toLowerCase();

// Build a light wrapper to align mock functions to api shape
const mockApi = {
  // Auth (limited in mock for now)
  auth: {
    // no-op placeholders to keep call sites stable if used
    async login(
      email: string,
      _password: string
    ): Promise<{ session: null; user: { email: string } }> {
      return { session: null, user: { email } };
    },
    async getCurrentUser(): Promise<{ email: string }> {
      return { email: 'mock@test.com' } ;
    },
    async logout(): Promise<boolean> {
      return true;
    },
    async createAccount(
      email: string,
      password: string,
      name: string
    ): Promise<{ email: string; name: string }> {
      return { email, name };
    },
    async updateProfile(
      _userId: string,
      _updates: Record<string, unknown>
    ): Promise<{ ok: boolean }> {
      return { ok: true };
    },
  },

  // Users API
  users: {
    getUsers: async (_params?: QueryParams): Promise<AppwriteResponse<UserDocument[]>> => ({
      data: [],
      error: null,
      total: 0,
    }),
    getUser: async (_id: string): Promise<AppwriteResponse<UserDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    createUser: async (
      _data: CreateDocumentData<UserDocument>
    ): Promise<AppwriteResponse<UserDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    updateUser: async (
      _id: string,
      _data: UpdateDocumentData<UserDocument>
    ): Promise<AppwriteResponse<UserDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    deleteUser: async (_id: string): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: null,
    }),
  },

  // Beneficiaries (Convex-aligned mock surface)
  beneficiaries: {
    getBeneficiaries: (params?: QueryParams) => mock.getBeneficiaryDocs(params),
    getBeneficiary: (id: string) => mock.getBeneficiaryDoc(id),
    createBeneficiary: (data: CreateDocumentData<BeneficiaryDocument>) =>
      mock.createBeneficiaryDoc(data),
    updateBeneficiary: (id: string, data: UpdateDocumentData<BeneficiaryDocument>) =>
      mock.updateBeneficiaryDoc(id, data),
    deleteBeneficiary: (id: string) => mock.deleteBeneficiaryDoc(id),
  },

  donations: {
    getDonations: async (_params?: QueryParams): Promise<AppwriteResponse<DonationDocument[]>> => ({
      data: [],
      error: null,
      total: 0,
    }),
    getDonation: async (_id: string): Promise<AppwriteResponse<DonationDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    createDonation: async (
      _data: CreateDocumentData<DonationDocument>
    ): Promise<AppwriteResponse<DonationDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    updateDonation: async (
      _id: string,
      _data: UpdateDocumentData<DonationDocument>
    ): Promise<AppwriteResponse<DonationDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    deleteDonation: async (_id: string): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: null,
    }),
  },

  tasks: {
    getTasks: async (_params?: QueryParams): Promise<AppwriteResponse<TaskDocument[]>> => ({
      data: [],
      error: null,
      total: 0,
    }),
    getTask: async (_id: string): Promise<AppwriteResponse<TaskDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    createTask: async (
      _data: CreateDocumentData<TaskDocument>
    ): Promise<AppwriteResponse<TaskDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    updateTask: async (
      _id: string,
      _data: UpdateDocumentData<TaskDocument>
    ): Promise<AppwriteResponse<TaskDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    updateTaskStatus: async (
      _id: string,
      _status: TaskDocument['status']
    ): Promise<AppwriteResponse<TaskDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    deleteTask: async (_id: string): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: null,
    }),
  },

  meetings: {
    getMeetings: async (_params?: QueryParams): Promise<AppwriteResponse<MeetingDocument[]>> => ({
      data: [],
      error: null,
      total: 0,
    }),
    getMeeting: async (_id: string): Promise<AppwriteResponse<MeetingDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    createMeeting: async (
      _data: CreateDocumentData<MeetingDocument>
    ): Promise<AppwriteResponse<MeetingDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    updateMeeting: async (
      _id: string,
      _data: UpdateDocumentData<MeetingDocument>
    ): Promise<AppwriteResponse<MeetingDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    updateMeetingStatus: async (
      _id: string,
      _status: string
    ): Promise<AppwriteResponse<MeetingDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    deleteMeeting: async (_id: string): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: null,
    }),
  },

  messages: {
    getMessages: async (_params?: QueryParams): Promise<AppwriteResponse<MessageDocument[]>> => ({
      data: [],
      error: null,
      total: 0,
    }),
    getMessage: async (_id: string): Promise<AppwriteResponse<MessageDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    createMessage: async (
      _data: CreateDocumentData<MessageDocument>
    ): Promise<AppwriteResponse<MessageDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    updateMessage: async (
      _id: string,
      _data: UpdateDocumentData<MessageDocument>
    ): Promise<AppwriteResponse<MessageDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    sendMessage: async (_id: string): Promise<AppwriteResponse<MessageDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    deleteMessage: async (_id: string): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: null,
    }),
    markAsRead: async (
      _id: string,
      _userId: string
    ): Promise<AppwriteResponse<MessageDocument>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
  },

  storage: {
    uploadFile: async (_args: Record<string, unknown>): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    getFile: async (_bucketId: string, _fileId: string): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: 'Not implemented in mock',
    }),
    deleteFile: async (_bucketId: string, _fileId: string): Promise<AppwriteResponse<null>> => ({
      data: null,
      error: null,
    }),
    getFileDownload: async (_bucketId: string, _fileId: string): Promise<string> => '',
    getFilePreview: async (_bucketId: string, _fileId: string): Promise<string> => '',
  },

  dashboard: {
    getMetrics: async () => ({
      data: { totalBeneficiaries: 0, totalDonations: 0, totalDonationAmount: 0, activeUsers: 0 },
      error: null,
    }),
  },
} as const;

// Selected API surface
const selectedApi = (() => {
  if (provider === 'convex') {
    // Use Convex API client (calls Next.js API routes which use Convex)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Using Convex API (via Next.js API routes)');
    }
    return convexApiClient;
  }
  
  // Fallback to mock (only for testing)
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️ Using MOCK API (provider: ${provider}). Set BACKEND_PROVIDER=convex to use Convex backend.`
    );
  }
  return mockApi;
})();

export const selectedApiInstance = selectedApi;

// Expose parameters and aid applications APIs
export const parametersApi =
  provider === 'convex'
    ? {
        // Convex API routes for parameters (if implemented)
        getParametersByCategory: async (_category: string) => ({ data: [], error: null, total: 0 }),
        getAllParameters: async (_params?: QueryParams) => ({ data: [], error: null, total: 0 }),
        getParameter: async (_id: string) => ({ data: null, error: 'Not implemented' }),
        createParameter: async (_data: Record<string, unknown>) => ({
          data: null,
          error: 'Not implemented',
        }),
        updateParameter: async (_id: string, _data: Record<string, unknown>) => ({
          data: null,
          error: 'Not implemented',
        }),
        deleteParameter: async (_id: string) => ({ data: null, error: null }),
      }
    : {
        getParametersByCategory: async (_category: string) => ({ data: [], error: null, total: 0 }),
        getAllParameters: async (_params?: QueryParams) => ({ data: [], error: null, total: 0 }),
        getParameter: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
        createParameter: async (_data: Record<string, unknown>) => ({
          data: null,
          error: 'Not implemented in mock',
        }),
        updateParameter: async (_id: string, _data: Record<string, unknown>) => ({
          data: null,
          error: 'Not implemented in mock',
        }),
        deleteParameter: async (_id: string) => ({ data: null, error: null }),
      };

export const aidApplicationsApi =
  provider === 'convex'
      ? {
          getAidApplications: async (params?: QueryParams) => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.set('page', params.page.toString());
            if (params?.limit) searchParams.set('limit', params.limit.toString());
            if (params?.search) searchParams.set('search', params.search);
            if (params?.filters?.stage) searchParams.set('stage', String(params.filters.stage));
            if (params?.filters?.status) searchParams.set('status', String(params.filters.status));

            const response = await fetch(`/api/aid-applications?${searchParams.toString()}`);
            const result = await response.json();
            return {
              data: result.data || [],
              error: result.success ? null : result.error,
              total: result.total || 0,
            };
          },
          getAidApplication: async (id: string) => {
            const response = await fetch(`/api/aid-applications/${id}`);
            const result = await response.json();
            return {
              data: result.data || null,
              error: result.success ? null : result.error,
            };
          },
          createAidApplication: async (data: Record<string, unknown>) => {
            const response = await fetch('/api/aid-applications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            const result = await response.json();
            return {
              data: result.data || null,
              error: result.success ? null : result.error,
            };
          },
          updateAidApplication: async (id: string, data: Record<string, unknown>) => {
            const response = await fetch(`/api/aid-applications/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            const result = await response.json();
            return {
              data: result.data || null,
              error: result.success ? null : result.error,
            };
          },
          deleteAidApplication: async (id: string) => {
            const response = await fetch(`/api/aid-applications/${id}`, {
              method: 'DELETE',
            });
            const result = await response.json();
            return {
              data: null,
              error: result.success ? null : result.error,
            };
          },
          updateStage: async (id: string, stage: string) => {
            const response = await fetch(`/api/aid-applications/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stage }),
            });
            const result = await response.json();
            return {
              data: result.data || null,
              error: result.success ? null : result.error,
            };
          },
        }
      : {
          getAidApplications: async (_params?: QueryParams) => ({ data: [], error: null, total: 0 }),
          getAidApplication: async (_id: string) => ({
            data: null,
            error: 'Not implemented in mock',
          }),
          createAidApplication: async (_data: Record<string, unknown>) => ({
            data: null,
            error: 'Not implemented in mock',
          }),
          updateAidApplication: async (_id: string, _data: Record<string, unknown>) => ({
            data: null,
            error: 'Not implemented in mock',
          }),
          deleteAidApplication: async (_id: string) => ({ data: null, error: null }),
          updateStage: async (_id: string, _stage: string) => ({
            data: null,
            error: 'Not implemented in mock',
          }),
        };

// Also export named for compatibility if needed
export type SelectedApi = typeof selectedApiInstance;

// Re-export api as alias to selectedApi for backward compatibility
// Components importing api from '@/lib/api' will get the selected provider (Convex by default)
export const api = selectedApiInstance;

// Default export for convenience
export default selectedApiInstance;
