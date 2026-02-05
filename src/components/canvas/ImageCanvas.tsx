import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useAppStore } from '../../store/appStore';
import { useImage } from '../../hooks/useImage';
import { CropArea } from './CropArea';
import { GridOverlay } from './GridOverlay';
import { ZoomControls } from './ZoomControls';
import { SnapGuide } from './SnapGuide';
import type { SnapTarget } from '../../utils/geometry';

export function ImageCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapPreview, setSnapPreview] = useState<SnapTarget | null>(null);

  const imageUrl = useAppStore((s) => s.imageUrl);
  const imageWidth = useAppStore((s) => s.imageWidth);
  const imageHeight = useAppStore((s) => s.imageHeight);
  const monitors = useAppStore((s) => s.monitors);
  const cropAreas = useAppStore((s) => s.cropAreas);
  const scale = useAppStore((s) => s.scale);
  const setScale = useAppStore((s) => s.setScale);

  const [image] = useImage(imageUrl);

  // Fit image to viewport
  const calculateFitScale = useCallback(() => {
    if (!imageWidth || !imageHeight) return 1;
    const scaleX = (containerSize.width - 40) / imageWidth;
    const scaleY = (containerSize.height - 40) / imageHeight;
    return Math.min(1, scaleX, scaleY);
  }, [containerSize.width, containerSize.height, imageWidth, imageHeight]);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-fit when image changes
  useEffect(() => {
    if (imageUrl && imageWidth && imageHeight) {
      setScale(calculateFitScale());
    }
  }, [imageUrl, imageWidth, imageHeight, calculateFitScale, setScale]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
    setScale(Math.max(0.1, Math.min(5, newScale)));
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  if (!imageUrl) {
    return (
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500"
      >
        Upload an image to get started
      </div>
    );
  }

  const stageWidth = imageWidth * scale;
  const stageHeight = imageHeight * scale;

  return (
    <div ref={containerRef} className="flex-1 overflow-auto bg-gray-800 relative">
      <div
        className="absolute"
        style={{
          left: Math.max(20, (containerSize.width - stageWidth) / 2),
          top: Math.max(20, (containerSize.height - stageHeight) / 2),
        }}
      >
        <Stage
          width={stageWidth}
          height={stageHeight}
          scaleX={scale}
          scaleY={scale}
          onWheel={handleWheel}
          onClick={handleStageClick}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={imageWidth}
                height={imageHeight}
                listening={false}
              />
            )}
            <GridOverlay width={imageWidth} height={imageHeight} />
            {cropAreas.map((cropArea) => {
              const monitor = monitors.find((m) => m.id === cropArea.monitorId);
              if (!monitor) return null;
              return (
                <CropArea
                  key={cropArea.id}
                  cropArea={cropArea}
                  monitor={monitor}
                  isSelected={selectedId === cropArea.id}
                  onSelect={() => setSelectedId(cropArea.id)}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                  onSnapPreviewChange={setSnapPreview}
                />
              );
            })}
            <SnapGuide snapPreview={snapPreview} />
          </Layer>
        </Stage>
      </div>

      <ZoomControls fitScale={calculateFitScale()} />
    </div>
  );
}
