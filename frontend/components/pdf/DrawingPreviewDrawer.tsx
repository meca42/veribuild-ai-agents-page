import { useState, useEffect } from 'react';
import { Maximize2, Download, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import PdfViewer from '@/components/pdf/PdfViewer';
import { api } from '@/lib/api';

interface DrawingPreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  versionId?: string;
  drawingNumber?: string;
  versionNumber?: number;
}

export default function DrawingPreviewDrawer({
  open,
  onClose,
  versionId,
  drawingNumber,
  versionNumber,
}: DrawingPreviewDrawerProps) {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchUrl() {
      if (!open || !versionId) {
        setSignedUrl('');
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = await api.getDrawingVersionFileUrl(versionId, 3600); // 1 hour expiry
        if (!cancelled) {
          setSignedUrl(url);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load drawing preview:', err);
          setError(err.message || 'Failed to load drawing preview');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUrl();

    return () => {
      cancelled = true;
    };
  }, [open, versionId]);

  const handleDownload = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const title = drawingNumber && versionNumber !== undefined
    ? `${drawingNumber} - v${versionNumber}`
    : 'Drawing Preview';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      size={isFullscreen ? 'full' : 'xl'}
    >
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={!signedUrl || isLoading}
            >
              <Download size={16} />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize2 size={16} />
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X size={16} />
            Close
          </Button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="h-full flex items-center justify-center bg-neutral-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-neutral-500">Loading preview…</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="h-full flex items-center justify-center bg-neutral-50">
              <div className="text-center max-w-md">
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {signedUrl && !isLoading && !error && (
            <div className="h-full">
              <PdfViewer fileUrl={signedUrl} />
            </div>
          )}

          {!signedUrl && !isLoading && !error && (
            <div className="h-full flex items-center justify-center bg-neutral-50">
              <p className="text-sm text-neutral-500">No drawing selected</p>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
