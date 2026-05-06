import { useCallback, useRef } from 'react';
import { Icon } from '../icons/Icon';
import { useAppStore } from '../../store/appStore';

export function WallpaperPanelHeaderActions() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addWallpaper = useAppStore((s) => s.addWallpaper);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        addWallpaper(url, img.naturalWidth, img.naturalHeight, file.name);
      };
      img.src = url;
    },
    [addWallpaper]
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
      <button
        className="panel-iconbtn"
        onClick={() => inputRef.current?.click()}
        title="Upload wallpaper"
      >
        <Icon name="plus" size={11} />
      </button>
    </>
  );
}

export function WallpaperPanel() {
  const wallpapers = useAppStore((s) => s.wallpapers);
  const imageUrl = useAppStore((s) => s.imageUrl);
  const imageWidth = useAppStore((s) => s.imageWidth);
  const imageHeight = useAppStore((s) => s.imageHeight);
  const setImage = useAppStore((s) => s.setImage);
  const removeWallpaper = useAppStore((s) => s.removeWallpaper);
  const addWallpaper = useAppStore((s) => s.addWallpaper);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        addWallpaper(url, img.naturalWidth, img.naturalHeight, file.name);
      };
      img.src = url;
    },
    [addWallpaper]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {wallpapers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
          {wallpapers.map((w) => (
            <div
              key={w.id}
              onClick={() => setImage(w.url, w.width, w.height)}
              style={{
                aspectRatio: '21/9',
                borderRadius: 6,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                border: imageUrl === w.url ? '2px solid var(--accent)' : '1px solid var(--line)',
                boxShadow: imageUrl === w.url ? '0 0 0 3px var(--accent-glow)' : 'none',
              }}
            >
              <img
                src={w.url}
                alt={w.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span className="thumb-label">{w.width}×{w.height}</span>
              <button
                className="panel-iconbtn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWallpaper(w.id);
                }}
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 16,
                  height: 16,
                  background: 'rgba(0,0,0,.6)',
                  borderRadius: 4,
                  opacity: 0,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                title="Remove"
              >
                <Icon name="x" size={8} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Drop zone — always visible as an add target */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed var(--line-2)',
          borderRadius: 8,
          padding: wallpapers.length > 0 ? '12px 8px' : '20px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          color: 'var(--text-faint)',
          fontSize: 11,
        }}
      >
        {wallpapers.length > 0 ? 'Drop or click to add more' : 'Drop an image or click to upload'}
      </div>

      {imageUrl && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text)' }}>Active wallpaper</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
              {imageWidth}×{imageHeight}
            </div>
          </div>
          <span className="tag accent">LOADED</span>
        </div>
      )}
    </>
  );
}
