import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const src = resolve('node_modules/pdfjs-dist/build/pdf.worker.min.js');
const destDir = resolve('public');
mkdirSync(destDir, { recursive: true });
copyFileSync(src, resolve(destDir, 'pdf.worker.min.js'));
console.log('Copied pdf.worker.min.js to /public');
