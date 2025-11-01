// Unified API resolver (mock | appwrite)
// Import concrete implementations
import * as mock from './mock-api';
import { appwriteApi, parametersApi as realParametersApi, aidApplicationsApi as realAidApplicationsApi } from './appwrite-api';
import { appwriteServerApi } from './appwrite-server-api';
import type { QueryParams, CreateDocumentData, UpdateDocumentData, AppwriteResponse } from '@/types/collections';
import type { BeneficiaryDocument, UserDocument, DonationDocument, TaskDocument, MeetingDocument, MessageDocument } from '@/types/collections';
import type { User } from '@/types/auth';

// Infer provider from environment (client-safe first)
const clientProvider = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BACKEND_PROVIDER : undefined;
const serverProvider = process.env.BACKEND_PROVIDER;

// Decide provider with sensible defaults
const provider = (clientProvider || serverProvider || 'mock').toLowerCase();

// Build a light wrapper to align mock functions to appwriteApi shape
const mockApi = {
  // Auth (limited in mock for now)
  auth: {
    // no-op placeholders to keep call sites stable if used
    async login(email: string, password: string): Promise<{ session: null; user: { email: string } }> {
      return { session: null, user: { email } };
    },
    async getCurrentUser(): Promise<{ email: string }> {
      return { email: 'mock@test.com' };
    },
    async logout(): Promise<boolean> {
      return true;
    },
    async createAccount(email: string, password: string, name: string): Promise<{ email: string; name: string }> {
      return { email, name };
    },
    async updateProfile(_userId: string, _updates: Record<string, unknown>): Promise<{ ok: boolean }> {
      return { ok: true };
    },
  },

  // Users API
  users: {
    getUsers: async (_params?: QueryParams): Promise<AppwriteResponse<UserDocument[]>> => ({ data: [], error: null, total: 0 }),
    getUser: async (_id: string): Promise<AppwriteResponse<UserDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    createUser: async (_data: CreateDocumentData<UserDocument>): Promise<AppwriteResponse<UserDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    updateUser: async (_id: string, _data: UpdateDocumentData<UserDocument>): Promise<AppwriteResponse<UserDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    deleteUser: async (_id: string): Promise<AppwriteResponse<null>> => ({ data: null, error: null }),
  },

  // Beneficiaries (Appwrite-aligned mock surface)
  beneficiaries: {
    getBeneficiaries: (params?: QueryParams) => mock.appwriteGetBeneficiaries(params),
    getBeneficiary: (id: string) => mock.appwriteGetBeneficiary(id),
    createBeneficiary: (data: CreateDocumentData<BeneficiaryDocument>) => mock.appwriteCreateBeneficiary(data),
    updateBeneficiary: (id: string, data: UpdateDocumentData<BeneficiaryDocument>) => mock.appwriteUpdateBeneficiary(id, data),
    deleteBeneficiary: (id: string) => mock.appwriteDeleteBeneficiary(id),
  },

  donations: {
    getDonations: async (params?: QueryParams): Promise<AppwriteResponse<DonationDocument[]>> => ({ data: [], error: null, total: 0 }),
    getDonation: async (_id: string): Promise<AppwriteResponse<DonationDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    createDonation: async (_data: CreateDocumentData<DonationDocument>): Promise<AppwriteResponse<DonationDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    updateDonation: async (_id: string, _data: UpdateDocumentData<DonationDocument>): Promise<AppwriteResponse<DonationDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    deleteDonation: async (_id: string): Promise<AppwriteResponse<null>> => ({ data: null, error: null }),
  },

  tasks: {
    getTasks: async (_params?: QueryParams): Promise<AppwriteResponse<TaskDocument[]>> => ({ data: [], error: null, total: 0 }),
    getTask: async (_id: string): Promise<AppwriteResponse<TaskDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    createTask: async (_data: CreateDocumentData<TaskDocument>): Promise<AppwriteResponse<TaskDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    updateTask: async (_id: string, _data: UpdateDocumentData<TaskDocument>): Promise<AppwriteResponse<TaskDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    deleteTask: async (_id: string): Promise<AppwriteResponse<null>> => ({ data: null, error: null }),
  },

  meetings: {
    getMeetings: async (_params?: QueryParams): Promise<AppwriteResponse<MeetingDocument[]>> => ({ data: [], error: null, total: 0 }),
    createMeeting: async (_data: CreateDocumentData<MeetingDocument>): Promise<AppwriteResponse<MeetingDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    updateMeeting: async (_id: string, _data: UpdateDocumentData<MeetingDocument>): Promise<AppwriteResponse<MeetingDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    updateMeetingStatus: async (_id: string, _status: string): Promise<AppwriteResponse<MeetingDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    deleteMeeting: async (_id: string): Promise<AppwriteResponse<null>> => ({ data: null, error: null }),
  },

  messages: {
    getMessages: async (_params?: QueryParams): Promise<AppwriteResponse<MessageDocument[]>> => ({ data: [], error: null, total: 0 }),
    getMessage: async (_id: string): Promise<AppwriteResponse<MessageDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    createMessage: async (_data: CreateDocumentData<MessageDocument>): Promise<AppwriteResponse<MessageDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    updateMessage: async (_id: string, _data: UpdateDocumentData<MessageDocument>): Promise<AppwriteResponse<MessageDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    sendMessage: async (_id: string): Promise<AppwriteResponse<MessageDocument>> => ({ data: null, error: 'Not implemented in mock' }),
    deleteMessage: async (_id: string): Promise<AppwriteResponse<null>> => ({ data: null, error: null }),
    markAsRead: async (_id: string, _userId: string): Promise<AppwriteResponse<MessageDocument>> => ({ data: null, error: 'Not implemented in mock' }),
  },

  storage: {
    uploadFile: async (_args: Record<string, unknown>): Promise<AppwriteResponse<null>> => ({ data: null, error: 'Not implemented in mock' }),
    getFile: async (_bucketId: string, _fileId: string): Promise<AppwriteResponse<null>> => ({ data: null, error: 'Not implemented in mock' }),
    deleteFile: async (_bucketId: string, _fileId: string): Promise<AppwriteResponse<null>> => ({ data: null, error: null }),
    getFileDownload: async (_bucketId: string, _fileId: string): Promise<string> => '',
    getFilePreview: async (_bucketId: string, _fileId: string): Promise<string> => '',
  },

  dashboard: {
    getMetrics: async () => ({ data: { totalBeneficiaries: 0, totalDonations: 0, totalDonationAmount: 0, activeUsers: 0 }, error: null }),
  },
} as const;

