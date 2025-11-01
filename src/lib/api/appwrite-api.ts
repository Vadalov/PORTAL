/**
 * Appwrite API Service
 * Replaces mock API with real Appwrite operations
 */

import { account, databases, storage, Query, handleAppwriteError, withRetry } from '@/lib/appwrite/client';
import { DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS } from '@/lib/appwrite/config';
import { ID } from 'appwrite';
import type {
  UserDocument,
  BeneficiaryDocument,
  DonationDocument,
  AidRequestDocument,
  AidApplicationDocument,
  ScholarshipDocument,
  ParameterDocument,
  TaskDocument,
  MeetingDocument,
  MessageDocument,
  AppwriteListResponse,
  AppwriteResponse,
  QueryParams,
  CreateDocumentData,
  UpdateDocumentData,
  FileUpload,
  UploadedFile
} from '@/types/collections';
import { UserRole } from '@/types/auth';
import {
  sanitizeTcNo,
  sanitizePhone,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeObject
} from '@/lib/sanitization';

import {
  ValidationError,
  DatabaseError,
  formatErrorMessage
} from '@/lib/errors';

import { beneficiarySchema } from '@/lib/validations/beneficiary';
import { z } from 'zod';

/**
 * Authentication API
 */
export const authApi = {
  async login(email: string, password: string) {
    return await handleAppwriteError(async () => {
      const session = await account.createEmailPasswordSession({ email, password });
      const user = await account.get();
      return { session, user };
    });
  },

  async getCurrentUser() {
    return await handleAppwriteError(async () => {
      return await account.get();
    });
  },

  async logout() {
    return await handleAppwriteError(async () => {
      return await account.deleteSession('current');
    });
  },

  async createAccount(email: string, password: string, name: string) {
    return await handleAppwriteError(async () => {
      return await account.create(ID.unique(), email, password, name);
    });
  },

  /**
   * Update user profile information
   * @param userId - User ID (for consistency, operates on current user in client SDK)
   * @param updates - Profile updates object
   * @param updates.name - New display name (optional)
   * @param updates.email - New email address (optional, requires password)
   * @param updates.password - Current password (required when updating email)
   * @returns Updated user object
   * @throws Error if email update is attempted without password
   *
   * Note: Email updates require password verification for security.
   * After email change, email verification status is reset.
   */
  async updateProfile(userId: string, updates: { name?: string; email?: string; password?: string }) {
    return await handleAppwriteError(async () => {
      const results: Record<string, unknown> = {};
      
      // Update name if provided
      if (updates.name) {
        const nameResult = await account.updateName(updates.name);
        results.name = nameResult;
      }
      
      // Update email if provided (requires password for security)
      if (updates.email) {
        if (!updates.password) {
          throw new Error('Password is required to update email address');
        }
        const emailResult = await account.updateEmail(updates.email, updates.password);
        results.email = emailResult;
      }
      
      // Return the last updated user object or fetch current user
      return results.email || results.name || await account.get();
    });
  }
};

/**
 * Users API
 */
export const usersApi = {
  async getUsers(params?: QueryParams): Promise<AppwriteResponse<UserDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.limit(params?.limit || 10),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 10))
      ];

      if (params?.search) {
        queries.push(Query.search('name', params.search));
      }

      if (params?.orderBy) {
        queries.push(Query.orderDesc(params.orderBy));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, queries);
      
      return {
        data: response.documents as unknown as UserDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getUser(id: string): Promise<AppwriteResponse<UserDocument>> {
    return await handleAppwriteError(async () => {
      const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, id);
      return {
        data: user as unknown as UserDocument,
        error: null
      };
    });
  },

  async createUser(data: CreateDocumentData<UserDocument>): Promise<AppwriteResponse<UserDocument>> {
    return await handleAppwriteError(async () => {
      const user = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        data
      );
      return {
        data: user as unknown as UserDocument,
        error: null
      };
    });
  },

  async updateUser(id: string, data: UpdateDocumentData<UserDocument>): Promise<AppwriteResponse<UserDocument>> {
    return await handleAppwriteError(async () => {
      const user = await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, id, data);
      return {
        data: user as unknown as UserDocument,
        error: null
      };
    });
  },

  async deleteUser(id: string): Promise<AppwriteResponse<null>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USERS, id);
      return {
        data: null,
        error: null
      };
    });
  }
};

