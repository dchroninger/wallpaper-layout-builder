import { useAppStore } from '../../store/appStore';
import { Input } from '../ui/Input';

export function GridSettings() {
  const gridSize = useAppStore((s) => s.gridSize);
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const setGridSize = useAppStore((s) => s.setGridSize);
  const setGridEnabled = useAppStore((s) => s.setGridEnabled);

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Grid</h2>
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={gridEnabled}
            onChange={(e) => setGridEnabled(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Enable grid snap</span>
        </label>

        {gridEnabled && (
          <Input
            type="number"
            label="Grid size (px)"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value) || 20)}
            min={5}
            max={200}
          />
        )}
      </div>
    </div>
  );
}
