import { Icon } from '../icons/Icon';
import { useAppStore } from '../../store/appStore';

const SWATCH_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6', '#A855F7'];

export function LayersPanel() {
  const monitors = useAppStore((s) => s.monitors);
  const selectedMonitorIds = useAppStore((s) => s.selectedMonitorIds);
  const toggleMonitorSelection = useAppStore((s) => s.toggleMonitorSelection);
  const removeMonitor = useAppStore((s) => s.removeMonitor);

  return (
    <>
      {monitors.length === 0 && (
        <div style={{ padding: 16, textAlign: 'center' }} className="hint">
          No monitors. Add one or load a preset.
        </div>
      )}
      {monitors.map((m, i) => (
        <div
          key={m.id}
          className={`layer ${selectedMonitorIds.includes(m.id) ? 'selected' : ''}`}
          onClick={(e) => toggleMonitorSelection(m.id, e.shiftKey || e.metaKey)}
        >
          <span className="layer-swatch" style={{ '--swatch': SWATCH_COLORS[i % SWATCH_COLORS.length] } as React.CSSProperties} />
          <div className="layer-name">
            {m.name}
            <small>
              {m.spec.width}×{m.spec.height}
              {m.diagonalInches ? ` · ${m.diagonalInches}″` : ''}
              {m.groupId ? ' · grouped' : ''}
            </small>
          </div>
          <div className="layer-meta">
            <button
              className="panel-iconbtn"
              onClick={(e) => {
                e.stopPropagation();
                removeMonitor(m.id);
              }}
              title="Delete"
            >
              <Icon name="trash" size={11} />
            </button>
          </div>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8, marginTop: 8 }}>
        <div className="hint">
          <span className="cap">⇧</span> click to multi-select · <span className="cap">⌫</span> del
        </div>
      </div>
    </>
  );
}
