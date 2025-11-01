import { databases, storage } from '@/lib/appwrite/client';
import { DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS } from '@/lib/appwrite/config';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';
import { Query } from 'appwrite';

/**
 * Generic API client for Appwrite operations
 */

/**
 * Fetch paginated documents from a collection
 */
export async function fetchDocuments<T>(
  collectionId: string,
  params?: QueryParams
): Promise<ApiResponse<PaginatedResponse<T>>> {
  try {
    const queries = [];
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    // Pagination
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));

    // Search
    if (params?.search) {
      queries.push(Query.search('name', params.search));
    }

    // Sorting
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? Query.orderDesc : Query.orderAsc;
      queries.push(sortOrder(params.sortBy));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      queries
    );

    return {
      success: true,
      data: {
        items: response.documents as unknown as T[],
        total: response.total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(response.total / limit),
      },
    };
  } catch (error: any) {
    console.error('Fetch documents error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch documents',
    };
  }
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocument<T>(
  collectionId: string,
  documentId: string
): Promise<ApiResponse<T>> {
  try {
    const document = await databases.getDocument(
      DATABASE_ID,
      collectionId,
      documentId
    );

    return {
      success: true,
      data: document as unknown as T,
    };
  } catch (error: any) {
    console.error('Fetch document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch document',
    };
  }
}

/**
 * Create a new document
 */
export async function createDocument<T>(
  collectionId: string,
  data: Partial<T>,
  documentId?: string
): Promise<ApiResponse<T>> {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      collectionId,
      documentId || 'unique()',
      data
    );

    return {
      success: true,
      data: document as unknown as T,
      message: 'Document created successfully',
    };
  } catch (error: any) {
    console.error('Create document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create document',
    };
  }
}

/**
 * Update an existing document
 */
export async function updateDocument<T>(
  collectionId: string,
  documentId: string,
  data: Partial<T>
): Promise<ApiResponse<T>> {
  try {
    const document = await databases.updateDocument(
      DATABASE_ID,
      collectionId,
      documentId,
      data
    );

    return {
      success: true,
      data: document as unknown as T,
      message: 'Document updated successfully',
    };
  } catch (error: any) {
    console.error('Update document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update document',
    };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionId: string,
  documentId: string
): Promise<ApiResponse<void>> {
  try {
    await databases.deleteDocument(DATABASE_ID, collectionId, documentId);

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  } catch (error: any) {
    console.error('Delete document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete document',
    };
  }
}

/**
 * Upload a file to storage
 */
export async function uploadFile(
  bucketId: string,
  file: File,
  fileId?: string
): Promise<ApiResponse<{ id: string; url: string }>> {
  try {
    const response = await storage.createFile(
      bucketId,
      fileId || 'unique()',
      file
    );

    const url = storage.getFileView(bucketId, response.$id);

    return {
      success: true,
      data: {
        id: response.$id,
        url: url.toString(),
      },
      message: 'File uploaded successfully',
    };
  } catch (error: any) {
    console.error('Upload file error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucketId: string,
  fileId: string
): Promise<ApiResponse<void>> {
  try {
    await storage.deleteFile(bucketId, fileId);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error: any) {
    console.error('Delete file error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    };
  }
}

/**
 * Get file preview URL
 */
export function getFilePreview(bucketId: string, fileId: string): string {
  return storage.getFilePreview(bucketId, fileId).toString();
}

/**
 * Get file download URL
 */
export function getFileDownload(bucketId: string, fileId: string): string {
  return storage.getFileDownload(bucketId, fileId).toString();
}
