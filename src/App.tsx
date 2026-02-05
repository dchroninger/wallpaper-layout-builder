import { ImageCanvas } from './components/canvas/ImageCanvas';
import { Sidebar } from './components/Sidebar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts();

  return (
    <div className="h-full flex">
      <ImageCanvas />
      <Sidebar />
    </div>
  );
}

export default App;
