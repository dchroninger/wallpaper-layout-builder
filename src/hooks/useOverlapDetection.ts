import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { rectsOverlap } from '../utils/geometry';
import type { Rect } from '../utils/geometry';

export function useOverlapDetection() {
  const cropAreas = useAppStore((s) => s.cropAreas);
  const imageWidth = useAppStore((s) => s.imageWidth);
  const imageHeight = useAppStore((s) => s.imageHeight);

  // Convert crop area percentages to pixel rect
  const toPixelRect = useCallback(
    (cropArea: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }): Rect => ({
      x: cropArea.xPercent * imageWidth,
      y: cropArea.yPercent * imageHeight,
      width: cropArea.widthPercent * imageWidth,
      height: cropArea.heightPercent * imageHeight,
    }),
    [imageWidth, imageHeight]
  );

  const wouldOverlap = useCallback(
    (areaId: string, newPosition: Partial<Rect>): boolean => {
      const area = cropAreas.find((a) => a.id === areaId);
      if (!area) return false;

      const pixelRect = toPixelRect(area);
      const testRect: Rect = {
        x: newPosition.x ?? pixelRect.x,
        y: newPosition.y ?? pixelRect.y,
        width: newPosition.width ?? pixelRect.width,
        height: newPosition.height ?? pixelRect.height,
      };

      // Check against all other areas
      for (const other of cropAreas) {
        if (other.id === areaId) continue;
        const otherRect = toPixelRect(other);
        if (rectsOverlap(testRect, otherRect)) {
          return true;
        }
      }
      return false;
    },
    [cropAreas, toPixelRect]
  );

  const getValidPosition = useCallback(
    (
      areaId: string,
      desiredX: number,
      desiredY: number,
      width: number,
      height: number
    ): { x: number; y: number } => {
      const area = cropAreas.find((a) => a.id === areaId);
      if (!area) return { x: desiredX, y: desiredY };

      const testRect: Rect = {
        x: desiredX,
        y: desiredY,
        width,
        height,
      };

      // Check if desired position is valid
      let overlaps = false;
      for (const other of cropAreas) {
        if (other.id === areaId) continue;
        const otherRect = toPixelRect(other);
        if (rectsOverlap(testRect, otherRect)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        return { x: desiredX, y: desiredY };
      }

      // Return original position if overlap detected
      const pixelRect = toPixelRect(area);
      return { x: pixelRect.x, y: pixelRect.y };
    },
    [cropAreas, toPixelRect]
  );

  return { wouldOverlap, getValidPosition };
}
