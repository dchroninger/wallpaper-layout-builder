import type { MonitorSpec, SnapEdge } from '../types';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Edge {
  edge: SnapEdge;
  start: number;
  end: number;
  position: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function constrainToImage(
  area: Rect,
  imageWidth: number,
  imageHeight: number
): Rect {
  const x = Math.max(0, Math.min(area.x, imageWidth - area.width));
  const y = Math.max(0, Math.min(area.y, imageHeight - area.height));
  const width = Math.min(area.width, imageWidth - x);
  const height = Math.min(area.height, imageHeight - y);
  return { x, y, width, height };
}

export function getAspectRatio(spec: MonitorSpec): number {
  return spec.width / spec.height;
}

export function calculateDimensionsFromSpec(
  spec: MonitorSpec,
  constraintDimension: 'width' | 'height',
  constraintValue: number
): { width: number; height: number } {
  const ratio = getAspectRatio(spec);
  if (constraintDimension === 'width') {
    return { width: constraintValue, height: constraintValue / ratio };
  }
  return { width: constraintValue * ratio, height: constraintValue };
}

export function calculatePPI(
  widthPx: number,
  heightPx: number,
  diagonalInches: number
): number {
  const diagonalPx = Math.sqrt(widthPx ** 2 + heightPx ** 2);
  return diagonalPx / diagonalInches;
}

export function getPhysicalWidth(widthPx: number, ppi: number): number {
  return widthPx / ppi;
}

/**
 * Calculate physical width from diagonal and aspect ratio.
 * physicalWidth = diagonal × aspectRatio / sqrt(aspectRatio² + 1)
 */
export function getPhysicalWidthFromDiagonal(diagonalInches: number, aspectRatio: number): number {
  return diagonalInches * aspectRatio / Math.sqrt(aspectRatio * aspectRatio + 1);
}

export function getEdges(rect: Rect): Edge[] {
  return [
    { edge: 'top', start: rect.x, end: rect.x + rect.width, position: rect.y },
    { edge: 'bottom', start: rect.x, end: rect.x + rect.width, position: rect.y + rect.height },
    { edge: 'left', start: rect.y, end: rect.y + rect.height, position: rect.x },
    { edge: 'right', start: rect.y, end: rect.y + rect.height, position: rect.x + rect.width },
  ];
}

export function getOppositeEdge(edge: SnapEdge): SnapEdge {
  const opposites: Record<SnapEdge, SnapEdge> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  return opposites[edge];
}

export function isHorizontalEdge(edge: SnapEdge): boolean {
  return edge === 'top' || edge === 'bottom';
}

export interface SnapTarget {
  targetId: string;
  edge: SnapEdge;
  targetEdge: SnapEdge;
  snapPosition: { x: number; y: number };
  edgePosition: number;
  edgeStart: number;
  edgeEnd: number;
}

export function findSnapTarget(
  draggedRect: Rect,
  draggedId: string,
  allRects: Array<{ id: string; rect: Rect }>,
  threshold: number = 20
): SnapTarget | null {
  const draggedEdges = getEdges(draggedRect);
  let closest: SnapTarget | null = null;
  let closestDist = threshold;

  for (const { id, rect } of allRects) {
    if (id === draggedId) continue;
    const targetEdges = getEdges(rect);

    for (const de of draggedEdges) {
      for (const te of targetEdges) {
        if (getOppositeEdge(de.edge) !== te.edge) continue;

        const dist = Math.abs(de.position - te.position);
        if (dist >= closestDist) continue;

        const rangeOverlap =
          Math.max(de.start, te.start) < Math.min(de.end, te.end);
        if (!rangeOverlap) continue;

        closestDist = dist;
        let snapX = draggedRect.x;
        let snapY = draggedRect.y;

        if (de.edge === 'left') snapX = te.position;
        else if (de.edge === 'right') snapX = te.position - draggedRect.width;
        else if (de.edge === 'top') snapY = te.position;
        else if (de.edge === 'bottom') snapY = te.position - draggedRect.height;

        closest = {
          targetId: id,
          edge: de.edge,
          targetEdge: te.edge,
          snapPosition: { x: snapX, y: snapY },
          edgePosition: te.position,
          edgeStart: te.start,
          edgeEnd: te.end,
        };
      }
    }
  }

  return closest;
}

export function getConstrainedPosition(
  currentPos: { x: number; y: number },
  rect: Rect,
  connectedEdge: SnapEdge,
  targetEdgePos: number,
  targetEdgeStart: number,
  targetEdgeEnd: number
): { x: number; y: number } {
  let { x, y } = currentPos;

  if (isHorizontalEdge(connectedEdge)) {
    // Lock Y, slide X
    if (connectedEdge === 'top') y = targetEdgePos;
    else y = targetEdgePos - rect.height;
    // Constrain X to overlap range
    const minX = targetEdgeStart - rect.width + 1;
    const maxX = targetEdgeEnd - 1;
    x = Math.max(minX, Math.min(x, maxX));
  } else {
    // Lock X, slide Y
    if (connectedEdge === 'left') x = targetEdgePos;
    else x = targetEdgePos - rect.width;
    // Constrain Y to overlap range
    const minY = targetEdgeStart - rect.height + 1;
    const maxY = targetEdgeEnd - 1;
    y = Math.max(minY, Math.min(y, maxY));
  }

  return { x, y };
}

export function shouldDetach(
  currentPos: { x: number; y: number },
  rect: Rect,
  connectedEdge: SnapEdge,
  targetEdgePos: number,
  detachThreshold: number = 40
): boolean {
  let distance: number;

  if (connectedEdge === 'top') {
    distance = Math.abs(currentPos.y - targetEdgePos);
  } else if (connectedEdge === 'bottom') {
    distance = Math.abs(currentPos.y + rect.height - targetEdgePos);
  } else if (connectedEdge === 'left') {
    distance = Math.abs(currentPos.x - targetEdgePos);
  } else {
    distance = Math.abs(currentPos.x + rect.width - targetEdgePos);
  }

  return distance > detachThreshold;
}
