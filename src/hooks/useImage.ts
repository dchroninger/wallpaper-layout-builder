import { useState, useEffect } from 'react';

export function useImage(url: string | null): [HTMLImageElement | null, 'loading' | 'loaded' | 'error'] {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!url) {
      setImage(null);
      setStatus('loading');
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setStatus('loaded');
    };
    img.onerror = () => {
      setImage(null);
      setStatus('error');
    };
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return [image, status];
}
