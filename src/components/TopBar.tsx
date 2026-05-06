import { Icon } from './icons/Icon';
import { useAppStore } from '../store/appStore';

export function TopBar() {
  const tool = useAppStore((s) => s.tool);
  const setTool = useAppStore((s) => s.setTool);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const setGridEnabled = useAppStore((s) => s.setGridEnabled);
  const setShowExportModal = useAppStore((s) => s.setShowExportModal);
  const setShowAddMonitorModal = useAppStore((s) => s.setShowAddMonitorModal);

  return (
    <header className="topbar">
      {/* Left — Brand */}
      <div className="brand">
        <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-label="Facet">
          <path
            d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
            stroke="var(--accent)" strokeWidth="1.2" strokeLinejoin="round"
            fill="url(#facet-bg)"
          />
          <path d="M16 2 L16 14 L4 9 Z" fill="var(--accent)" opacity="0.92" />
          <path d="M16 2 L28 9 L16 14 Z" fill="var(--accent)" opacity="0.55" />
          <path d="M4 9 L16 14 L4 23 Z" fill="var(--accent)" opacity="0.32" />
          <path d="M28 9 L28 23 L16 14 Z" fill="var(--accent)" opacity="0.18" />
          <path d="M4 23 L16 30 L16 14 Z" fill="var(--accent)" opacity="0.7" />
          <path d="M28 23 L16 14 L16 30 Z" fill="var(--accent)" opacity="0.42" />
          <path
            d="M16 2 L16 14 M4 9 L16 14 L28 9 M16 14 L16 30 M4 23 L16 14 L28 23"
            stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="facet-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.08" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
        <div className="brand-name">Facet</div>
        <div className="brand-sub mono">wallpaper cropper · v0.5</div>
      </div>

      {/* Center — Tools */}
      <div className="topbar-center">
        <button
          className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
          onClick={() => setTool('select')}
          title="Select (V)"
        >
          <Icon name="cursor" size={13} /> <span>Select</span> <span className="kbd">V</span>
        </button>
        <button
          className={`tool-btn ${tool === 'hand' ? 'active' : ''}`}
          onClick={() => setTool('hand')}
          title="Hand / Pan (H)"
        >
          <Icon name="move" size={13} /> <span>Pan</span> <span className="kbd">H</span>
        </button>
        <div className="vdivider" />
        <button className="tool-btn" onClick={() => setShowAddMonitorModal(true)} title="Add monitor">
          <Icon name="plus-square" size={13} /> <span>Add monitor</span>
        </button>
        <div className="vdivider" />
        <button
          className={`tool-btn ${gridEnabled ? 'active' : ''}`}
          onClick={() => setGridEnabled(!gridEnabled)}
          title="Toggle grid (G)"
        >
          <Icon name="grid" size={13} /> <span className="kbd">G</span>
        </button>
        <button className="tool-btn" title="Snap to grid">
          <Icon name="magnet" size={13} />
        </button>
        <div className="vdivider" />
        <button className="tool-btn" title="Panels">
          <Icon name="layers" size={13} /> <span>Panels</span>
        </button>
      </div>

      {/* Right */}
      <div className="topbar-right">
        <span className="tag" style={{ marginRight: 4 }}>
          <span className="autosave-dot" />
          AUTOSAVED
        </span>
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={14} />
        </button>
        <button className="icon-btn" title="History">
          <Icon name="history" size={14} />
        </button>
        <button className="btn primary" onClick={() => setShowExportModal(true)}>
          <Icon name="download" size={13} /> Export
        </button>
      </div>
    </header>
  );
}
