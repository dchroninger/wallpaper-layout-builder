import { Line } from 'react-konva';
import type { SnapTarget } from '../../utils/geometry';

interface SnapGuideProps {
  snapPreview: SnapTarget | null;
}

export function SnapGuide({ snapPreview }: SnapGuideProps) {
  if (!snapPreview) return null;

  const { edge, edgePosition, edgeStart, edgeEnd } = snapPreview;
  const isHorizontal = edge === 'top' || edge === 'bottom';

  const points = isHorizontal
    ? [edgeStart, edgePosition, edgeEnd, edgePosition]
    : [edgePosition, edgeStart, edgePosition, edgeEnd];

  return (
    <Line
      points={points}
      stroke="#3b82f6"
      strokeWidth={3}
      dash={[8, 4]}
      listening={false}
    />
  );
}
