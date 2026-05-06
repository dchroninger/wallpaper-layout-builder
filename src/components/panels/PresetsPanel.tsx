import { useState, useImperativeHandle, forwardRef } from 'react';
import { Icon } from '../icons/Icon';
import { useAppStore } from '../../store/appStore';
import { MONITOR_PRESETS } from '../../constants/presets';

export function PresetsPanelHeaderAction({ onClick }: { onClick: () => void }) {
  return (
    <button className="panel-iconbtn" onClick={onClick} title="Add custom monitor">
      <Icon name="plus" size={11} />
    </button>
  );
}

export interface PresetsPanelHandle {
  toggleCustom: () => void;
}

export const PresetsPanel = forwardRef<PresetsPanelHandle>(function PresetsPanel(_, ref) {
  const addMonitor = useAppStore((s) => s.addMonitor);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('Custom Monitor');
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [customDiag, setCustomDiag] = useState('');

  useImperativeHandle(ref, () => ({
    toggleCustom: () => setShowCustom((v) => !v),
  }));

  const handleAddCustom = () => {
    addMonitor({
      name: customName || 'Custom Monitor',
      spec: { type: 'pixels', width: customW, height: customH },
      diagonalInches: customDiag ? parseFloat(customDiag) : undefined,
    });
    setShowCustom(false);
    setCustomName('Custom Monitor');
    setCustomW(1920);
    setCustomH(1080);
    setCustomDiag('');
  };

  return (
    <>
      {showCustom && (
        <div
          style={{
            padding: 10,
            marginBottom: 8,
            background: 'var(--panel-2)',
            border: '1px solid var(--line)',
            borderRadius: 9,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8 }}>
            Custom Monitor
          </div>
          <div className="field" style={{ marginBottom: 6 }}>
            <label>Name</label>
            <input value={customName} onChange={(e) => setCustomName(e.target.value)} />
          </div>
          <div className="field-row" style={{ marginBottom: 6 }}>
            <div className="field">
              <label>W</label>
              <input type="number" value={customW} onChange={(e) => setCustomW(parseInt(e.target.value) || 0)} />
              <span className="unit">px</span>
            </div>
            <div className="field">
              <label>H</label>
              <input type="number" value={customH} onChange={(e) => setCustomH(parseInt(e.target.value) || 0)} />
              <span className="unit">px</span>
            </div>
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Diag</label>
            <input
              type="number"
              step="0.1"
              placeholder="optional"
              value={customDiag}
              onChange={(e) => setCustomDiag(e.target.value)}
            />
            <span className="unit">in</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn primary" style={{ height: 26, fontSize: 11, flex: 1, justifyContent: 'center' }} onClick={handleAddCustom}>
              Add
            </button>
            <button className="btn ghost" style={{ height: 26, fontSize: 11 }} onClick={() => setShowCustom(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {MONITOR_PRESETS.map((preset) => (
        <div
          key={preset.name}
          className="preset"
          onClick={() => {
            addMonitor({
              name: preset.name,
              spec: preset.spec,
              targetResolution: preset.targetResolution,
            });
          }}
        >
          <div className="preset-head">
            <span className="preset-name">{preset.name}</span>
            <span className="preset-meta">
              {preset.spec.width}×{preset.spec.height}
            </span>
          </div>
        </div>
      ))}
    </>
  );
});
