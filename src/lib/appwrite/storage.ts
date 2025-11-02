/**
 * Storage Buckets Helper Functions
 * Provides utilities for file upload, download, and management
 */

import { storage, handleAppwriteError } from '@/lib/appwrite/client';
import { STORAGE_BUCKETS } from '@/lib/appwrite/config';
import { ID, Permission, Role, ImageFormat } from 'appwrite';
import type { FileUpload, UploadedFile } from '@/types/collections';

/**
 * Upload file to specified bucket
 */
export async function uploadFile(
  file: File,
  bucketId: string,
  permissions?: string[]
): Promise<UploadedFile> {
  return await handleAppwriteError(async () => {
    const uploadedFile = await storage.createFile(
      bucketId,
      ID.unique(),
      file,
      permissions || [Permission.read(Role.any())]
    );
    return uploadedFile as UploadedFile;
  });
}

/**
 * Upload document (ID cards, invoices, etc.)
 */
export async function uploadDocument(file: File): Promise<UploadedFile> {
  return await uploadFile(file, STORAGE_BUCKETS.DOCUMENTS);
}

/**
 * Upload receipt
 */
export async function uploadReceipt(file: File): Promise<UploadedFile> {
  return await uploadFile(file, STORAGE_BUCKETS.RECEIPTS);
}

/**
 * Upload photo/image
 */
export async function uploadPhoto(file: File): Promise<UploadedFile> {
  return await uploadFile(file, STORAGE_BUCKETS.PHOTOS);
}

/**
 * Upload report/document
 */
export async function uploadReport(file: File): Promise<UploadedFile> {
  return await uploadFile(file, STORAGE_BUCKETS.REPORTS, [
    Permission.read(Role.team('members')),
    Permission.create(Role.team('admins')),
  ]);
}

/**
 * Get file download URL
 */
export function getFileDownloadUrl(bucketId: string, fileId: string): string {
  return storage.getFileDownload(bucketId, fileId);
}

/**
 * Get file preview URL with optional transformations
 */
export function getFilePreviewUrl(
  bucketId: string,
  fileId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpg' | 'png' | 'webp';
  }
): string {
  return storage.getFilePreview(
    bucketId,
    fileId,
    options?.width,
    options?.height,
    undefined, // gravity
    options?.quality,
    undefined, // borderWidth
    undefined, // borderColor
    undefined, // borderRadius
    undefined, // opacity
    undefined, // rotation
    undefined, // background
    options?.format ? ImageFormat[options.format as keyof typeof ImageFormat] : undefined
  );
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucketId: string, fileId: string): Promise<void> {
  await handleAppwriteError(async () => {
    await storage.deleteFile(bucketId, fileId);
  });
}

/**
 * Get file information
 */
export async function getFileInfo(bucketId: string, fileId: string): Promise<UploadedFile> {
  return await handleAppwriteError(async () => {
    const file = await storage.getFile(bucketId, fileId);
    return file as UploadedFile;
  });
}

/**
 * List files in bucket
 */
export async function listFiles(
  bucketId: string,
  queries?: string[]
): Promise<{ files: UploadedFile[]; total: number }> {
  return await handleAppwriteError(async () => {
    const response = await storage.listFiles(bucketId, queries);
    return {
      files: response.files as UploadedFile[],
      total: response.total,
    };
  });
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options || {}; // 10MB default

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Dosya boyutu ${Math.round(maxSize / 1024 / 1024)}MB'dan büyük olamaz`,
    };
  }

  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Desteklenmeyen dosya türü. İzin verilen türler: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * Check if file is a document
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  return documentTypes.includes(file.type);
}

/**
 * Storage bucket utilities
 */
export const storageUtils = {
  uploadFile,
  uploadDocument,
  uploadReceipt,
  uploadPhoto,
  uploadReport,
  getFileDownloadUrl,
  getFilePreviewUrl,
  deleteFile,
  getFileInfo,
  listFiles,
  validateFile,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isPdfFile,
  isDocumentFile,
};
