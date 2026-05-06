import { useState, useEffect } from 'react';
import { Icon } from './icons/Icon';
import { useAppStore } from '../store/appStore';
import { MONITOR_PRESETS } from '../constants/presets';
import type { MonitorTemplate } from '../types';

export function AddMonitorModal() {
  const showAddMonitorModal = useAppStore((s) => s.showAddMonitorModal);
  const setShowAddMonitorModal = useAppStore((s) => s.setShowAddMonitorModal);
  const monitorLibrary = useAppStore((s) => s.monitorLibrary);
  const addToLibrary = useAppStore((s) => s.addToLibrary);
  const removeFromLibrary = useAppStore((s) => s.removeFromLibrary);
  const addMonitorFromTemplate = useAppStore((s) => s.addMonitorFromTemplate);
  const loadMonitorLibrary = useAppStore((s) => s.loadMonitorLibrary);

  const [tab, setTab] = useState<'library' | 'presets' | 'custom'>('library');
  const [customName, setCustomName] = useState('Custom Monitor');
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [customDiag, setCustomDiag] = useState('');

  useEffect(() => { loadMonitorLibrary(); }, [loadMonitorLibrary]);

  if (!showAddMonitorModal) return null;

  const close = () => setShowAddMonitorModal(false);

  const addFromPreset = (preset: typeof MONITOR_PRESETS[0]) => {
    // Add to library and place on canvas
    const template: MonitorTemplate = {
      id: '',
      name: preset.name,
      spec: preset.spec,
      diagonalInches: undefined,
    };
    addToLibrary({ name: preset.name, spec: preset.spec });
    addMonitorFromTemplate(template);
    close();
  };

  const addFromLibrary = (t: MonitorTemplate) => {
    addMonitorFromTemplate(t);
    close();
  };

  const addCustom = () => {
    const template: MonitorTemplate = {
      id: '',
      name: customName,
      spec: { type: 'pixels', width: customW, height: customH },
      diagonalInches: customDiag ? parseFloat(customDiag) : undefined,
    };
    addToLibrary({
      name: customName,
      spec: { type: 'pixels', width: customW, height: customH },
      diagonalInches: customDiag ? parseFloat(customDiag) : undefined,
    });
    addMonitorFromTemplate(template);
    close();
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(480px, 100%)' }}>
        <div className="panel-header" style={{ cursor: 'default' }}>
          <div className="panel-title">
            <span className="dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            Add Monitor
          </div>
          <button className="panel-iconbtn" onClick={close} title="Close">
            <Icon name="x" size={12} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', background: 'var(--panel-2)' }}>
          {(['library', 'presets', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                height: 32,
                border: 0,
                background: tab === t ? 'var(--panel)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-dim)',
                font: 'inherit',
                fontSize: 11,
                fontWeight: tab === t ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t === 'library' ? 'My Library' : t === 'presets' ? 'Resolution Presets' : 'Custom'}
            </button>
          ))}
        </div>

        <div className="panel-body scroll" style={{ maxHeight: 360, padding: '10px 12px' }}>
          {tab === 'library' && (
            <>
              {monitorLibrary.length === 0 ? (
                <div className="hint" style={{ textAlign: 'center', padding: 20 }}>
                  No monitors in your library yet. Add from presets or create a custom one.
                </div>
              ) : (
                monitorLibrary.map((t) => (
                  <div key={t.id} className="preset" onClick={() => addFromLibrary(t)}>
                    <div className="preset-head">
                      <span className="preset-name">{t.name}</span>
                      <span className="preset-meta">
                        {t.spec.width}×{t.spec.height}
                        {t.diagonalInches ? ` · ${t.diagonalInches}″` : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        className="panel-iconbtn"
                        onClick={(e) => { e.stopPropagation(); removeFromLibrary(t.id); }}
                        title="Remove from library"
                      >
                        <Icon name="trash" size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'presets' && (
            <>
              <div className="hint" style={{ marginBottom: 8 }}>
                Pick a resolution to add to your library and place on canvas.
              </div>
              {MONITOR_PRESETS.map((preset) => (
                <div key={preset.name} className="preset" onClick={() => addFromPreset(preset)}>
                  <div className="preset-head">
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-meta">{preset.spec.width}×{preset.spec.height}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'custom' && (
            <div>
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
              <div className="field" style={{ marginBottom: 12 }}>
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
              <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addCustom}>
                <Icon name="plus" size={12} /> Add to Library & Place
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
