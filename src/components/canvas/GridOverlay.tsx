import type { ReactElement } from 'react';
import { Line } from 'react-konva';
import { useAppStore } from '../../store/appStore';

interface GridOverlayProps {
  width: number;
  height: number;
}

export function GridOverlay({ width, height }: GridOverlayProps) {
  const gridSize = useAppStore((s) => s.gridSize);
  const gridEnabled = useAppStore((s) => s.gridEnabled);

  if (!gridEnabled) return null;

  const lines: ReactElement[] = [];

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}