// Selected API surface
const selectedApi = (() => {
  if (provider !== 'appwrite') return mockApi;
  // Use server API on the server, client API in the browser
  return typeof window === 'undefined' ? appwriteServerApi : appwriteApi;
})();

export const api = selectedApi;

// Expose parameters and aid applications APIs
export const parametersApi = provider === 'appwrite'
  ? realParametersApi
  : {
      getParametersByCategory: async (_category: string) => ({ data: [], error: null, total: 0 }),
      getAllParameters: async (_params?: QueryParams) => ({ data: [], error: null, total: 0 }),
      getParameter: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
      createParameter: async (_data: Record<string, unknown>) => ({ data: null, error: 'Not implemented in mock' }),
      updateParameter: async (_id: string, _data: Record<string, unknown>) => ({ data: null, error: 'Not implemented in mock' }),
      deleteParameter: async (_id: string) => ({ data: null, error: null }),
    };

export const aidApplicationsApi = provider === 'appwrite'
  ? realAidApplicationsApi
  : {
      getAidApplications: async (_params?: QueryParams) => ({ data: [], error: null, total: 0 }),
      getAidApplication: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
      createAidApplication: async (_data: Record<string, unknown>) => ({ data: null, error: 'Not implemented in mock' }),
      updateAidApplication: async (_id: string, _data: Record<string, unknown>) => ({ data: null, error: 'Not implemented in mock' }),
      deleteAidApplication: async (_id: string) => ({ data: null, error: null }),
      updateStage: async (_id: string, _stage: string) => ({ data: null, error: 'Not implemented in mock' }),
    };

// Also export named for compatibility if needed
export type SelectedApi = typeof api;

// Default export for convenience
export default api;