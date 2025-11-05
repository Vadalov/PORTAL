import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { getCurrentUserId } from '@/lib/auth/get-user';

// Storage buckets (now using simple string identifiers)
const STORAGE_BUCKETS = {
  REPORTS: 'reports',
  RECEIPTS: 'receipts',
  AVATARS: 'avatars',
} as const;

/**
 * POST /api/storage/upload
 * Accepts multipart/form-data with fields:
 * - file: File
 * - bucket: optional bucketId (default: receipts)
 */
async function uploadHandler(request: NextRequest) {
  let file: File | null = null;
  let bucketId: string = STORAGE_BUCKETS.REPORTS;

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: 'Geçersiz içerik türü' }, { status: 400 });
    }

    const formData = await request.formData();
    file = formData.get('file') as File | null;
    bucketId = (formData.get('bucket') as string | null) || STORAGE_BUCKETS.REPORTS;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya zorunludur' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu çok büyük (maksimum 10MB)' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Desteklenmeyen dosya türü' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const userId = await getCurrentUserId(request);

    // Upload to Convex fileStorage
    const convexHttp = getConvexHttp();

    try {
      // Step 1: Generate upload URL from Convex
      const uploadUrl = await convexHttp.action(api.storage.generateUploadUrl);

      // Step 2: Upload file directly to Convex fileStorage using the signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: await file.arrayBuffer(),
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload to Convex failed: ${uploadResponse.statusText}`);
      }

      // Step 3: Get the storage ID from the response
      // Convex fileStorage returns the storage ID (Id<"_storage">) in the response as text
      const storageIdText = await uploadResponse.text();
      
      if (!storageIdText) {
        throw new Error('Failed to get storage ID from Convex');
      }

      // The storage ID is returned as a string, but we need to use it as Id<"_storage">
      // Convex will validate this when we use it in the mutation
      const storageId = storageIdText as any; // Type assertion needed for Convex ID

      // Step 4: Store file metadata in Convex database
      const fileMetadataId = await convexHttp.mutation(api.storage.storeFileMetadata, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: bucketId,
        storageId, // Convex fileStorage ID
        uploadedBy: userId || undefined,
      });

      // Step 5: Get the file URL for accessing the file
      const fileUrl = await convexHttp.query(api.storage.getFileUrl, {
        storageId,
      });

      logger.info('File upload successful', {
        fileMetadataId,
        storageId,
        bucketId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: userId,
      });

      return NextResponse.json({
        success: true,
        data: {
          fileId: fileMetadataId,
          storageId,
          fileUrl: fileUrl || `/api/storage/files/${fileMetadataId}`,
          bucketId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
        message: 'Dosya başarıyla yüklendi',
      });
    } catch (uploadError) {
      logger.error('File storage error', uploadError, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      throw uploadError;
    }
  } catch (error: unknown) {
    logger.error('File upload error', error, {
      endpoint: '/api/storage/upload',
      method: 'POST',
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      bucketId,
    });
    return NextResponse.json(
      { success: false, error: 'Yükleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

