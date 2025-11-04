'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Image, File, Loader2, Eye, X as XIcon } from 'lucide-react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { validateFile } from '@/lib/sanitization';

interface FileUploadProps {
  onFileSelect: (file: File | null, sanitizedFilename?: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  preview: string;
}

// Preview Modal Component - XSS Safe Alternative
function PreviewModal({ isOpen, onClose, fileName, preview }: PreviewModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">{fileName}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} type="button">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 relative w-full aspect-auto">
          <NextImage
            src={preview}
            alt={`Preview of ${fileName}`}
            width={800}
            height={600}
            className="max-w-full h-auto rounded-lg"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

export function FileUpload({
  onFileSelect,
  accept = '*',
  maxSize = 10,
  placeholder = 'Dosya seçin veya sürükleyin',
  className,
  disabled = false,
  allowedTypes,
  allowedExtensions,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, []);

  const validateFileUpload = (file: File): { valid: boolean; sanitizedFilename?: string } => {
    // Use advanced validation from sanitization library
    const validation = validateFile(file, {
      maxSize: maxSize * 1024 * 1024,
      allowedTypes,
      allowedExtensions,
    });

    if (!validation.valid) {
      setError(validation.error || 'Geçersiz dosya');
      return { valid: false };
    }

    // Additional security checks
    // Check for double extensions (e.g., file.pdf.exe)
    const parts = file.name.split('.');
    if (parts.length > 2) {
      setError('Dosya adı birden fazla uzantı içeremez');
      return { valid: false };
    }

    // Check for suspiciously long filenames
    if (file.name.length > 255) {
      setError('Dosya adı çok uzun');
      return { valid: false };
    }

    setError(null);
    return { valid: true, sanitizedFilename: validation.sanitizedFilename };
  };

  const createPreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const simulateUpload = async (_file: File) => {
    // _file parameter marked as unused
    setUploading(true);
    setUploadProgress(0);

    // Clear any existing interval
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
    }

    // Simulate upload progress
    uploadIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          if (uploadIntervalRef.current) {
            clearInterval(uploadIntervalRef.current);
          }
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const validation = validateFileUpload(file);
      if (validation.valid) {
        setSelectedFile(file);
        createPreview(file);
        simulateUpload(file);
        onFileSelect(file, validation.sanitizedFilename);
      }
    } else {
      setSelectedFile(null);
      setPreview(null);
      setUploading(false);
      setUploadProgress(0);
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
      onFileSelect(null);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploading(false);
    setUploadProgress(0);
    setShowPreviewModal(false);
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
    }
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openPreview = () => {
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-primary" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-destructive" />;
    } else {
      return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <>
      <div className={cn('space-y-2', className)}>
        <Label>Dosya Yükleme</Label>

        {/* File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            dragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive bg-destructive/10'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                {preview ? (
                  <div className="relative group w-16 h-16">
                    <NextImage
                      src={preview}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg border"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview();
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  getFileIcon(selectedFile)
                )}
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  {uploading && (
                    <div className="mt-2 space-y-1">
                      <Progress value={uploadProgress} className="h-1" />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Yükleniyor... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="text-destructive hover:text-destructive/80"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{placeholder}</p>
                <p className="text-xs text-muted-foreground">
                  Maksimum {maxSize}MB • Desteklenen formatlar: {accept}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Preview Modal - XSS Safe */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={closePreview}
        fileName={selectedFile?.name || ''}
        preview={preview || ''}
      />
    </>
  );
}
