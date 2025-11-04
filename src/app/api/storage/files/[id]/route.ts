import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import logger from '@/lib/logger';

/**
 * GET /api/storage/files/[id]
 * Get file metadata and download URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convexHttp = getConvexHttp();

    // Get file metadata
    const fileMetadata = await convexHttp.query(api.storage.getFileMetadata, {
      fileId: id as Id<'files'>,
    });

    if (!fileMetadata) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    // Get file URL from Convex fileStorage
    const fileUrl = await convexHttp.query(api.storage.getFileUrl, {
      storageId: fileMetadata.storageId,
    });

    // Check if requesting download or preview
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    // If download is requested, redirect to the file URL
    if (download && fileUrl) {
      return NextResponse.redirect(fileUrl);
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId: fileMetadata._id,
        fileName: fileMetadata.fileName,
        fileSize: fileMetadata.fileSize,
        fileType: fileMetadata.fileType,
        bucket: fileMetadata.bucket,
        storageId: fileMetadata.storageId,
        uploadedAt: fileMetadata.uploadedAt,
        fileUrl: fileUrl || `/api/storage/files/${id}/preview`,
      },
    });
  } catch (error: unknown) {
    logger.error('Get file error', error, {
      endpoint: '/api/storage/files/[id]',
      method: 'GET',
    });

    return NextResponse.json(
      { success: false, error: 'Dosya alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/storage/files/[id]/download
 * Download file (redirects to actual file or serves file)
 */
export async function downloadHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convexHttp = getConvexHttp();

    // Get file metadata
    const fileMetadata = await convexHttp.query(api.storage.getFileMetadata, {
      fileId: id as Id<'files'>,
    });

    if (!fileMetadata) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    // Get file URL from Convex fileStorage and redirect
    const fileUrl = await convexHttp.query(api.storage.getFileUrl, {
      storageId: fileMetadata.storageId,
    });

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Dosya URL\'si alınamadı' },
        { status: 404 }
      );
    }

    // Redirect to the actual file URL
    return NextResponse.redirect(fileUrl);
  } catch (error: unknown) {
    logger.error('Download file error', error, {
      endpoint: '/api/storage/files/[id]/download',
      method: 'GET',
    });

    return NextResponse.json(
      { success: false, error: 'Dosya indirilemedi' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/storage/files/[id]/preview
 * Preview file (for images, PDFs, etc.)
 */
export async function previewHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convexHttp = getConvexHttp();

    // Get file metadata
    const fileMetadata = await convexHttp.query(api.storage.getFileMetadata, {
      fileId: id as Id<'files'>,
    });

    if (!fileMetadata) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    // Get file URL from Convex fileStorage
    const fileUrl = await convexHttp.query(api.storage.getFileUrl, {
      storageId: fileMetadata.storageId,
    });

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Dosya URL\'si alınamadı' },
        { status: 404 }
      );
    }

    // For preview, redirect to the file URL (browser will handle display)
    // For images and PDFs, browser will display them inline
    return NextResponse.redirect(fileUrl);
  } catch (error: unknown) {
    logger.error('Preview file error', error, {
      endpoint: '/api/storage/files/[id]/preview',
      method: 'GET',
    });

    return NextResponse.json(
      { success: false, error: 'Dosya önizlenemedi' },
      { status: 500 }
    );
  }
}

