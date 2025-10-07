import { useMemo } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfViewerInternal({ fileUrl }: { fileUrl: string }) {
  const plugin = useMemo(() => defaultLayoutPlugin(), []);
  
  if (typeof window === 'undefined' || !fileUrl) return null;

  const workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
      <Worker workerUrl={workerUrl}>
        <Viewer key={fileUrl} fileUrl={fileUrl} plugins={[plugin]} />
      </Worker>
    </div>
  );
}
