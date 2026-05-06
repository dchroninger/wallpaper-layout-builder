export type MonitorSpec =
  | { type: 'ratio'; width: number; height: number }
  | { type: 'pixels'; width: number; height: number };

// A monitor template in the user's library (saved specs they can reuse)
export interface MonitorTemplate {
  id: string;
  name: string;
  spec: MonitorSpec;
  diagonalInches?: number;
  isBuiltIn?: boolean; // true for factory presets
}

// A live monitor placed on the canvas
export interface Monitor {
  id: string;
  name: string;
  spec: MonitorSpec;
  targetResolution?: { width: number; height: number };
  color: string;
  diagonalInches?: number;
  isPortrait?: boolean;
  groupId?: string; // links monitors that belong to the same desk preset
}

// A saved desk configuration (preset)
export interface DeskPreset {
  id: string;
  name: string;
  // Relative positions so the group can be placed anywhere on the wallpaper
  monitors: Array<{
    templateId?: string; // optional ref to library
    name: string;
    spec: MonitorSpec;
    diagonalInches?: number;
    isPortrait?: boolean;
    // offsets relative to group origin (percent of image)
    offsetXPercent: number;
    offsetYPercent: number;
    widthPercent: number;
    heightPercent: number;
  }>;
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
