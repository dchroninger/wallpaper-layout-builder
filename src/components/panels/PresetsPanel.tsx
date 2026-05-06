import { useState } from 'react';
import { Icon } from '../icons/Icon';
import { useAppStore } from '../../store/appStore';

export function PresetsPanelHeaderAction() {
  const saveDeskPreset = useAppStore((s) => s.saveDeskPreset);
  const monitors = useAppStore((s) => s.monitors);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  if (naming) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) saveDeskPreset(name.trim());
          setNaming(false);
          setName('');
        }}
        style={{ display: 'flex', gap: 4, alignItems: 'center' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Preset name"
          style={{
            height: 20,
            fontSize: 10,
            padding: '0 6px',
            background: 'var(--panel-3)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            borderRadius: 4,
            outline: 'none',
            width: 100,
          }}
        />
        <button className="panel-iconbtn" type="submit" title="Save">
          <Icon name="check" size={10} />
        </button>
        <button className="panel-iconbtn" type="button" onClick={() => setNaming(false)} title="Cancel">
          <Icon name="x" size={10} />
        </button>
      </form>
    );
  }

  return (
    <button
      className="panel-iconbtn"
      onClick={() => {
        if (monitors.length === 0) return;
        setNaming(true);
        setName('');
      }}
      title={monitors.length === 0 ? 'Add monitors first' : 'Save current layout as preset'}
    >
      <Icon name="plus" size={11} />
    </button>
  );
}

export function PresetsPanel() {
  const deskPresets = useAppStore((s) => s.deskPresets);
  const loadDeskPreset = useAppStore((s) => s.loadDeskPreset);
  const removeDeskPreset = useAppStore((s) => s.removeDeskPreset);
  const renameDeskPreset = useAppStore((s) => s.renameDeskPreset);
  const loadDeskPresets = useAppStore((s) => s.loadDeskPresets);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  // Load on mount
  useState(() => { loadDeskPresets(); });

  return (
    <>
      {deskPresets.length === 0 ? (
        <div className="hint" style={{ textAlign: 'center', padding: 16 }}>
          No desk presets yet. Arrange monitors on the canvas, then click <strong>+</strong> to save as a preset.
        </div>
      ) : (
        deskPresets.map((p) => (
          <div
            key={p.id}
            className="preset"
            onClick={() => loadDeskPreset(p.id)}
            onDoubleClick={() => { setRenamingId(p.id); setDraftName(p.name); }}
          >
            <div className="preset-head">
              {renamingId === p.id ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => { renameDeskPreset(p.id, draftName); setRenamingId(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { renameDeskPreset(p.id, draftName); setRenamingId(null); } }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: 'var(--panel-3)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                    fontSize: 12,
                    padding: '2px 6px',
                    borderRadius: 4,
                    width: '70%',
                  }}
                />
              ) : (
                <span className="preset-name">{p.name}</span>
              )}
              <span className="preset-meta">{p.monitors.length} mon</span>
            </div>

            {/* Mini preview */}
            {p.monitors.length > 0 && (() => {
              let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              p.monitors.forEach((m) => {
                minX = Math.min(minX, m.offsetXPercent);
                minY = Math.min(minY, m.offsetYPercent);
                maxX = Math.max(maxX, m.offsetXPercent + m.widthPercent);
                maxY = Math.max(maxY, m.offsetYPercent + m.heightPercent);
              });
              const totW = maxX - minX || 0.01;
              const totH = maxY - minY || 0.01;
              return (
                <div className="preset-mini">
                  {p.monitors.map((m, i) => (
                    <div
                      key={i}
                      className="preset-mini-monitor"
                      style={{
                        left: `${((m.offsetXPercent - minX) / totW) * 92 + 4}%`,
                        top: `${((m.offsetYPercent - minY) / totH) * 80 + 10}%`,
                        width: `${(m.widthPercent / totW) * 92}%`,
                        height: `${(m.heightPercent / totH) * 80}%`,
                      }}
                    />
                  ))}
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span className="hint" style={{ fontSize: 10 }}>
                {p.monitors.map((m) => m.name).join(', ')}
              </span>
              <button
                className="panel-iconbtn"
                onClick={(e) => { e.stopPropagation(); removeDeskPreset(p.id); }}
                title="Delete preset"
              >
                <Icon name="trash" size={11} />
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
