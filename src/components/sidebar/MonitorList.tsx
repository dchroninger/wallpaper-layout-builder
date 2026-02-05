import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function MonitorList() {
  const monitors = useAppStore((s) => s.monitors);
  const cropAreas = useAppStore((s) => s.cropAreas);
  const imageWidth = useAppStore((s) => s.imageWidth);
  const imageHeight = useAppStore((s) => s.imageHeight);
  const removeMonitor = useAppStore((s) => s.removeMonitor);
  const updateMonitor = useAppStore((s) => s.updateMonitor);
  const toggleMonitorRotation = useAppStore((s) => s.toggleMonitorRotation);
  const [editingDiagonal, setEditingDiagonal] = useState<string | null>(null);

  if (monitors.length === 0) {
    return (
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Monitors</h2>
        <p className="text-sm text-gray-500">No monitors added yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Monitors</h2>
      <div className="space-y-2">
        {monitors.map((monitor) => {
          const cropArea = cropAreas.find((c) => c.monitorId === monitor.id);
          const specLabel =
            monitor.spec.type === 'pixels'
              ? `${monitor.spec.width}x${monitor.spec.height}`
              : `${monitor.spec.width}:${monitor.spec.height}`;

          // Calculate pixel dimensions from percentages
          const cropWidth = cropArea ? Math.round(cropArea.widthPercent * imageWidth) : 0;
          const cropHeight = cropArea ? Math.round(cropArea.heightPercent * imageHeight) : 0;

          return (
            <div
              key={monitor.id}
              className="p-2 bg-gray-50 rounded-md"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: monitor.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {monitor.name}
                    {monitor.isPortrait && <span className="ml-1 text-gray-400">(P)</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {specLabel}
                    {cropArea && (
                      <span className="ml-1">
                        • {cropWidth}x{cropHeight} crop
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleMonitorRotation(monitor.id)}
                  className="px-2 py-1 text-xs"
                  title="Toggle portrait/landscape"
                >
                  ↻
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeMonitor(monitor.id)}
                  className="px-2 py-1 text-xs"
                >
                  ×
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Diagonal:</span>
                {editingDiagonal === monitor.id ? (
                  <Input
                    type="number"
                    className="w-16 text-xs"
                    defaultValue={monitor.diagonalInches || ''}
                    placeholder="inches"
                    autoFocus
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      updateMonitor(monitor.id, { diagonalInches: val > 0 ? val : undefined });
                      setEditingDiagonal(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        updateMonitor(monitor.id, { diagonalInches: val > 0 ? val : undefined });
                        setEditingDiagonal(null);
                      }
                    }}
                  />
                ) : (
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setEditingDiagonal(monitor.id)}
                  >
                    {monitor.diagonalInches ? `${monitor.diagonalInches}"` : 'Set...'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