/**
 * Sanitize beneficiary data before database operations
 * Server-side sanitization guard with Zod validation
 */
function sanitizeBeneficiaryData(data: CreateDocumentData<BeneficiaryDocument> | UpdateDocumentData<BeneficiaryDocument>): CreateDocumentData<BeneficiaryDocument> | UpdateDocumentData<BeneficiaryDocument> {
  const sanitized = { ...data } as Record<string, unknown>;
  
  // Handle legacy field mapping: aid_amount -> totalAidAmount
  if (sanitized.aid_amount !== undefined && sanitized.totalAidAmount === undefined) {
    sanitized.totalAidAmount = sanitized.aid_amount;
    delete sanitized.aid_amount;
  }
  
  // TC Kimlik No (legacy mapping)
  if (sanitized.identityNumber) {
    const cleanTc = sanitizeTcNo(sanitized.identityNumber as string);
    if (!cleanTc) {
      throw new ValidationError('Geçersiz TC Kimlik No');
    }
    sanitized.identityNumber = cleanTc;
  }
  
  // Phone numbers (legacy mapping)
  if (sanitized.mobilePhone) {
    const cleanPhone = sanitizePhone(sanitized.mobilePhone as string);
    if (!cleanPhone) {
      throw new ValidationError('Geçersiz telefon numarası');
    }
    sanitized.mobilePhone = cleanPhone;
  }
  
  if (sanitized.landlinePhone) {
    const cleanLandline = sanitizePhone(sanitized.landlinePhone as string);
    sanitized.landlinePhone = cleanLandline || undefined;
  }
  
  // Email
  if (sanitized.email) {
    const cleanEmail = sanitizeEmail(sanitized.email as string);
    if (sanitized.email && !cleanEmail) {
      throw new ValidationError('Geçersiz email adresi');
    }
    sanitized.email = cleanEmail || undefined;
  }
  
  // Numbers
  const numberFields = ['monthlyIncome', 'monthlyExpense', 'totalAidAmount', 'familyMemberCount'];
  numberFields.forEach(field => {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      const cleanNumber = sanitizeNumber(sanitized[field] as string | number);
      if (cleanNumber === null && sanitized[field] !== null) {
        throw new ValidationError(`Geçersiz sayı değeri: ${field}`);
      }
      sanitized[field] = cleanNumber;
    }
  });
  
  // Text fields - sanitize object
  const textFields = [
    'notes',
    'address',
    'healthProblem',
    'chronicIllnessDetail',
    'disabilityDetail'
  ];
  
  textFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      const sanitizedObj = sanitizeObject(
        { [field]: sanitized[field] },
        { allowHtml: false }
      );
      sanitized[field] = sanitizedObj[field];
    }
  });
  
  // Validate against Zod schema to ensure only known fields are passed to database
  try {
    const validatedData = beneficiarySchema.partial().parse(sanitized);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(`Veri doğrulama hatası: ${errorMessages}`);
    }
    throw error;
  }
}

