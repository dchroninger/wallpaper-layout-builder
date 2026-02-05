import { useCallback, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { SnapEdge } from '../types';
import {
  findSnapTarget,
  getConstrainedPosition,
  shouldDetach,
  type SnapTarget,
  type Rect,
} from '../utils/geometry';

interface ActiveSnap {
  targetId: string;
  edge: SnapEdge;
  targetEdge: SnapEdge;
  edgePosition: number;
  edgeStart: number;
  edgeEnd: number;
}

export function useEdgeSnap() {
  const cropAreas = useAppStore((s) => s.cropAreas);
  const imageWidth = useAppStore((s) => s.imageWidth);
  const imageHeight = useAppStore((s) => s.imageHeight);
  const addSnapConnection = useAppStore((s) => s.addSnapConnection);
  const removeSnapConnection = useAppStore((s) => s.removeSnapConnection);

  const [activeSnap, setActiveSnap] = useState<ActiveSnap | null>(null);
  const [snapPreview, setSnapPreview] = useState<SnapTarget | null>(null);

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

  const checkSnap = useCallback(
    (
      draggedId: string,
      currentRect: Rect
    ): { snapped: boolean; position: { x: number; y: number } } => {
      // If already snapped, handle sliding or detachment
      if (activeSnap && activeSnap.targetId) {
        const detach = shouldDetach(
          { x: currentRect.x, y: currentRect.y },
          currentRect,
          activeSnap.edge,
          activeSnap.edgePosition
        );

        if (detach) {
          setActiveSnap(null);
          setSnapPreview(null);
          removeSnapConnection(draggedId);
          return { snapped: false, position: { x: currentRect.x, y: currentRect.y } };
        }

        // Constrain to slide along edge
        const constrained = getConstrainedPosition(
          { x: currentRect.x, y: currentRect.y },
          currentRect,
          activeSnap.edge,
          activeSnap.edgePosition,
          activeSnap.edgeStart,
          activeSnap.edgeEnd
        );

        return { snapped: true, position: constrained };
      }

      // Check for new snap target - convert percentage-based cropAreas to pixel rects
      const allRects = cropAreas.map((c) => ({
        id: c.monitorId,
        rect: toPixelRect(c),
      }));
      const target = findSnapTarget(currentRect, draggedId, allRects);

      if (target) {
        setSnapPreview(target);
        return { snapped: false, position: { x: currentRect.x, y: currentRect.y } };
      }

      setSnapPreview(null);
      return { snapped: false, position: { x: currentRect.x, y: currentRect.y } };
    },
    [cropAreas, activeSnap, removeSnapConnection, toPixelRect]
  );

  const commitSnap = useCallback(
    (draggedMonitorId: string) => {
      if (snapPreview) {
        const snap: ActiveSnap = {
          targetId: snapPreview.targetId,
          edge: snapPreview.edge,
          targetEdge: snapPreview.targetEdge,
          edgePosition: snapPreview.edgePosition,
          edgeStart: snapPreview.edgeStart,
          edgeEnd: snapPreview.edgeEnd,
        };
        setActiveSnap(snap);
        addSnapConnection({
          monitorId: draggedMonitorId,
          edge: snapPreview.edge,
          targetMonitorId: snapPreview.targetId,
          targetEdge: snapPreview.targetEdge,
        });
        setSnapPreview(null);
        return snapPreview.snapPosition;
      }
      return null;
    },
    [snapPreview, addSnapConnection]
  );

  const clearSnap = useCallback(
    (monitorId: string) => {
      setActiveSnap(null);
      setSnapPreview(null);
      removeSnapConnection(monitorId);
    },
    [removeSnapConnection]
  );

  return {
    checkSnap,
    commitSnap,
    clearSnap,
    snapPreview,
    activeSnap,
  };
}
