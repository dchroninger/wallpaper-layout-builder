import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Monitor,
  MonitorTemplate,
  DeskPreset,
  CropArea,
  ExportFormat,
  ExportResolution,
  SnapConnection,
} from '../types';
import { getNextColor } from '../constants/presets';
import { getAspectRatio, getPhysicalWidthFromDiagonal } from '../utils/geometry';

const MONITOR_LIBRARY_KEY = 'facet-monitor-library';
const DESK_PRESETS_KEY = 'facet-desk-presets';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  accent: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setAccent: (accent: string) => void;

  // Tool
  tool: 'select' | 'hand';
  setTool: (tool: 'select' | 'hand') => void;
  selectedMonitorIds: string[];
  setSelectedMonitorIds: (ids: string[]) => void;
  toggleMonitorSelection: (id: string, additive: boolean) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  showAddMonitorModal: boolean;
  setShowAddMonitorModal: (show: boolean) => void;

  // Monitor library (saved monitor specs)
  monitorLibrary: MonitorTemplate[];
  addToLibrary: (template: Omit<MonitorTemplate, 'id'>) => void;
  removeFromLibrary: (id: string) => void;
  updateLibraryItem: (id: string, updates: Partial<MonitorTemplate>) => void;
  loadMonitorLibrary: () => void;

  // Desk presets (saved configurations)
  deskPresets: DeskPreset[];
  saveDeskPreset: (name: string) => void;
  loadDeskPreset: (id: string) => void;
  removeDeskPreset: (id: string) => void;
  renameDeskPreset: (id: string, name: string) => void;
  loadDeskPresets: () => void;

  // Add monitor from library
  addMonitorFromTemplate: (template: MonitorTemplate) => void;

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
      selectedMonitorIds: [],
      setSelectedMonitorIds: (ids) => set({ selectedMonitorIds: ids }),
      toggleMonitorSelection: (id, additive) => {
        const state = get();
        if (additive) {
          const already = state.selectedMonitorIds.includes(id);
          set({ selectedMonitorIds: already
            ? state.selectedMonitorIds.filter((i) => i !== id)
            : [...state.selectedMonitorIds, id] });
        } else {
          set({ selectedMonitorIds: [id] });
        }
      },
      showExportModal: false,
      setShowExportModal: (show) => set({ showExportModal: show }),
      showAddMonitorModal: false,
      setShowAddMonitorModal: (show) => set({ showAddMonitorModal: show }),

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

      // Monitor library
      monitorLibrary: [],
      addToLibrary: (template) => {
        const id = generateId();
        const item: MonitorTemplate = { ...template, id };
        set((state) => {
          const updated = [...state.monitorLibrary, item];
          localStorage.setItem(MONITOR_LIBRARY_KEY, JSON.stringify(updated));
          return { monitorLibrary: updated };
        });
      },
      removeFromLibrary: (id) => {
        set((state) => {
          const updated = state.monitorLibrary.filter((t) => t.id !== id);
          localStorage.setItem(MONITOR_LIBRARY_KEY, JSON.stringify(updated));
          return { monitorLibrary: updated };
        });
      },
      updateLibraryItem: (id, updates) => {
        set((state) => {
          const updated = state.monitorLibrary.map((t) => (t.id === id ? { ...t, ...updates } : t));
          localStorage.setItem(MONITOR_LIBRARY_KEY, JSON.stringify(updated));
          return { monitorLibrary: updated };
        });
      },
      loadMonitorLibrary: () => {
        const saved = localStorage.getItem(MONITOR_LIBRARY_KEY);
        if (saved) {
          try { set({ monitorLibrary: JSON.parse(saved) }); }
          catch (e) { console.error('Failed to load monitor library:', e); }
        }
      },

      // Add monitor from a library template
      addMonitorFromTemplate: (template) => {
        const state = get();
        const usedColors = state.monitors.map((m) => m.color);
        const color = getNextColor(usedColors);
        const id = generateId();
        const newMonitor: Monitor = {
          id,
          name: template.name,
          spec: template.spec,
          color,
          diagonalInches: template.diagonalInches,
        };
        let aspectRatio = getAspectRatio(template.spec);
        let defaultWidthPercent = 0.3;
        if (template.diagonalInches && state.imageWidth > 0) {
          const existing = state.monitors.find((m) => m.diagonalInches);
          if (existing) {
            const existingCrop = state.cropAreas.find((c) => c.monitorId === existing.id);
            if (existingCrop) {
              let existingAR = getAspectRatio(existing.spec);
              if (existing.isPortrait) existingAR = 1 / existingAR;
              const ePW = getPhysicalWidthFromDiagonal(existing.diagonalInches!, existingAR);
              const nPW = getPhysicalWidthFromDiagonal(template.diagonalInches, aspectRatio);
              defaultWidthPercent = existingCrop.widthPercent * (nPW / ePW);
            }
          }
        }
        const imageAR = state.imageWidth / state.imageHeight || 1;
        const defaultHeightPercent = defaultWidthPercent * imageAR / aspectRatio;
        const offset = 0.02 * state.cropAreas.length;
        const newCropArea: CropArea = {
          id: generateId(),
          monitorId: id,
          xPercent: 0.05 + offset,
          yPercent: 0.05 + offset,
          widthPercent: defaultWidthPercent,
          heightPercent: defaultHeightPercent,
        };
        set({
          monitors: [...state.monitors, newMonitor],
          cropAreas: [...state.cropAreas, newCropArea],
          selectedMonitorIds: [id],
        });
      },

      // Desk presets
      deskPresets: [],
      saveDeskPreset: (name) => {
        const state = get();
        if (state.monitors.length === 0) return;
        const id = generateId();
        // Compute relative positions from current crop areas
        const presetMonitors = state.monitors.map((m) => {
          const crop = state.cropAreas.find((c) => c.monitorId === m.id);
          return {
            name: m.name,
            spec: m.spec,
            diagonalInches: m.diagonalInches,
            isPortrait: m.isPortrait,
            offsetXPercent: crop?.xPercent ?? 0.05,
            offsetYPercent: crop?.yPercent ?? 0.05,
            widthPercent: crop?.widthPercent ?? 0.3,
            heightPercent: crop?.heightPercent ?? 0.2,
          };
        });
        const preset: DeskPreset = { id, name, monitors: presetMonitors };
        set((s) => {
          const updated = [...s.deskPresets, preset];
          localStorage.setItem(DESK_PRESETS_KEY, JSON.stringify(updated));
          return { deskPresets: updated };
        });
      },
      loadDeskPreset: (presetId) => {
        const state = get();
        const preset = state.deskPresets.find((p) => p.id === presetId);
        if (!preset) return;
        const groupId = generateId();
        const newMonitors: Monitor[] = [];
        const newCropAreas: CropArea[] = [];
        for (const pm of preset.monitors) {
          const usedColors = [...state.monitors, ...newMonitors].map((m) => m.color);
          const color = getNextColor(usedColors);
          const mId = generateId();
          newMonitors.push({
            id: mId,
            name: pm.name,
            spec: pm.spec,
            color,
            diagonalInches: pm.diagonalInches,
            isPortrait: pm.isPortrait,
            groupId,
          });
          newCropAreas.push({
            id: generateId(),
            monitorId: mId,
            xPercent: pm.offsetXPercent,
            yPercent: pm.offsetYPercent,
            widthPercent: pm.widthPercent,
            heightPercent: pm.heightPercent,
          });
        }
        set({
          monitors: [...state.monitors, ...newMonitors],
          cropAreas: [...state.cropAreas, ...newCropAreas],
          selectedMonitorIds: newMonitors.map((m) => m.id),
        });
      },
      removeDeskPreset: (id) => {
        set((state) => {
          const updated = state.deskPresets.filter((p) => p.id !== id);
          localStorage.setItem(DESK_PRESETS_KEY, JSON.stringify(updated));
          return { deskPresets: updated };
        });
      },
      renameDeskPreset: (id, name) => {
        set((state) => {
          const updated = state.deskPresets.map((p) => (p.id === id ? { ...p, name } : p));
          localStorage.setItem(DESK_PRESETS_KEY, JSON.stringify(updated));
          return { deskPresets: updated };
        });
      },
      loadDeskPresets: () => {
        const saved = localStorage.getItem(DESK_PRESETS_KEY);
        if (saved) {
          try { set({ deskPresets: JSON.parse(saved) }); }
          catch (e) { console.error('Failed to load desk presets:', e); }
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
