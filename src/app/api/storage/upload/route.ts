import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';

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

    // TODO: Implement file upload to Convex file storage or external storage (S3, Cloudinary, etc.)
    // For now, return a mock file ID
    // In production, you would:
    // 1. Upload file to Convex file storage, or
    // 2. Upload to external storage (S3, Cloudinary, etc.) and store metadata in Convex
    
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fileUrl = `/api/storage/files/${fileId}`; // Mock URL

    logger.info('File upload', {
      fileId,
      bucketId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        fileUrl,
        bucketId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      message: 'Dosya başarıyla yüklendi',
    });
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

export const POST = withCsrfProtection(uploadHandler);