/**
* Beneficiaries API
*/
export const beneficiariesApi = {
async getBeneficiaries(params?: QueryParams): Promise<AppwriteResponse<BeneficiaryDocument[]>> {
return await handleAppwriteError(async () => {
  const queries = [
      Query.limit(params?.limit || 10),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 10))
      ];

      if (params?.search) {
        queries.push(Query.search('name', params.search));
      }

      if (params?.orderBy) {
        queries.push(Query.orderDesc(params.orderBy));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BENEFICIARIES, queries);

      return {
        data: response.documents as unknown as BeneficiaryDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getBeneficiary(id: string): Promise<AppwriteResponse<BeneficiaryDocument>> {
    return await handleAppwriteError(async () => {
      const beneficiary = await databases.getDocument(DATABASE_ID, COLLECTIONS.BENEFICIARIES, id);
      return {
        data: beneficiary as unknown as BeneficiaryDocument,
        error: null
      };
    });
  },

  async createBeneficiary(data: CreateDocumentData<BeneficiaryDocument>): Promise<AppwriteResponse<BeneficiaryDocument>> {
    return await handleAppwriteError(async () => {
      // ✅ Sanitize data before creating
      const sanitizedData = sanitizeBeneficiaryData(data);
      
      const beneficiary = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.BENEFICIARIES,
        ID.unique(),
        sanitizedData
      );
      return {
        data: beneficiary as unknown as BeneficiaryDocument,
        error: null
      };
    });
  },

  async updateBeneficiary(id: string, data: UpdateDocumentData<BeneficiaryDocument>): Promise<AppwriteResponse<BeneficiaryDocument>> {
    return await handleAppwriteError(async () => {
      // ✅ Sanitize data before updating
      const sanitizedData = sanitizeBeneficiaryData(data);
      
      const beneficiary = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.BENEFICIARIES,
        id,
        sanitizedData
      );
      return {
        data: beneficiary as unknown as BeneficiaryDocument,
        error: null
      };
    });
  },

  async deleteBeneficiary(id: string): Promise<AppwriteResponse<null>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.BENEFICIARIES, id);
      return {
        data: null,
        error: null
      };
    });
  }
};

/**
* Donations API
*/
export const donationsApi = {
async getDonations(params?: QueryParams): Promise<AppwriteResponse<DonationDocument[]>> {
return await handleAppwriteError(async () => {
  const queries = [
      Query.limit(params?.limit || 10),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 10))
      ];

      if (params?.search) {
        queries.push(Query.search('donor_name', params.search));
      }

      if (params?.orderBy) {
        queries.push(Query.orderDesc(params.orderBy));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DONATIONS, queries);

      return {
        data: response.documents as unknown as DonationDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getDonation(id: string): Promise<AppwriteResponse<DonationDocument>> {
    return await handleAppwriteError(async () => {
      const donation = await databases.getDocument(DATABASE_ID, COLLECTIONS.DONATIONS, id);
      return {
        data: donation as unknown as DonationDocument,
        error: null
      };
    });
  },

  async createDonation(data: CreateDocumentData<DonationDocument>): Promise<AppwriteResponse<DonationDocument>> {
    return await handleAppwriteError(async () => {
      const donation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DONATIONS,
        ID.unique(),
        data
      );
      return {
        data: donation as unknown as DonationDocument,
        error: null
      };
    });
  },

  async updateDonation(id: string, data: UpdateDocumentData<DonationDocument>): Promise<AppwriteResponse<DonationDocument>> {
    return await handleAppwriteError(async () => {
      const donation = await databases.updateDocument(DATABASE_ID, COLLECTIONS.DONATIONS, id, data);
      return {
        data: donation as unknown as DonationDocument,
        error: null
      };
    });
  },

  async deleteDonation(id: string): Promise<AppwriteResponse<null>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.DONATIONS, id);
      return {
        data: null,
        error: null
      };
    });
  }
};

/**
 * Storage API
 */
export const storageApi = {
  async uploadFile({ file, bucketId, permissions }: FileUpload): Promise<AppwriteResponse<UploadedFile>> {
    return await handleAppwriteError(async () => {
      const uploadedFile = await storage.createFile(
        bucketId,
        ID.unique(),
        file,
        permissions
      );
      return {
        data: uploadedFile as UploadedFile,
        error: null
      };
    });
  },

  async getFile(bucketId: string, fileId: string): Promise<AppwriteResponse<UploadedFile>> {
    return await handleAppwriteError(async () => {
      const file = await storage.getFile(bucketId, fileId);
      return {
        data: file as UploadedFile,
        error: null
      };
    });
  },

  async deleteFile(bucketId: string, fileId: string): Promise<AppwriteResponse<null>> {
    return await handleAppwriteError(async () => {
      await storage.deleteFile(bucketId, fileId);
      return {
        data: null,
        error: null
      };
    });
  },

  async getFileDownload(bucketId: string, fileId: string): Promise<string> {
    return storage.getFileDownload(bucketId, fileId);
  },

  async getFilePreview(bucketId: string, fileId: string, width?: number, height?: number): Promise<string> {
    return storage.getFilePreview(bucketId, fileId, width, height);
  }
};

