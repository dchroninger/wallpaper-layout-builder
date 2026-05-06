import { ImageUpload } from './sidebar/ImageUpload';
import { PresetPicker } from './sidebar/PresetPicker';
import { MonitorList } from './sidebar/MonitorList';
import { GridSettings } from './sidebar/GridSettings';
import { ExportPanel } from './sidebar/ExportPanel';
import { ConfigPersistence } from './sidebar/ConfigPersistence';

export function Sidebar() {
  return (
    <div className="overflow-y-auto flex flex-col h-full" style={{ color: 'var(--text)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Controls</h1>
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
