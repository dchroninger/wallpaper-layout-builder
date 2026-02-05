import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function useKeyboardShortcuts() {
  const scale = useAppStore((s) => s.scale);
  const setScale = useAppStore((s) => s.setScale);
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const setGridEnabled = useAppStore((s) => s.setGridEnabled);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Zoom controls
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setScale(Math.min(5, scale * 1.25));
      } else if (e.key === '-') {
        e.preventDefault();
        setScale(Math.max(0.1, scale / 1.25));
      } else if (e.key === '0') {
        e.preventDefault();
        setScale(1);
      }

      // Grid toggle
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setGridEnabled(!gridEnabled);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale, setScale, gridEnabled, setGridEnabled]);
}
