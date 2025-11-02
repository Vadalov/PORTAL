import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import { STORAGE_BUCKETS } from '@/lib/appwrite/config';
import logger from '@/lib/logger';

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

    const response = await api.storage.uploadFile({ file, bucketId });
    if (response.error || !response.data) {
      return NextResponse.json(
        { success: false, error: response.error || 'Yükleme başarısız' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: response.data, message: 'Dosya yüklendi' },
      { status: 201 }
    );
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
