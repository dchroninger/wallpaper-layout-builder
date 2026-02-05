import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { snapToGrid } from '../utils/geometry';

export function useGridSnap() {
  const gridSize = useAppStore((s) => s.gridSize);
  const gridEnabled = useAppStore((s) => s.gridEnabled);

  const snap = useCallback(
    (value: number): number => {
      if (!gridEnabled) return value;
      return snapToGrid(value, gridSize);
    },
    [gridSize, gridEnabled]
  );

  const snapPosition = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      if (!gridEnabled) return { x, y };
      return {
        x: snapToGrid(x, gridSize),
        y: snapToGrid(y, gridSize),
      };
    },
    [gridSize, gridEnabled]
  );

  return { snap, snapPosition, gridSize, gridEnabled };
}
