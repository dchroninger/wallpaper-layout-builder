export type DockSide = 'left' | 'right';
export type GroupMode = 'stacked' | 'tabs';

export interface DockGroup {
  id: string;
  mode: GroupMode;
  panels: string[];
  activeTab: string;
}

export interface FloatingPosition {
  x: number;
  y: number;
  w?: number;
  h?: number;
}

export interface DockLayout {
  left: DockGroup[];
  right: DockGroup[];
  floating: Record<string, FloatingPosition>;
}

export interface PanelDef {
  id: string;
  title: string;
  dotColor: string;
  render: (opts?: { inDock?: boolean }) => React.ReactNode;
  headerActions?: React.ReactNode;
}
