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

// Import caching utilities
import { getCache } from '@/lib/api-cache-fixed';

// Cache configuration
const CACHE_TTL = {
  beneficiaries: 5 * 60 * 1000, // 5 minutes
  donations: 3 * 60 * 1000, // 3 minutes
  tasks: 2 * 60 * 1000, // 2 minutes
  default: 2 * 60 * 1000, // 2 minutes
};

/**
 * Helper function to make API requests with caching
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  cacheKey?: string,
  cacheType?: string
): Promise<ConvexResponse<T>> {
  const cache = cacheType ? getCache<ConvexResponse<T>>(cacheType) : null;

  // Try to get from cache first (for GET requests)
  if (!options?.method || options.method === 'GET') {
    const cachedData = cache?.get(cacheKey || endpoint);
    if (cachedData) {
      return cachedData;
    }
  }

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

    const result: ConvexResponse<T> = {
      data: data.data as T,
      error: null,
      total: data.total,
    };

    // Cache the successful response (for GET requests)
    if (!options?.method || options.method === 'GET') {
      cache?.set(cacheKey || endpoint, result);
    }

    return result;
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

      const endpoint = `/api/beneficiaries?${searchParams.toString()}`;
      const cacheKey = `beneficiaries:${searchParams.toString()}`;

      return apiRequest<BeneficiaryDocument[]>(
        endpoint,
        undefined,
        cacheKey,
        'beneficiaries'
      );
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

      const endpoint = `/api/donations?${searchParams.toString()}`;
      const cacheKey = `donations:${searchParams.toString()}`;

      return apiRequest<DonationDocument[]>(
        endpoint,
        undefined,
        cacheKey,
        'donations'
      );
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

  // Partners
  partners: {
    getPartners: async (params?: QueryParams): Promise<ConvexResponse<any[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.filters?.type) searchParams.set('type', String(params.filters.type));
      if (params?.filters?.status) searchParams.set('status', String(params.filters.status));
      if (params?.filters?.partnership_type) searchParams.set('partnership_type', String(params.filters.partnership_type));

      return apiRequest<any[]>(`/api/partners?${searchParams.toString()}`);
    },
    getPartner: async (id: string): Promise<ConvexResponse<any>> => {
      return apiRequest<any>(`/api/partners/${id}`);
    },
    createPartner: async (data: CreateDocumentData<any>): Promise<ConvexResponse<any>> => {
      return apiRequest<any>('/api/partners', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updatePartner: async (
      id: string,
      data: UpdateDocumentData<any>
    ): Promise<ConvexResponse<any>> => {
      return apiRequest<any>(`/api/partners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deletePartner: async (id: string): Promise<ConvexResponse<null>> => {
      return apiRequest<null>(`/api/partners/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

// Cache Management Utilities
export const cacheUtils = {
  /**
   * Invalidate cache for a specific data type
   */
  invalidateCache: (dataType: string) => {
    const cache = getCache<any>(dataType);
    cache.clear();
  },

  /**
   * Invalidate cache for multiple data types
   */
  invalidateCaches: (dataTypes: string[]) => {
    dataTypes.forEach(type => {
      const cache = getCache<any>(type);
      cache.clear();
    });
  },

  /**
   * Get cache statistics
   */
  getCacheStats: (dataType: string) => {
    const cache = getCache<any>(dataType);
    return cache.getStats();
  },

  /**
   * Get cache size
   */
  getCacheSize: (dataType: string) => {
    const cache = getCache<any>(dataType);
    return cache.size();
  },

  /**
   * Clear all caches
   */
  clearAllCaches: () => {
    ['beneficiaries', 'donations', 'tasks', 'meetings', 'default'].forEach(type => {
      const cache = getCache<any>(type);
      cache.clear();
    });
  },
};

