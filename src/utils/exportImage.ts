import type { CropArea, Monitor, ExportFormat, ExportResolution } from '../types';

export interface ExportResult {
  monitorName: string;
  blob: Blob;
  filename: string;
}

function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'png': return 'image/png';
    case 'jpg': return 'image/jpeg';
    case 'webp': return 'image/webp';
  }
}

export async function exportCropArea(
  image: HTMLImageElement,
  cropArea: CropArea,
  monitor: Monitor,
  format: ExportFormat,
  resolution: ExportResolution,
  quality: number
): Promise<ExportResult> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Convert percentages to pixel coordinates
  const cropX = cropArea.xPercent * image.naturalWidth;
  const cropY = cropArea.yPercent * image.naturalHeight;
  const cropWidth = cropArea.widthPercent * image.naturalWidth;
  const cropHeight = cropArea.heightPercent * image.naturalHeight;

  let outputWidth: number;
  let outputHeight: number;

  if (resolution === 'source') {
    outputWidth = cropWidth;
    outputHeight = cropHeight;
  } else {
    if (monitor.targetResolution) {
      outputWidth = monitor.targetResolution.width;
      outputHeight = monitor.targetResolution.height;
      // Swap if portrait
      if (monitor.isPortrait) {
        [outputWidth, outputHeight] = [outputHeight, outputWidth];
      }
    } else if (monitor.spec.type === 'pixels') {
      outputWidth = monitor.spec.width;
      outputHeight = monitor.spec.height;
      // Swap if portrait
      if (monitor.isPortrait) {
        [outputWidth, outputHeight] = [outputHeight, outputWidth];
      }
    } else {
      outputWidth = cropWidth;
      outputHeight = cropHeight;
    }
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const mimeType = getMimeType(format);
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b!),
      mimeType,
      format === 'png' ? undefined : quality / 100
    );
  });

  const sanitizedName = monitor.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${sanitizedName}.${format}`;

  return { monitorName: monitor.name, blob, filename };
}

export async function exportAllCropAreas(
  image: HTMLImageElement,
  cropAreas: CropArea[],
  monitors: Monitor[],
  format: ExportFormat,
  resolution: ExportResolution,
  quality: number
): Promise<ExportResult[]> {
  const results: ExportResult[] = [];

  for (const cropArea of cropAreas) {
    const monitor = monitors.find(m => m.id === cropArea.monitorId);
    if (!monitor) continue;

    const result = await exportCropArea(
      image,
      cropArea,
      monitor,
      format,
      resolution,
      quality
    );
    results.push(result);
  }

  return results;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(results: ExportResult[]) {
  // For simplicity, download individually. Could add JSZip for zip support.
  for (const result of results) {
    downloadBlob(result.blob, result.filename);
    await new Promise(r => setTimeout(r, 100)); // Small delay between downloads
  }
}
