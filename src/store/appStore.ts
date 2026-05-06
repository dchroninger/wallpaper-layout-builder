import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Monitor,
  CropArea,
  ExportFormat,
  ExportResolution,
  SnapConnection,
  CustomPreset,
} from '../types';
import { getNextColor } from '../constants/presets';
import { getAspectRatio, getPhysicalWidthFromDiagonal } from '../utils/geometry';

const CUSTOM_PRESETS_KEY = 'wallpaper-cropper-custom-presets';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  accent: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setAccent: (accent: string) => void;

  // Tool
  tool: 'select' | 'hand';
  setTool: (tool: 'select' | 'hand') => void;
  selectedMonitorId: string | null;
  setSelectedMonitorId: (id: string | null) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;

  // Image
  imageUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  setImage: (url: string, width: number, height: number) => void;
  clearImage: () => void;

  // Wallpaper gallery (uploaded wallpapers)
  wallpapers: Array<{ id: string; url: string; width: number; height: number; name: string }>;
  addWallpaper: (url: string, width: number, height: number, name: string) => string;
  removeWallpaper: (id: string) => void;

  // Monitors
  monitors: Monitor[];
  addMonitor: (monitor: Omit<Monitor, 'id' | 'color'>) => void;
  updateMonitor: (id: string, updates: Partial<Monitor>) => void;
  removeMonitor: (id: string) => void;
  toggleMonitorRotation: (id: string) => void;

  // Crop Areas
  cropAreas: CropArea[];
  updateCropArea: (id: string, updates: Partial<CropArea>) => void;

  // Grid
  gridSize: number;
  gridEnabled: boolean;
  setGridSize: (size: number) => void;
  setGridEnabled: (enabled: boolean) => void;

  // Export
  exportFormat: ExportFormat;
  exportResolution: ExportResolution;
  exportQuality: number;
  setExportFormat: (format: ExportFormat) => void;
  setExportResolution: (resolution: ExportResolution) => void;
  setExportQuality: (quality: number) => void;

  // Canvas
  scale: number;
  setScale: (scale: number) => void;

  // Snap connections
  snapConnections: SnapConnection[];
  setSnapConnections: (connections: SnapConnection[]) => void;
  addSnapConnection: (connection: SnapConnection) => void;
  removeSnapConnection: (monitorId: string) => void;

  // Diagonal scaling
  scaleCropAreasByDiagonal: (resizedMonitorId: string, newWidthPercent: number) => void;

  // Custom presets
  customPresets: CustomPreset[];
  addCustomPreset: (preset: Omit<CustomPreset, 'id'>) => void;
  removeCustomPreset: (id: string) => void;
  loadCustomPresets: () => void;

  // Persistence
  saveConfig: () => void;
  loadConfig: () => void;
}