/**
* Tasks API
*/
export const tasksApi = {
  async getTasks(params?: QueryParams): Promise<AppwriteResponse<TaskDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.limit(params?.limit || 20),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 20)),
        Query.orderDesc('$createdAt')
      ];

      if (params?.search) {
        queries.push(Query.search('title', params.search));
      }

      if (params?.filters?.status) {
        queries.push(Query.equal('status', params.filters.status));
      }

      if (params?.filters?.priority) {
        queries.push(Query.equal('priority', params.filters.priority));
      }

      if (params?.filters?.assigned_to) {
        queries.push(Query.equal('assigned_to', params.filters.assigned_to));
      }

      if (params?.filters?.category) {
        queries.push(Query.equal('category', params.filters.category));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
      
      return {
        data: response.documents as unknown as TaskDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getTask(id: string): Promise<AppwriteResponse<TaskDocument>> {
    return await handleAppwriteError(async () => {
      const task = await databases.getDocument(DATABASE_ID, COLLECTIONS.TASKS, id);
      return {
        data: task as unknown as TaskDocument,
        error: null
      };
    });
  },

  async createTask(data: CreateDocumentData<TaskDocument>): Promise<AppwriteResponse<TaskDocument>> {
    return await handleAppwriteError(async () => {
      const task = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        ID.unique(),
        {
          ...data,
          is_read: false,
          status: data.status || 'pending'
        }
      );
      return {
        data: task as unknown as TaskDocument,
        error: null
      };
    });
  },

  async updateTask(id: string, data: UpdateDocumentData<TaskDocument>): Promise<AppwriteResponse<TaskDocument>> {
    return await handleAppwriteError(async () => {
      // Auto-set completed_at when status becomes 'completed'
      const updateData = { ...data };
      if (data.status === 'completed' && !data.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const task = await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, id, updateData);
      return {
        data: task as unknown as TaskDocument,
        error: null
      };
    });
  },

  async deleteTask(id: string): Promise<AppwriteResponse<null>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, id);
      return {
        data: null,
        error: null
      };
    });
  },

  async updateTaskStatus(id: string, status: TaskDocument['status']): Promise<AppwriteResponse<TaskDocument>> {
    return await handleAppwriteError(async () => {
      const updateData: UpdateDocumentData<TaskDocument> = { status };
      
      // Auto-set completed_at when status becomes 'completed'
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const task = await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, id, updateData);
      return {
        data: task as unknown as TaskDocument,
        error: null
      };
    });
  },

  async getTasksByStatus(status: string): Promise<AppwriteResponse<TaskDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.equal('status', status),
        Query.orderDesc('$createdAt')
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
      
      return {
        data: response.documents as unknown as TaskDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getPendingTasksCount(): Promise<AppwriteResponse<number>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.equal('status', 'pending'),
        Query.limit(1)
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
      
      return {
        data: response.total,
        error: null
      };
    });
  }
};

/**
* Dashboard API
*/
export const dashboardApi = {
async getMetrics(): Promise<AppwriteResponse<any>> {
  return await handleAppwriteError(async () => {
    // Get total beneficiaries count
    const beneficiariesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BENEFICIARIES,
        [Query.limit(1)]
      );

      // Get total donations and amount
      const donationsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DONATIONS,
        [Query.limit(1000)] // Get all for calculation
      );

      // Get active users count
      const usersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('isActive', true), Query.limit(1)]
      );

      // Calculate total donation amount
      const totalDonationAmount = (donationsResponse.documents as unknown as DonationDocument[])
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.amount, 0);

      const metrics = {
        totalBeneficiaries: beneficiariesResponse.total,
        totalDonations: donationsResponse.total,
        totalDonationAmount,
        activeUsers: usersResponse.total
      };

      return {
        data: metrics,
        error: null
      };
  });
}
};

