import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';

interface ZoomControlsProps {
  fitScale: number;
}

export function ZoomControls({ fitScale }: ZoomControlsProps) {
  const scale = useAppStore((s) => s.scale);
  const setScale = useAppStore((s) => s.setScale);

  const handleZoomIn = () => setScale(Math.min(5, scale * 1.25));
  const handleZoomOut = () => setScale(Math.max(0.1, scale / 1.25));
  const handleFit = () => setScale(fitScale);
  const handleActual = () => setScale(1);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 text-white px-3 py-2 rounded-lg">
      <Button variant="secondary" size="sm" onClick={handleZoomOut} className="px-2 py-1">
        −
      </Button>
      <span className="w-14 text-center text-sm">{Math.round(scale * 100)}%</span>
      <Button variant="secondary" size="sm" onClick={handleZoomIn} className="px-2 py-1">
        +
      </Button>
      <div className="w-px h-4 bg-gray-500 mx-1" />
      <Button variant="secondary" size="sm" onClick={handleFit} className="px-2 py-1 text-xs">
        Fit
      </Button>
      <Button variant="secondary" size="sm" onClick={handleActual} className="px-2 py-1 text-xs">
        100%
      </Button>
    </div>
  );
}
