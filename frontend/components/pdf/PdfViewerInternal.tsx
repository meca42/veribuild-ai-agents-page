'use client';

import { useMemo } from 'react';
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfViewerInternal({ fileUrl }: { fileUrl: string }) {
  if (typeof window === 'undefined') return null;

  const plugin = useMemo(() => defaultLayoutPlugin(), []);
  if (!fileUrl) return null;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
      <Viewer key={fileUrl} fileUrl={fileUrl} plugins={[plugin]} />
    </div>
  );
}