/**
 * Meetings API
 */
export const meetingsApi = {
  async getMeetings(params?: QueryParams): Promise<AppwriteResponse<MeetingDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.limit(params?.limit || 20),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 20)),
        Query.orderDesc('meeting_date')
      ];

      if (params?.search) {
        queries.push(Query.search('title', params.search));
      }

      if (params?.filters?.status) {
        queries.push(Query.equal('status', params.filters.status));
      }

      if (params?.filters?.meeting_type) {
        queries.push(Query.equal('meeting_type', params.filters.meeting_type));
      }

      if (params?.filters?.organizer) {
        queries.push(Query.equal('organizer', params.filters.organizer));
      }

      if (params?.filters?.date_from) {
        queries.push(Query.greaterThanEqual('meeting_date', params.filters.date_from));
      }

      if (params?.filters?.date_to) {
        queries.push(Query.lessThanEqual('meeting_date', params.filters.date_to));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MEETINGS, queries);

      return {
        data: response.documents as unknown as MeetingDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getMeeting(id: string): Promise<AppwriteResponse<MeetingDocument>> {
    return await handleAppwriteError(async () => {
      const meeting = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEETINGS, id);
      return {
        data: meeting as unknown as MeetingDocument,
        error: null
      };
    });
  },

  async createMeeting(data: CreateDocumentData<MeetingDocument>): Promise<AppwriteResponse<MeetingDocument>> {
    return await handleAppwriteError(async () => {
      // Ensure participants array includes the organizer
      const participants = data.participants || [];
      if (data.organizer && !participants.includes(data.organizer)) {
        participants.push(data.organizer);
      }

      const meeting = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MEETINGS,
        ID.unique(),
        {
          ...data,
          participants
        }
      );
      return {
        data: meeting as unknown as MeetingDocument,
        error: null
      };
    });
  },

  async updateMeeting(id: string, data: UpdateDocumentData<MeetingDocument>): Promise<AppwriteResponse<MeetingDocument>> {
    return await handleAppwriteError(async () => {
      const meeting = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MEETINGS,
        id,
        data
      );
      return {
        data: meeting as unknown as MeetingDocument,
        error: null
      };
    });
  },

  async deleteMeeting(id: string): Promise<AppwriteResponse<void>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MEETINGS, id);
      return {
        data: null,
        error: null
      };
    });
  },

  async updateMeetingStatus(id: string, status: MeetingDocument['status']): Promise<AppwriteResponse<MeetingDocument>> {
    return this.updateMeeting(id, { status });
  },

  async getMeetingsByUser(userId: string, role: 'organizer' | 'participant' | 'all'): Promise<AppwriteResponse<MeetingDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries: string[] = [
        Query.orderDesc('meeting_date')
      ];

      if (role === 'organizer') {
        queries.push(Query.equal('organizer', userId));
      } else if (role === 'participant') {
        queries.push(Query.contains('participants', userId));
      } else if (role === 'all') {
        queries.push(Query.or([
          Query.equal('organizer', userId),
          Query.contains('participants', userId)
        ]));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MEETINGS, queries);

      return {
        data: response.documents as unknown as MeetingDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getUpcomingMeetingsCount(): Promise<AppwriteResponse<number>> {
    return await handleAppwriteError(async () => {
      const today = new Date().toISOString();
      const queries = [
        Query.equal('status', 'scheduled'),
        Query.greaterThanEqual('meeting_date', today)
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MEETINGS, queries);

      return {
        data: response.total,
        error: null
      };
    });
  },

  async getMeetingsByTab(userId: string, tab: 'invited' | 'attended' | 'informed' | 'open'): Promise<AppwriteResponse<MeetingDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries: string[] = [
        Query.orderDesc('meeting_date'),
        Query.limit(5) // Limit for dashboard display
      ];

      if (tab === 'invited') {
        // Scheduled meetings where user is participant
        queries.push(Query.equal('status', 'scheduled'));
        queries.push(Query.contains('participants', userId));
      } else if (tab === 'attended') {
        // Completed meetings where user was participant
        queries.push(Query.equal('status', 'completed'));
        queries.push(Query.contains('participants', userId));
      } else if (tab === 'informed') {
        // Scheduled meetings where user is NOT participant (informational)
        // Note: Appwrite doesn't have a direct "NOT contains" query
        // We'll get all scheduled meetings and filter on client side
        queries.push(Query.equal('status', 'scheduled'));
      } else if (tab === 'open') {
        // All scheduled meetings
        queries.push(Query.equal('status', 'scheduled'));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MEETINGS, queries);
      let meetings = response.documents as unknown as MeetingDocument[];

      // Client-side filtering for 'informed' tab
      if (tab === 'informed') {
        meetings = meetings.filter(meeting => !meeting.participants.includes(userId));
      }

      return {
        data: meetings,
        error: null,
        total: meetings.length
      };
    });
  }
};

