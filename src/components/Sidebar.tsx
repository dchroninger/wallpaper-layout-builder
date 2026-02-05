import { ImageUpload } from './sidebar/ImageUpload';
import { PresetPicker } from './sidebar/PresetPicker';
import { MonitorList } from './sidebar/MonitorList';
import { GridSettings } from './sidebar/GridSettings';
import { ExportPanel } from './sidebar/ExportPanel';
import { ConfigPersistence } from './sidebar/ConfigPersistence';

export function Sidebar() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Wallpaper Cropper</h1>
      </div>

      <ImageUpload />
      <PresetPicker />
      <MonitorList />
      <GridSettings />
      <ExportPanel />
      <ConfigPersistence />

      <div className="flex-1" />
    </div>
  );
}
