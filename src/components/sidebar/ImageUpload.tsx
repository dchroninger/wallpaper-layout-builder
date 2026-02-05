import { useCallback, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';

export function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setImage = useAppStore((s) => s.setImage);
  const clearImage = useAppStore((s) => s.clearImage);
  const imageUrl = useAppStore((s) => s.imageUrl);
  const imageWidth = useAppStore((s) => s.imageWidth);
  const imageHeight = useAppStore((s) => s.imageHeight);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImage(url, img.naturalWidth, img.naturalHeight);
      };
      img.src = url;
    },
    [setImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Image</h2>

      {!imageUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <p className="text-sm text-gray-600">Drop image here or click to upload</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            {imageWidth} x {imageHeight} px
          </div>
          <Button variant="secondary" size="sm" onClick={clearImage}>
            Remove Image
          </Button>
        </div>
      )}
    </div>
  );
}
