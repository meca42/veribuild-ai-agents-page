import { FileUploader } from '@/components/ui/FileUploader';
import { useToast } from '@/components/ui/Toast';

export const FileUploaderDemo = () => {
  const { addToast } = useToast();

  const handleUpload = async (files: Array<{ name: string; size: number; type: string }>) => {
    console.log('Uploading files:', files);

    if (Math.random() > 0.7) {
      throw new Error('Simulated network error');
    }

    addToast(`Successfully uploaded ${files.length} file(s)`, 'success');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Basic File Uploader</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Features: drag & drop, multiple files, progress tracking, cancel/retry, validation
        </p>
        <FileUploader multiple onUpload={handleUpload} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Single File with Type Restriction</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Accepts only images (JPEG, PNG, GIF, WebP)
        </p>
        <FileUploader
          accept="image/jpeg,image/png,image/gif,image/webp"
          onUpload={handleUpload}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">PDF Documents Only (Max 5MB)</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Try uploading a file larger than 5MB to see validation in action
        </p>
        <FileUploader
          multiple
          accept=".pdf,application/pdf"
          maxSize={5 * 1024 * 1024}
          onUpload={handleUpload}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Various File Types</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Accepts images, PDFs, and documents
        </p>
        <FileUploader
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          maxSize={50 * 1024 * 1024}
          onUpload={handleUpload}
        />
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Features Demonstrated:</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Drag and drop support with visual feedback</li>
          <li>Multiple file upload support</li>
          <li>File type validation (accept prop)</li>
          <li>File size validation (maxSize prop)</li>
          <li>Upload progress tracking with visual progress bar</li>
          <li>Error handling with retry functionality</li>
          <li>Cancel upload functionality</li>
          <li>Simulated network delay and random failure (70% success rate for demo)</li>
          <li>Accessible keyboard navigation (Enter/Space to open file picker)</li>
          <li>Screen reader support with proper ARIA labels</li>
        </ul>
      </div>
    </div>
  );
};
