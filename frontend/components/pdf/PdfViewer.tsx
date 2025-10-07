import { useMemo } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

interface PdfViewerProps {
  fileUrl: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  const defaultLayoutPluginInstance = useMemo(() => defaultLayoutPlugin(), []);

  if (!fileUrl) {
    return (
      <div className="h-full w-full min-h-[480px] flex items-center justify-center">
        <p className="text-sm text-neutral-500">No file to display</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', minHeight: 480 }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  );
}