/**
 * Messages API
 */
export const messagesApi = {
  async getMessages(params?: QueryParams): Promise<AppwriteResponse<MessageDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.limit(params?.limit || 20),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 20)),
        Query.orderDesc('$createdAt')
      ];

      if (params?.search) {
        queries.push(Query.search('subject', params.search));
      }

      if (params?.filters?.message_type) {
        queries.push(Query.equal('message_type', params.filters.message_type));
      }

      if (params?.filters?.status) {
        queries.push(Query.equal('status', params.filters.status));
      }

      if (params?.filters?.sender) {
        queries.push(Query.equal('sender', params.filters.sender));
      }

      if (params?.filters?.is_bulk !== undefined) {
        queries.push(Query.equal('is_bulk', params.filters.is_bulk));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, queries);
      
      return {
        data: response.documents as unknown as MessageDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getMessage(id: string): Promise<AppwriteResponse<MessageDocument>> {
    return await handleAppwriteError(async () => {
      const message = await databases.getDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id);
      return {
        data: message as unknown as MessageDocument,
        error: null
      };
    });
  },

  async createMessage(data: CreateDocumentData<MessageDocument>): Promise<AppwriteResponse<MessageDocument>> {
    return await handleAppwriteError(async () => {
      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        ID.unique(),
        {
          ...data,
          status: data.status || 'draft'
        }
      );
      return {
        data: message as unknown as MessageDocument,
        error: null
      };
    });
  },

  async updateMessage(id: string, data: UpdateDocumentData<MessageDocument>): Promise<AppwriteResponse<MessageDocument>> {
    return await handleAppwriteError(async () => {
      const message = await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id, data);
      return {
        data: message as unknown as MessageDocument,
        error: null
      };
    });
  },

  async deleteMessage(id: string): Promise<AppwriteResponse<null>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id);
      return {
        data: null,
        error: null
      };
    });
  },

  async sendMessage(id: string): Promise<AppwriteResponse<MessageDocument>> {
    return await handleAppwriteError(async () => {
      const message = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        id,
        {
          status: 'sent',
          sent_at: new Date().toISOString()
        }
      );
      
      return {
        data: message as unknown as MessageDocument,
        error: null
      };
    });
  },

  async getMessagesByType(messageType: 'sms' | 'email' | 'internal'): Promise<AppwriteResponse<MessageDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.equal('message_type', messageType),
        Query.orderDesc('$createdAt')
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, queries);
      
      return {
        data: response.documents as unknown as MessageDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getMessagesBySender(senderId: string): Promise<AppwriteResponse<MessageDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.equal('sender', senderId),
        Query.orderDesc('$createdAt')
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, queries);
      
      return {
        data: response.documents as unknown as MessageDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getMessagesStatistics(): Promise<AppwriteResponse<{
    totalSms: number;
    totalEmails: number;
    failedMessages: number;
    draftMessages: number;
  }>> {
    return await handleAppwriteError(async () => {
      const smsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [Query.equal('message_type', 'sms'), Query.equal('status', 'sent'), Query.limit(1)]
      );

      const emailResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [Query.equal('message_type', 'email'), Query.equal('status', 'sent'), Query.limit(1)]
      );

      const failedResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [Query.equal('status', 'failed'), Query.limit(1)]
      );

      const draftResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [Query.equal('status', 'draft'), Query.limit(1)]
      );

      const statistics = {
        totalSms: smsResponse.total,
        totalEmails: emailResponse.total,
        failedMessages: failedResponse.total,
        draftMessages: draftResponse.total
      };

      return {
        data: statistics,
        error: null
      };
    });
  },

  async getInboxMessages(userId: string): Promise<AppwriteResponse<MessageDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.equal('message_type', 'internal'),
        Query.contains('recipients', userId),
        Query.orderDesc('$createdAt')
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, queries);
      
      return {
        data: response.documents as unknown as MessageDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async markAsRead(id: string, userId: string): Promise<AppwriteResponse<MessageDocument>> {
    return await handleAppwriteError(async () => {
      const message = await databases.getDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id);
      
      return {
        data: message as unknown as MessageDocument,
        error: null
      };
    });
  }
};

