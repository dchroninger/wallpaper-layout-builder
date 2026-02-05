import type { MonitorSpec } from '../types';

export interface MonitorPreset {
  name: string;
  spec: MonitorSpec;
  targetResolution?: { width: number; height: number };
}

export const MONITOR_PRESETS: MonitorPreset[] = [
  // 16:9 displays
  { name: '4K UHD (3840×2160)', spec: { type: 'pixels', width: 3840, height: 2160 } },
  { name: '1440p (2560×1440)', spec: { type: 'pixels', width: 2560, height: 1440 } },
  { name: '1080p (1920×1080)', spec: { type: 'pixels', width: 1920, height: 1080 } },

  // 21:9 ultrawide
  { name: 'Ultrawide (3440×1440)', spec: { type: 'pixels', width: 3440, height: 1440 } },
  { name: 'Ultrawide (2560×1080)', spec: { type: 'pixels', width: 2560, height: 1080 } },

  // 32:9 super ultrawide
  { name: 'Super Ultrawide (5120×1440)', spec: { type: 'pixels', width: 5120, height: 1440 } },

  // 16:10 displays
  { name: '16:10 (2560×1600)', spec: { type: 'pixels', width: 2560, height: 1600 } },
  { name: '16:10 (1920×1200)', spec: { type: 'pixels', width: 1920, height: 1200 } },

  // 4:3 displays
  { name: '4:3 (1600×1200)', spec: { type: 'pixels', width: 1600, height: 1200 } },
];

export const MONITOR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function getNextColor(usedColors: string[]): string {
  const available = MONITOR_COLORS.filter(c => !usedColors.includes(c));
  return available[0] || MONITOR_COLORS[usedColors.length % MONITOR_COLORS.length];
}
