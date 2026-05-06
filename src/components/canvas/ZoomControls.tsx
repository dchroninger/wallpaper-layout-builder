import { useAppStore } from '../../store/appStore';
import { Icon } from '../icons/Icon';

interface ZoomControlsProps {
  fitScale: number;
}

export function ZoomControls({ fitScale }: ZoomControlsProps) {
  const scale = useAppStore((s) => s.scale);
  const setScale = useAppStore((s) => s.setScale);

  return (
    <div className="zoom-dock">
      <button className="tool-btn" onClick={() => setScale(Math.max(0.1, scale / 1.25))} title="Zoom out">
        <Icon name="minus" size={12} />
      </button>
      <div className="zoom-val mono">{Math.round(scale * 100)}%</div>
      <button className="tool-btn" onClick={() => setScale(Math.min(5, scale * 1.25))} title="Zoom in">
        <Icon name="plus" size={12} />
      </button>
      <div className="vdivider" />
      <button className="tool-btn" onClick={() => setScale(fitScale)} title="Fit to view">
        <Icon name="fit" size={12} /> Fit
      </button>
    </div>
  );
}
