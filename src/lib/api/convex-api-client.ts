/**
 * Convex API Client
 * 
 * Client-side wrapper that calls Next.js API routes which internally use Convex.
 * This provides a clean interface for components to use while keeping the actual
 * Convex implementation hidden behind API routes.
 */

import type {
  QueryParams,
  CreateDocumentData,
  UpdateDocumentData,
  ConvexResponse,
} from '@/types/database';
import type {
  BeneficiaryDocument,
  UserDocument,
  DonationDocument,
  TaskDocument,
  MeetingDocument,
  MessageDocument,
} from '@/types/database';

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ConvexResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        data: null,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return {
      data: data.data as T,
      error: null,
      total: data.total,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Convex-based API client that uses Next.js API routes
 */
export const convexApiClient = {
  // Beneficiaries
  beneficiaries: {
    getBeneficiaries: async (params?: QueryParams): Promise<ConvexResponse<BeneficiaryDocument[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.filters?.status) searchParams.set('status', String(params.filters.status));
      if (params?.filters?.city) searchParams.set('city', String(params.filters.city));

      return apiRequest<BeneficiaryDocument[]>(`/api/beneficiaries?${searchParams.toString()}`);
    },
    getBeneficiary: async (id: string): Promise<ConvexResponse<BeneficiaryDocument>> => {
      return apiRequest<BeneficiaryDocument>(`/api/beneficiaries/${id}`);
    },
    createBeneficiary: async (
      data: CreateDocumentData<BeneficiaryDocument>
    ): Promise<ConvexResponse<BeneficiaryDocument>> => {
      return apiRequest<BeneficiaryDocument>('/api/beneficiaries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateBeneficiary: async (
      id: string,
      data: UpdateDocumentData<BeneficiaryDocument>
    ): Promise<ConvexResponse<BeneficiaryDocument>> => {
      return apiRequest<BeneficiaryDocument>(`/api/beneficiaries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deleteBeneficiary: async (id: string): Promise<ConvexResponse<null>> => {
      return apiRequest<null>(`/api/beneficiaries/${id}`, {
        method: 'DELETE',
      });
    },
    getAidHistory: async (beneficiaryId: string) => {
      // Stub implementation - returns empty array
      return [];
    },
  },

  // Donations
  donations: {
    getDonations: async (params?: QueryParams): Promise<ConvexResponse<DonationDocument[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);

      return apiRequest<DonationDocument[]>(`/api/donations?${searchParams.toString()}`);
    },
    getDonation: async (id: string): Promise<ConvexResponse<DonationDocument>> => {
      return apiRequest<DonationDocument>(`/api/donations/${id}`);
    },
    createDonation: async (
      data: CreateDocumentData<DonationDocument>
    ): Promise<ConvexResponse<DonationDocument>> => {
      return apiRequest<DonationDocument>('/api/donations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateDonation: async (
      id: string,
      data: UpdateDocumentData<DonationDocument>
    ): Promise<ConvexResponse<DonationDocument>> => {
      return apiRequest<DonationDocument>(`/api/donations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deleteDonation: async (id: string): Promise<ConvexResponse<null>> => {
      return apiRequest<null>(`/api/donations/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Tasks
  tasks: {
    getTasks: async (params?: QueryParams): Promise<ConvexResponse<TaskDocument[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.filters?.status) searchParams.set('status', String(params.filters.status));
      if (params?.filters?.priority) searchParams.set('priority', String(params.filters.priority));
      if (params?.filters?.assigned_to) searchParams.set('assigned_to', String(params.filters.assigned_to));

      return apiRequest<TaskDocument[]>(`/api/tasks?${searchParams.toString()}`);
    },
    getTask: async (id: string): Promise<ConvexResponse<TaskDocument>> => {
      return apiRequest<TaskDocument>(`/api/tasks/${id}`);
    },
    createTask: async (
      data: CreateDocumentData<TaskDocument>
    ): Promise<ConvexResponse<TaskDocument>> => {
      return apiRequest<TaskDocument>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateTask: async (
      id: string,
      data: UpdateDocumentData<TaskDocument>
    ): Promise<ConvexResponse<TaskDocument>> => {
      return apiRequest<TaskDocument>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    updateTaskStatus: async (
      id: string,
      status: TaskDocument['status']
    ): Promise<ConvexResponse<TaskDocument>> => {
      return apiRequest<TaskDocument>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    deleteTask: async (id: string): Promise<ConvexResponse<null>> => {
      return apiRequest<null>(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Meetings
  meetings: {
    getMeetings: async (params?: QueryParams): Promise<ConvexResponse<MeetingDocument[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.filters?.status) searchParams.set('status', String(params.filters.status));

      return apiRequest<MeetingDocument[]>(`/api/meetings?${searchParams.toString()}`);
    },
    getMeetingsByTab: async (userId: string, tab: string): Promise<ConvexResponse<MeetingDocument[]>> => {
      // Helper method for backward compatibility
      return convexApiClient.meetings.getMeetings({
        filters: { status: tab === 'all' ? undefined : tab },
      });
    },
    getMeeting: async (id: string): Promise<ConvexResponse<MeetingDocument>> => {
      return apiRequest<MeetingDocument>(`/api/meetings/${id}`);
    },
    createMeeting: async (
      data: CreateDocumentData<MeetingDocument>
    ): Promise<ConvexResponse<MeetingDocument>> => {
      return apiRequest<MeetingDocument>('/api/meetings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateMeeting: async (
      id: string,
      data: UpdateDocumentData<MeetingDocument>
    ): Promise<ConvexResponse<MeetingDocument>> => {
      return apiRequest<MeetingDocument>(`/api/meetings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    updateMeetingStatus: async (
      id: string,
      status: string
    ): Promise<ConvexResponse<MeetingDocument>> => {
      return apiRequest<MeetingDocument>(`/api/meetings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    deleteMeeting: async (id: string): Promise<ConvexResponse<null>> => {
      return apiRequest<null>(`/api/meetings/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Messages
  messages: {
    getMessages: async (params?: QueryParams): Promise<ConvexResponse<MessageDocument[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);

      return apiRequest<MessageDocument[]>(`/api/messages?${searchParams.toString()}`);
    },
    getMessage: async (id: string): Promise<ConvexResponse<MessageDocument>> => {
      return apiRequest<MessageDocument>(`/api/messages/${id}`);
    },
    createMessage: async (
      data: CreateDocumentData<MessageDocument>
    ): Promise<ConvexResponse<MessageDocument>> => {
      return apiRequest<MessageDocument>('/api/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateMessage: async (
      id: string,
      data: UpdateDocumentData<MessageDocument>
    ): Promise<ConvexResponse<MessageDocument>> => {
      return apiRequest<MessageDocument>(`/api/messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    sendMessage: async (id: string): Promise<ConvexResponse<MessageDocument>> => {
      return apiRequest<MessageDocument>(`/api/messages/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'send' }),
      });
    },
    deleteMessage: async (id: string): Promise<ConvexResponse<null>> => {
      return apiRequest<null>(`/api/messages/${id}`, {
        method: 'DELETE',
      });
    },
    markAsRead: async (
      id: string,
      userId: string
    ): Promise<ConvexResponse<MessageDocument>> => {
      return apiRequest<MessageDocument>(`/api/messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_read: true }),
      });
    },
  },

  // Users
  users: {
    getUsers: async (params?: QueryParams): Promise<ConvexResponse<UserDocument[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);

      return apiRequest<UserDocument[]>(`/api/users?${searchParams.toString()}`);
    },
    getUser: async (id: string): Promise<ConvexResponse<UserDocument>> => {
      return apiRequest<UserDocument>(`/api/users/${id}`);
    },
    createUser: async (
      data: CreateDocumentData<UserDocument>
    ): Promise<ConvexResponse<UserDocument>> => {
      return apiRequest<UserDocument>('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateUser: async (
      id: string,
      data: UpdateDocumentData<UserDocument>
    ): Promise<ConvexResponse<UserDocument>> => {
      return apiRequest<UserDocument>(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    deleteUser: async (id: string): Promise<ConvexResponse<null>> => {
      return apiRequest<null>(`/api/users/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

