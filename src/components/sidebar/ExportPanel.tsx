import { useAppStore } from '../../store/appStore';
import { useImage } from '../../hooks/useImage';
import { exportAllCropAreas, downloadAllAsZip } from '../../utils/exportImage';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

export function ExportPanel() {
  const imageUrl = useAppStore((s) => s.imageUrl);
  const monitors = useAppStore((s) => s.monitors);
  const cropAreas = useAppStore((s) => s.cropAreas);
  const exportFormat = useAppStore((s) => s.exportFormat);
  const exportResolution = useAppStore((s) => s.exportResolution);
  const exportQuality = useAppStore((s) => s.exportQuality);
  const setExportFormat = useAppStore((s) => s.setExportFormat);
  const setExportResolution = useAppStore((s) => s.setExportResolution);
  const setExportQuality = useAppStore((s) => s.setExportQuality);

  const [image] = useImage(imageUrl);

  const handleExport = async () => {
    if (!image || cropAreas.length === 0) return;

    const results = await exportAllCropAreas(
      image,
      cropAreas,
      monitors,
      exportFormat,
      exportResolution,
      exportQuality
    );

    await downloadAllAsZip(results);
  };

  const canExport = image && cropAreas.length > 0;

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Export</h2>

      <div className="space-y-3">
        <Select
          label="Format"
          options={[
            { value: 'png', label: 'PNG' },
            { value: 'jpg', label: 'JPEG' },
            { value: 'webp', label: 'WebP' },
          ]}
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
        />

        <Select
          label="Resolution"
          options={[
            { value: 'source', label: 'Source (crop size)' },
            { value: 'target', label: 'Target (monitor res)' },
          ]}
          value={exportResolution}
          onChange={(e) => setExportResolution(e.target.value as typeof exportResolution)}
        />

        {exportFormat !== 'png' && (
          <div>
            <label className="text-sm font-medium text-gray-700">Quality: {exportQuality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={exportQuality}
              onChange={(e) => setExportQuality(parseInt(e.target.value))}
              className="w-full mt-1"
            />
          </div>
        )}

        <Button onClick={handleExport} disabled={!canExport} className="w-full">
          Export {cropAreas.length} Monitor{cropAreas.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
