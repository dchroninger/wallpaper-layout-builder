import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DockLayout } from '../types/dock';

export function defaultDockLayout(): DockLayout {
  return {
    left: [
      { id: 'g_left_1', mode: 'stacked', panels: ['wallpaper'], activeTab: 'wallpaper' },
      { id: 'g_left_2', mode: 'tabs', panels: ['layers', 'presets'], activeTab: 'layers' },
    ],
    right: [
      { id: 'g_right_1', mode: 'stacked', panels: ['inspector'], activeTab: 'inspector' },
    ],
    floating: {},
  };
}

export function panelExists(layout: DockLayout, pid: string): boolean {
  if (layout.floating[pid]) return true;
  if (layout.left.some((g) => g.panels.includes(pid))) return true;
  if (layout.right.some((g) => g.panels.includes(pid))) return true;
  return false;
}

interface DockState {
  layout: DockLayout;
  setLayout: (layout: DockLayout) => void;
  resetLayout: () => void;
}

export const useDockStore = create<DockState>()(
  persist(
    (set) => ({
      layout: defaultDockLayout(),
      setLayout: (layout) => set({ layout }),
      resetLayout: () => set({ layout: defaultDockLayout() }),
    }),
    {
      name: 'facet-dock-layout',
    }
  )
);
