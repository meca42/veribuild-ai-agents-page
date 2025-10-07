'use client';
import { Suspense, lazy } from 'react';

const PdfViewerInternal = lazy(() => import('./PdfViewerInternal'));

interface PdfViewerProps {
  fileUrl: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  if (!fileUrl) {
    return (
      <div className="h-full w-full min-h-[480px] flex items-center justify-center">
        <p className="text-sm text-neutral-500">No file to display</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{height: 480, display: 'grid', placeItems: 'center'}}>Loading PDF…</div>}>
      <PdfViewerInternal fileUrl={fileUrl} />
    </Suspense>
  );
}