/**
 * Main API object (replaces mockApi)
 */
export const appwriteApi = {
  auth: authApi,
  users: usersApi,
  beneficiaries: beneficiariesApi,
  donations: donationsApi,
  tasks: tasksApi,
  meetings: meetingsApi,
  messages: messagesApi,
  storage: storageApi,
  dashboard: dashboardApi,
  
  // Legacy compatibility methods
  async login(email: string, password: string) {
    const result = await authApi.login(email, password);
    return {
      data: result.user,
      error: null
    };
  },

  async getUser(id: string) {
    return await usersApi.getUser(id);
  },

  async getBeneficiaries(params?: QueryParams) {
    return await beneficiariesApi.getBeneficiaries(params);
  },

  async getBeneficiary(id: string) {
    return await beneficiariesApi.getBeneficiary(id);
  },

  async createBeneficiary(data: CreateDocumentData<BeneficiaryDocument>) {
    return await beneficiariesApi.createBeneficiary(data);
  },

  async getDonations(params?: QueryParams) {
    return await donationsApi.getDonations(params);
  },

  async getDonation(id: string) {
    return await donationsApi.getDonation(id);
  },

  async createDonation(data: CreateDocumentData<DonationDocument>) {
    return await donationsApi.createDonation(data);
  },

  async getDashboardMetrics() {
    return await dashboardApi.getMetrics();
  },

  // Tasks legacy compatibility methods
  async getTasks(params?: QueryParams) {
    return await tasksApi.getTasks(params);
  },

  async getTask(id: string) {
    return await tasksApi.getTask(id);
  },

  async createTask(data: CreateDocumentData<TaskDocument>) {
    return await tasksApi.createTask(data);
  },

  async updateTask(id: string, data: UpdateDocumentData<TaskDocument>) {
    return await tasksApi.updateTask(id, data);
  },

  async deleteTask(id: string) {
    return await tasksApi.deleteTask(id);
  }
};

/**
 * Parameters API (Portal Plus Style)
 */
