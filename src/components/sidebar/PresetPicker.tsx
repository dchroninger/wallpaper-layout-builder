import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { MONITOR_PRESETS } from '../../constants/presets';
import type { MonitorSpec } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export function PresetPicker() {
  const addMonitor = useAppStore((s) => s.addMonitor);
  const customPresets = useAppStore((s) => s.customPresets);
  const addCustomPreset = useAppStore((s) => s.addCustomPreset);
  const removeCustomPreset = useAppStore((s) => s.removeCustomPreset);
  const loadCustomPresets = useAppStore((s) => s.loadCustomPresets);

  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customWidth, setCustomWidth] = useState('1920');
  const [customHeight, setCustomHeight] = useState('1080');
  const [customType, setCustomType] = useState<'pixels' | 'ratio'>('pixels');
  const [customDiagonal, setCustomDiagonal] = useState('');
  const [saveAsPreset, setSaveAsPreset] = useState(false);

  useEffect(() => {
    loadCustomPresets();
  }, [loadCustomPresets]);

  const handleAddPreset = () => {
    if (!selectedPreset) return;

    // Check if it's a custom preset (prefixed with 'custom:')
    if (selectedPreset.startsWith('custom:')) {
      const customId = selectedPreset.slice(7);
      const custom = customPresets.find(p => p.id === customId);
      if (!custom) return;

      addMonitor({
        name: custom.name,
        spec: custom.spec,
        targetResolution: custom.targetResolution,
        diagonalInches: custom.diagonalInches,
      });
    } else {
      const preset = MONITOR_PRESETS.find((p) => p.name === selectedPreset);
      if (!preset) return;

      addMonitor({
        name: preset.name,
        spec: preset.spec,
        targetResolution: preset.targetResolution,
      });
    }
    setSelectedPreset('');
  };

  const handleAddCustom = () => {
    const w = parseInt(customWidth);
    const h = parseInt(customHeight);
    if (!w || !h || w <= 0 || h <= 0) return;

    const spec: MonitorSpec = { type: customType, width: w, height: h };
    const name = customName || `Custom ${w}x${h}`;
    const diagonal = parseFloat(customDiagonal);

    addMonitor({
      name,
      spec,
      targetResolution: customType === 'pixels' ? { width: w, height: h } : undefined,
      diagonalInches: diagonal > 0 ? diagonal : undefined,
    });

    // Save as custom preset if checked
    if (saveAsPreset) {
      addCustomPreset({
        name,
        spec,
        targetResolution: customType === 'pixels' ? { width: w, height: h } : undefined,
        diagonalInches: diagonal > 0 ? diagonal : undefined,
      });
    }

    setCustomName('');
    setCustomDiagonal('');
    setSaveAsPreset(false);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCustomPreset(id);
    if (selectedPreset === `custom:${id}`) {
      setSelectedPreset('');
    }
  };

  const presetOptions = [
    { value: '', label: 'Select preset...' },
    ...MONITOR_PRESETS.map((p) => ({ value: p.name, label: p.name })),
    ...(customPresets.length > 0 ? [{ value: '__divider__', label: '── Custom ──' }] : []),
    ...customPresets.map((p) => ({ value: `custom:${p.id}`, label: `${p.name} ★` })),
  ];

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Add Monitor</h2>

      <div className="space-y-4">
        {/* Preset selection */}
        <div className="flex gap-2">
          <Select
            options={presetOptions.filter(o => o.value !== '__divider__')}
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddPreset} disabled={!selectedPreset} size="sm">
            Add
          </Button>
        </div>

        {/* Show delete button for selected custom preset */}
        {selectedPreset.startsWith('custom:') && (
          <button
            className="text-xs text-red-600 hover:underline"
            onClick={(e) => handleDeleteCustomPreset(selectedPreset.slice(7), e)}
          >
            Delete this preset
          </button>
        )}

        {/* Custom input */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Or add custom:</p>
          <div className="space-y-2">
            <Input
              placeholder="Name (optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-20"
              />
              <span className="self-center text-gray-400">x</span>
              <Input
                type="number"
                placeholder="Height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="w-20"
              />
              <Select
                options={[
                  { value: 'pixels', label: 'px' },
                  { value: 'ratio', label: 'ratio' },
                ]}
                value={customType}
                onChange={(e) => setCustomType(e.target.value as 'pixels' | 'ratio')}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Diagonal (inches)"
                value={customDiagonal}
                onChange={(e) => setCustomDiagonal(e.target.value)}
                className="flex-1"
              />
              <span className="text-xs text-gray-400">"</span>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={saveAsPreset}
                onChange={(e) => setSaveAsPreset(e.target.checked)}
                className="rounded border-gray-300"
              />
              Save as preset
            </label>
            <Button onClick={handleAddCustom} variant="secondary" size="sm" className="w-full">
              Add Custom
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
