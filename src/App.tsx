import { useEffect, useMemo, useRef } from 'react';
import { ImageCanvas } from './components/canvas/ImageCanvas';
import { TopBar } from './components/TopBar';
import { DockManager } from './components/dock/DockManager';
import { WallpaperPanel, WallpaperPanelHeaderActions } from './components/panels/WallpaperPanel';
import { LayersPanel } from './components/panels/LayersPanel';
import { PresetsPanel, PresetsPanelHeaderAction } from './components/panels/PresetsPanel';
import type { PresetsPanelHandle } from './components/panels/PresetsPanel';
import { InspectorPanel } from './components/panels/InspectorPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAppStore } from './store/appStore';
import { useDockStore } from './store/dockStore';
import type { PanelDef } from './types/dock';

function App() {
  useKeyboardShortcuts();

  const theme = useAppStore((s) => s.theme);
  const accent = useAppStore((s) => s.accent);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-2', accent);
    root.style.setProperty('--accent-glow', `${accent}28`);
    root.style.setProperty('--selection', accent);
  }, [accent]);

  const monitors = useAppStore((s) => s.monitors);
  const layout = useDockStore((s) => s.layout);
  const setLayout = useDockStore((s) => s.setLayout);
  const presetsRef = useRef<PresetsPanelHandle>(null);

  const panelsRegistry = useMemo<Record<string, PanelDef>>(
    () => ({
      wallpaper: {
        id: 'wallpaper',
        title: 'Wallpaper',
        dotColor: '#EC4899',
        headerActions: <WallpaperPanelHeaderActions />,
        render: () => <WallpaperPanel />,
      },
      layers: {
        id: 'layers',
        title: `Monitors · ${monitors.length}`,
        dotColor: '#10B981',
        render: () => <LayersPanel />,
      },
      presets: {
        id: 'presets',
        title: 'Presets',
        dotColor: '#F59E0B',
        headerActions: <PresetsPanelHeaderAction onClick={() => presetsRef.current?.toggleCustom()} />,
        render: () => <PresetsPanel ref={presetsRef} />,
      },
      inspector: {
        id: 'inspector',
        title: 'Inspector',
        dotColor: '#6366F1',
        render: () => <InspectorPanel />,
      },
    }),
    [monitors.length]
  );

  return (
    <div className="app-shell">
      <div className="app-bg" />
      <TopBar />
      <main className="workspace">
        <ImageCanvas />
        <DockManager panels={panelsRegistry} layout={layout} setLayout={setLayout} />
      </main>
    </div>
  );
}

export default App;
