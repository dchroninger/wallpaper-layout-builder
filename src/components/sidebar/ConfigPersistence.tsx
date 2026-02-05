import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';

export function ConfigPersistence() {
  const saveConfig = useAppStore((s) => s.saveConfig);
  const loadConfig = useAppStore((s) => s.loadConfig);
  const monitors = useAppStore((s) => s.monitors);
  const imageUrl = useAppStore((s) => s.imageUrl);

  const hasSavedConfig = !!localStorage.getItem('wallpaper-cropper-config');

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Configuration</h2>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={saveConfig}
          disabled={monitors.length === 0}
          className="flex-1"
        >
          Save
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadConfig}
          disabled={!hasSavedConfig || !imageUrl}
          className="flex-1"
        >
          Load
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Save/load monitor positions to localStorage
      </p>
    </div>
  );
}
