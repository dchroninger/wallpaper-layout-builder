import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function useKeyboardShortcuts() {
  const scale = useAppStore((s) => s.scale);
  const setScale = useAppStore((s) => s.setScale);
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const setGridEnabled = useAppStore((s) => s.setGridEnabled);
  const setTool = useAppStore((s) => s.setTool);
  const selectedMonitorIds = useAppStore((s) => s.selectedMonitorIds);
  const removeMonitor = useAppStore((s) => s.removeMonitor);
  const setSelectedMonitorIds = useAppStore((s) => s.setSelectedMonitorIds);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'v' || e.key === 'V') { setTool('select'); return; }
      if (e.key === 'h' || e.key === 'H') { setTool('hand'); return; }

      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedMonitorIds.length > 0) {
        selectedMonitorIds.forEach((id) => removeMonitor(id));
        setSelectedMonitorIds([]);
        return;
      }

      if (e.key === '=' || e.key === '+') { e.preventDefault(); setScale(Math.min(5, scale * 1.25)); }
      else if (e.key === '-') { e.preventDefault(); setScale(Math.max(0.1, scale / 1.25)); }
      else if (e.key === '0') { e.preventDefault(); setScale(1); }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setGridEnabled(!gridEnabled); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale, setScale, gridEnabled, setGridEnabled, setTool, selectedMonitorIds, removeMonitor, setSelectedMonitorIds]);
}
