import { useRef, useEffect } from 'react';
import { Rect, Transformer, Group, Text } from 'react-konva';
import Konva from 'konva';
import type { CropArea as CropAreaType, Monitor } from '../../types';
import { useAppStore } from '../../store/appStore';
import { useGridSnap } from '../../hooks/useGridSnap';
import { useOverlapDetection } from '../../hooks/useOverlapDetection';
import { useEdgeSnap } from '../../hooks/useEdgeSnap';
import { getAspectRatio, constrainToImage } from '../../utils/geometry';

interface CropAreaProps {
  cropArea: CropAreaType;
  monitor: Monitor;
  isSelected: boolean;
  onSelect: () => void;
  imageWidth: number;
  imageHeight: number;
  onSnapPreviewChange?: (preview: import('../../utils/geometry').SnapTarget | null) => void;
}

// Convert percentage to pixel coordinates
function toPixels(cropArea: CropAreaType, imageWidth: number, imageHeight: number) {
  return {
    x: cropArea.xPercent * imageWidth,
    y: cropArea.yPercent * imageHeight,
    width: cropArea.widthPercent * imageWidth,
    height: cropArea.heightPercent * imageHeight,
  };
}

// Convert pixel coordinates to percentages
function toPercent(
  x: number,
  y: number,
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number
) {
  return {
    xPercent: x / imageWidth,
    yPercent: y / imageHeight,
    widthPercent: width / imageWidth,
    heightPercent: height / imageHeight,
  };
}

export function CropArea({
  cropArea,
  monitor,
  isSelected,
  onSelect,
  imageWidth,
  imageHeight,
  onSnapPreviewChange,
}: CropAreaProps) {
  const rectRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const updateCropArea = useAppStore((s) => s.updateCropArea);
  const scaleCropAreasByDiagonal = useAppStore((s) => s.scaleCropAreasByDiagonal);
  const { snapPosition } = useGridSnap();
  const { wouldOverlap, getValidPosition } = useOverlapDetection();
  const { checkSnap, commitSnap, snapPreview } = useEdgeSnap();

  // Get aspect ratio (swap if portrait)
  let aspectRatio = getAspectRatio(monitor.spec);
  if (monitor.isPortrait) {
    aspectRatio = 1 / aspectRatio;
  }

  // Convert to pixel coordinates for rendering
  const pixelCoords = toPixels(cropArea, imageWidth, imageHeight);

  useEffect(() => {
    onSnapPreviewChange?.(snapPreview);
  }, [snapPreview, onSnapPreviewChange]);

  useEffect(() => {
    if (isSelected && rectRef.current && transformerRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    let { x, y } = snapPosition(node.x(), node.y());

    // Check edge snapping
    const currentRect = { x, y, width: pixelCoords.width, height: pixelCoords.height };
    const snapResult = checkSnap(monitor.id, currentRect);
    if (snapResult.snapped) {
      x = snapResult.position.x;
      y = snapResult.position.y;
    }

    // Constrain to image bounds
    x = Math.max(0, Math.min(x, imageWidth - pixelCoords.width));
    y = Math.max(0, Math.min(y, imageHeight - pixelCoords.height));

    // Check overlap
    if (wouldOverlap(cropArea.id, { x, y })) {
      const valid = getValidPosition(cropArea.id, x, y, pixelCoords.width, pixelCoords.height);
      x = valid.x;
      y = valid.y;
    }

    node.x(x);
    node.y(y);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    let x = node.x();
    let y = node.y();

    // Commit snap if preview active
    const snappedPos = commitSnap(monitor.id);
    if (snappedPos) {
      x = snappedPos.x;
      y = snappedPos.y;
      node.x(x);
      node.y(y);
    }

    // Convert back to percentages for storage
    const percentCoords = toPercent(x, y, pixelCoords.width, pixelCoords.height, imageWidth, imageHeight);
    updateCropArea(cropArea.id, { xPercent: percentCoords.xPercent, yPercent: percentCoords.yPercent });
  };

  const handleTransform = () => {
    const node = rectRef.current;
    if (!node) return;

    const scaleX = node.scaleX();

    // Reset scale and apply to width/height
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(50, node.width() * scaleX);
    const newHeight = newWidth / aspectRatio;

    // Constrain to image
    const constrained = constrainToImage(
      { x: node.x(), y: node.y(), width: newWidth, height: newHeight },
      imageWidth,
      imageHeight
    );

    node.width(constrained.width);
    node.height(constrained.height);
    node.x(constrained.x);
    node.y(constrained.y);
  };

  const handleTransformEnd = () => {
    const node = rectRef.current;
    if (!node) return;

    const newWidth = node.width();
    const newHeight = node.height();
    const newX = node.x();
    const newY = node.y();

    // Convert to percentages for storage
    const percentCoords = toPercent(newX, newY, newWidth, newHeight, imageWidth, imageHeight);
    updateCropArea(cropArea.id, percentCoords);

    // Scale other monitors proportionally if diagonal is set
    if (monitor.diagonalInches) {
      scaleCropAreasByDiagonal(monitor.id, percentCoords.widthPercent);
    }
  };

  return (
    <>
      <Group>
        <Rect
          ref={rectRef}
          x={pixelCoords.x}
          y={pixelCoords.y}
          width={pixelCoords.width}
          height={pixelCoords.height}
          fill={`${monitor.color}33`}
          stroke={monitor.color}
          strokeWidth={2}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
        />
        <Text
          x={pixelCoords.x + 8}
          y={pixelCoords.y + 8}
          text={monitor.name}
          fontSize={14}
          fill={monitor.color}
          listening={false}
        />
        <Text
          x={pixelCoords.x + 8}
          y={pixelCoords.y + pixelCoords.height - 22}
          text={`${Math.round(pixelCoords.width)} x ${Math.round(pixelCoords.height)}`}
          fontSize={12}
          fill={monitor.color}
          listening={false}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