let idCounter = 0;
function generateId(): string {
  return `${Date.now()}-${++idCounter}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      accent: '#10B981',
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),

      // Tool
      tool: 'select',
      setTool: (tool) => set({ tool }),
      selectedMonitorId: null,
      setSelectedMonitorId: (id) => set({ selectedMonitorId: id }),
      showExportModal: false,
      setShowExportModal: (show) => set({ showExportModal: show }),

      // Image
      imageUrl: null,
      imageWidth: 0,
      imageHeight: 0,
      setImage: (url, width, height) => set({ imageUrl: url, imageWidth: width, imageHeight: height }),
      clearImage: () => set({ imageUrl: null, imageWidth: 0, imageHeight: 0 }),

      // Wallpaper gallery
      wallpapers: [],
      addWallpaper: (url, width, height, name) => {
        const id = generateId();
        set((state) => ({
          wallpapers: [...state.wallpapers, { id, url, width, height, name }],
          imageUrl: url,
          imageWidth: width,
          imageHeight: height,
        }));
        return id;
      },
      removeWallpaper: (id) => set((state) => ({
        wallpapers: state.wallpapers.filter((w) => w.id !== id),
      })),

      // Monitors
      monitors: [],
      addMonitor: (monitor) => {
        const state = get();
        const usedColors = state.monitors.map(m => m.color);
        const color = getNextColor(usedColors);
        const id = generateId();

        const newMonitor: Monitor = { ...monitor, id, color };

        // Calculate aspect ratio (swap if portrait)
        let aspectRatio = getAspectRatio(monitor.spec);
        if (monitor.isPortrait) {
          aspectRatio = 1 / aspectRatio;
        }

        // Default crop size as percentage of image (start with 30% width)
        let defaultWidthPercent = 0.3;

        // If new monitor has diagonal, scale relative to existing diagonal monitors
        if (monitor.diagonalInches && state.imageWidth > 0) {
          const existingWithDiagonal = state.monitors.find(m => m.diagonalInches);
          if (existingWithDiagonal) {
            const existingCrop = state.cropAreas.find(c => c.monitorId === existingWithDiagonal.id);
            if (existingCrop) {
              // Scale by physical width ratio (accounts for aspect ratio differences)
              let existingAR = getAspectRatio(existingWithDiagonal.spec);
              if (existingWithDiagonal.isPortrait) existingAR = 1 / existingAR;
              const existingPhysicalWidth = getPhysicalWidthFromDiagonal(existingWithDiagonal.diagonalInches!, existingAR);
              const newPhysicalWidth = getPhysicalWidthFromDiagonal(monitor.diagonalInches, aspectRatio);
              defaultWidthPercent = existingCrop.widthPercent * (newPhysicalWidth / existingPhysicalWidth);
            }
          }
        }

        const imageAR = state.imageWidth / state.imageHeight || 1;
        const defaultHeightPercent = defaultWidthPercent * imageAR / aspectRatio;

        // Offset each new crop area slightly
        const offsetPercent = 0.02 * state.cropAreas.length;

        const newCropArea: CropArea = {
          id: generateId(),
          monitorId: id,
          xPercent: 0.05 + offsetPercent,
          yPercent: 0.05 + offsetPercent,
          widthPercent: defaultWidthPercent,
          heightPercent: defaultHeightPercent,
        };

        set({
          monitors: [...state.monitors, newMonitor],
          cropAreas: [...state.cropAreas, newCropArea],
        });
      },
      updateMonitor: (id, updates) => set((state) => ({
        monitors: state.monitors.map(m => m.id === id ? { ...m, ...updates } : m),
      })),
      removeMonitor: (id) => set((state) => ({
        monitors: state.monitors.filter(m => m.id !== id),
        cropAreas: state.cropAreas.filter(c => c.monitorId !== id),
      })),
      toggleMonitorRotation: (id) => {
        const state = get();
        const monitor = state.monitors.find(m => m.id === id);
        if (!monitor) return;

        const newIsPortrait = !monitor.isPortrait;
        const cropArea = state.cropAreas.find(c => c.monitorId === id);

        // Update monitor
        const updatedMonitors = state.monitors.map(m =>
          m.id === id ? { ...m, isPortrait: newIsPortrait } : m
        );

        // Swap crop area dimensions (convert to pixels, swap, convert back)
        let updatedCropAreas = state.cropAreas;
        if (cropArea) {
          const pixelW = cropArea.widthPercent * state.imageWidth;
          const pixelH = cropArea.heightPercent * state.imageHeight;
          updatedCropAreas = state.cropAreas.map(c =>
            c.id === cropArea.id
              ? {
                  ...c,
                  widthPercent: pixelH / state.imageWidth,
                  heightPercent: pixelW / state.imageHeight,
                }
              : c
          );
        }

        set({ monitors: updatedMonitors, cropAreas: updatedCropAreas });
      },

      // Crop Areas
      cropAreas: [],
      updateCropArea: (id, updates) => set((state) => ({
        cropAreas: state.cropAreas.map(c => c.id === id ? { ...c, ...updates } : c),
      })),

      // Grid
      gridSize: 20,
      gridEnabled: false,
      setGridSize: (size) => set({ gridSize: size }),
      setGridEnabled: (enabled) => set({ gridEnabled: enabled }),

      // Export
      exportFormat: 'png',
      exportResolution: 'source',
      exportQuality: 90,
      setExportFormat: (format) => set({ exportFormat: format }),
      setExportResolution: (resolution) => set({ exportResolution: resolution }),
      setExportQuality: (quality) => set({ exportQuality: quality }),

      // Canvas
      scale: 1,
      setScale: (scale) => set({ scale }),

      // Snap connections
      snapConnections: [],
      setSnapConnections: (connections) => set({ snapConnections: connections }),
      addSnapConnection: (connection) => set((state) => ({
        snapConnections: [
          ...state.snapConnections.filter(
            (c) => c.monitorId !== connection.monitorId
          ),
          connection,
        ],
      })),
      removeSnapConnection: (monitorId) => set((state) => ({
        snapConnections: state.snapConnections.filter(
          (c) => c.monitorId !== monitorId && c.targetMonitorId !== monitorId
        ),
      })),

      // Diagonal scaling - uses physical width ratio (accounts for aspect ratio differences)
      scaleCropAreasByDiagonal: (resizedMonitorId, newWidthPercent) => {
        const state = get();
        const resizedMonitor = state.monitors.find((m) => m.id === resizedMonitorId);
        if (!resizedMonitor?.diagonalInches) return;

        let resizedAR = getAspectRatio(resizedMonitor.spec);
        if (resizedMonitor.isPortrait) resizedAR = 1 / resizedAR;
        const resizedPhysicalWidth = getPhysicalWidthFromDiagonal(resizedMonitor.diagonalInches, resizedAR);

        const updatedCropAreas = state.cropAreas.map((cropArea) => {
          if (cropArea.monitorId === resizedMonitorId) return cropArea;

          const monitor = state.monitors.find((m) => m.id === cropArea.monitorId);
          if (!monitor?.diagonalInches) return cropArea;

          let aspectRatio = getAspectRatio(monitor.spec);
          if (monitor.isPortrait) {
            aspectRatio = 1 / aspectRatio;
          }

          // Scale by physical width ratio
          const physicalWidth = getPhysicalWidthFromDiagonal(monitor.diagonalInches, aspectRatio);
          const widthRatio = physicalWidth / resizedPhysicalWidth;
          const targetWidthPercent = newWidthPercent * widthRatio;

          const imageAR = state.imageWidth / state.imageHeight || 1;
          const targetHeightPercent = targetWidthPercent * imageAR / aspectRatio;

          return { ...cropArea, widthPercent: targetWidthPercent, heightPercent: targetHeightPercent };
        });

        set({ cropAreas: updatedCropAreas });
      },

      // Custom presets
      customPresets: [],
      addCustomPreset: (preset) => {
        const id = generateId();
        const newPreset: CustomPreset = { ...preset, id };
        set((state) => {
          const updated = [...state.customPresets, newPreset];
          localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
          return { customPresets: updated };
        });
      },
      removeCustomPreset: (id) => {
        set((state) => {
          const updated = state.customPresets.filter(p => p.id !== id);
          localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
          return { customPresets: updated };
        });
      },
      loadCustomPresets: () => {
        const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
        if (saved) {
          try {
            const presets = JSON.parse(saved);
            set({ customPresets: presets });
          } catch (e) {
            console.error('Failed to load custom presets:', e);
          }
        }
      },

      // Persistence
      saveConfig: () => {
        const state = get();
        const config = {
          monitors: state.monitors,
          cropAreas: state.cropAreas,
          gridSize: state.gridSize,
          gridEnabled: state.gridEnabled,
        };
        localStorage.setItem('wallpaper-cropper-config', JSON.stringify(config));
      },
      loadConfig: () => {
        const saved = localStorage.getItem('wallpaper-cropper-config');
        if (saved) {
          try {
            const config = JSON.parse(saved);
            set({
              monitors: config.monitors || [],
              cropAreas: config.cropAreas || [],
              gridSize: config.gridSize || 20,
              gridEnabled: config.gridEnabled || false,
            });
          } catch (e) {
            console.error('Failed to load config:', e);
          }
        }
      },
    }),
    {
      name: 'wallpaper-cropper-settings',
      partialize: (state) => ({
        theme: state.theme,
        accent: state.accent,
        gridSize: state.gridSize,
        gridEnabled: state.gridEnabled,
        exportFormat: state.exportFormat,
        exportResolution: state.exportResolution,
        exportQuality: state.exportQuality,
      }),
    }
  )
);