export const parametersApi = {
  async getParametersByCategory(category: string): Promise<AppwriteResponse<ParameterDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.equal('category', category),
        Query.equal('is_active', true),
        Query.orderAsc('order')
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PARAMETERS, queries);
      
      return {
        data: response.documents as unknown as ParameterDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getAllParameters(params?: QueryParams): Promise<AppwriteResponse<ParameterDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.limit(params?.limit || 100),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 100))
      ];

      if (params?.search) {
        queries.push(Query.search('name_tr', params.search));
      }

      if (params?.filters?.category) {
        queries.push(Query.equal('category', params.filters.category));
      }

      if (params?.filters?.is_active !== undefined) {
        queries.push(Query.equal('is_active', params.filters.is_active));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PARAMETERS, queries);
      
      return {
        data: response.documents as unknown as ParameterDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getParameter(id: string): Promise<AppwriteResponse<ParameterDocument>> {
    return await handleAppwriteError(async () => {
      const parameter = await databases.getDocument(DATABASE_ID, COLLECTIONS.PARAMETERS, id);
      return {
        data: parameter as unknown as ParameterDocument,
        error: null
      };
    });
  },

  async createParameter(data: CreateDocumentData<ParameterDocument>): Promise<AppwriteResponse<ParameterDocument>> {
    return await handleAppwriteError(async () => {
      const parameter = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PARAMETERS,
        ID.unique(),
        data
      );
      return {
        data: parameter as unknown as ParameterDocument,
        error: null
      };
    });
  },

  async updateParameter(id: string, data: UpdateDocumentData<ParameterDocument>): Promise<AppwriteResponse<ParameterDocument>> {
    return await handleAppwriteError(async () => {
      const parameter = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PARAMETERS,
        id,
        data
      );
      return {
        data: parameter as unknown as ParameterDocument,
        error: null
      };
    });
  },

  async deleteParameter(id: string): Promise<AppwriteResponse<void>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PARAMETERS, id);
      return {
        data: null,
        error: null
      };
    });
  }
};


/**
 * Aid Applications API (Portal Plus Style - 182 kayıt)
 */
export const aidApplicationsApi = {
  async getAidApplications(params?: QueryParams): Promise<AppwriteResponse<AidApplicationDocument[]>> {
    return await handleAppwriteError(async () => {
      const queries = [
        Query.limit(params?.limit || 20),
        Query.offset(((params?.page || 1) - 1) * (params?.limit || 20)),
        Query.orderDesc('application_date')
      ];

      if (params?.search) {
        queries.push(Query.search('applicant_name', params.search));
      }

      if (params?.filters?.stage) {
        queries.push(Query.equal('stage', params.filters.stage));
      }

      if (params?.filters?.status) {
        queries.push(Query.equal('status', params.filters.status));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AID_APPLICATIONS, queries);
      
      return {
        data: response.documents as unknown as AidApplicationDocument[],
        error: null,
        total: response.total
      };
    });
  },

  async getAidApplication(id: string): Promise<AppwriteResponse<AidApplicationDocument>> {
    return await handleAppwriteError(async () => {
      const application = await databases.getDocument(DATABASE_ID, COLLECTIONS.AID_APPLICATIONS, id);
      return {
        data: application as unknown as AidApplicationDocument,
        error: null
      };
    });
  },

  async createAidApplication(data: CreateDocumentData<AidApplicationDocument>): Promise<AppwriteResponse<AidApplicationDocument>> {
    return await handleAppwriteError(async () => {
      const application = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.AID_APPLICATIONS,
        ID.unique(),
        {
          ...data,
          application_date: data.application_date || new Date().toISOString(),
        }
      );
      return {
        data: application as unknown as AidApplicationDocument,
        error: null
      };
    });
  },

  async updateAidApplication(id: string, data: UpdateDocumentData<AidApplicationDocument>): Promise<AppwriteResponse<AidApplicationDocument>> {
    return await handleAppwriteError(async () => {
      const application = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.AID_APPLICATIONS,
        id,
        data
      );
      return {
        data: application as unknown as AidApplicationDocument,
        error: null
      };
    });
  },

  async deleteAidApplication(id: string): Promise<AppwriteResponse<void>> {
    return await handleAppwriteError(async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.AID_APPLICATIONS, id);
      return {
        data: null,
        error: null
      };
    });
  },

  async updateStage(id: string, stage: AidApplicationDocument['stage']): Promise<AppwriteResponse<AidApplicationDocument>> {
    return this.updateAidApplication(id, { stage });
  }
};