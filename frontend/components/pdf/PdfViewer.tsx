'use client';
import { useEffect, useState } from 'react';

interface PdfViewerProps {
  fileUrl: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [PdfComponent, setPdfComponent] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import('./PdfViewerInternal').then((mod) => {
      setPdfComponent(() => mod.default);
    });
  }, []);

  if (!fileUrl) {
    return (
      <div className="h-full w-full min-h-[480px] flex items-center justify-center">
        <p className="text-sm text-neutral-500">No file to display</p>
      </div>
    );
  }

  if (!isClient || !PdfComponent) {
    return (
      <div className="h-full w-full min-h-[480px] flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-neutral-500">Loading PDF viewer…</p>
        </div>
      </div>
    );
  }

  return <PdfComponent fileUrl={fileUrl} />;
}
