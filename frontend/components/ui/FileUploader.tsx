import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { Button } from './Button';

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface FileUploaderProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  onUpload?: (files: Array<{ name: string; size: number; type: string }>) => Promise<void>;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const FileUploader = ({
  multiple = false,
  accept,
  maxSize = 10 * 1024 * 1024,
  onUpload,
  className,
}: FileUploaderProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | undefined => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return mimeType === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`;
      }
    }

    return undefined;
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map((file) => {
      const error = validateFile(file);
      return {
        id: Math.random().toString(36).slice(2, 11),
        name: file.name,
        size: file.size,
        type: file.type,
        status: error ? ('error' as const) : ('pending' as const),
        error,
      };
    });

    setFiles((prev) => (multiple ? [...prev, ...newFiles] : newFiles));

    const validFiles = newFiles.filter((f) => f.status === 'pending');
    if (validFiles.length > 0 && onUpload) {
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (filesToUpload: UploadFile[]) => {
    for (const file of filesToUpload) {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: 'uploading' as const, progress: 0 } : f))
        );

        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }

        if (onUpload) {
          await onUpload([{ name: file.name, size: file.size, type: file.type }]);
        }

        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: 'success' as const, progress: 100 } : f))
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        );
      }
    }
  };

  const retryUpload = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file && file.status === 'error') {
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: 'pending' as const, error: undefined } : f)));
      uploadFiles([{ ...file, status: 'pending', error: undefined }]);
    }
  };

  const cancelUpload = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50'
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="sr-only"
          aria-label="File input"
        />
        <Upload className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600 mb-4" aria-hidden="true" />
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {accept ? `Accepted formats: ${accept}` : 'Any file type'}
          {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Uploaded files">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              role="listitem"
            >
              <File className="h-8 w-8 text-neutral-400 dark:text-neutral-600 flex-shrink-0" aria-hidden="true" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>

                {file.status === 'uploading' && file.progress !== undefined && (
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                      role="progressbar"
                      aria-valuenow={file.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Upload progress"
                    />
                  </div>
                )}

                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {file.status === 'uploading' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" aria-label="Uploading" />}
                {file.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" aria-label="Upload successful" />}
                {file.status === 'error' && (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-label="Upload failed" />
                    <Button variant="ghost" size="sm" onClick={() => retryUpload(file.id)} aria-label="Retry upload">
                      Retry
                    </Button>
                  </>
                )}
                <button
                  onClick={() => cancelUpload(file.id)}
                  className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
