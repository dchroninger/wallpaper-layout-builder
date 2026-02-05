export type MonitorSpec =
  | { type: 'ratio'; width: number; height: number }
  | { type: 'pixels'; width: number; height: number };

export interface Monitor {
  id: string;
  name: string;
  spec: MonitorSpec;
  targetResolution?: { width: number; height: number };
  color: string;
  diagonalInches?: number;
  isPortrait?: boolean;
}

export type SnapEdge = 'top' | 'bottom' | 'left' | 'right';

export interface SnapConnection {
  monitorId: string;
  edge: SnapEdge;
  targetMonitorId: string;
  targetEdge: SnapEdge;
}

export interface CropArea {
  id: string;
  monitorId: string;
  xPercent: number;      // 0-1, percentage of image width
  yPercent: number;      // 0-1, percentage of image height
  widthPercent: number;  // 0-1, percentage of image width
  heightPercent: number; // 0-1, percentage of image height
}

export interface CustomPreset {
  id: string;
  name: string;
  spec: MonitorSpec;
  targetResolution?: { width: number; height: number };
  diagonalInches?: number;
}

export interface AppConfig {
  monitors: Monitor[];
  cropAreas: CropArea[];
  gridSize: number;
  gridEnabled: boolean;
}

export type ExportFormat = 'png' | 'jpg' | 'webp';
export type ExportResolution = 'source' | 'target';

export interface ExportOptions {
  format: ExportFormat;
  resolution: ExportResolution;
  quality: number;
}
