import type { SVGProps } from 'react';

export type IconName =
  | 'cursor' | 'move' | 'frame' | 'plus' | 'minus' | 'grid' | 'magnet'
  | 'sun' | 'moon' | 'image' | 'download' | 'upload' | 'plus-square'
  | 'monitor' | 'layers' | 'sliders' | 'save' | 'copy' | 'trash'
  | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'x' | 'more'
  | 'chevron-down' | 'rotate' | 'fit' | 'check' | 'history' | 'wand';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 14, strokeWidth = 1.6, ...props }: IconProps) {
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  };

  switch (name) {
    case 'cursor':
      return <svg {...common}><path d="M4 4l6 14 2.5-5.5L18 10z" /></svg>;
    case 'move':
      return <svg {...common}><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20" /></svg>;
    case 'frame':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case 'minus':
      return <svg {...common}><path d="M5 12h14" /></svg>;
    case 'grid':
      return <svg {...common}><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>;
    case 'magnet':
      return <svg {...common}><path d="M5 3v9a7 7 0 0014 0V3M5 9h4M15 9h4" /></svg>;
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
    case 'moon':
      return <svg {...common}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>;
    case 'image':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
    case 'download':
      return <svg {...common}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>;
    case 'upload':
      return <svg {...common}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>;
    case 'plus-square':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" /></svg>;
    case 'monitor':
      return <svg {...common}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
    case 'layers':
      return <svg {...common}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
    case 'sliders':
      return <svg {...common}><path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></svg>;
    case 'save':
      return <svg {...common}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>;
    case 'copy':
      return <svg {...common}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
    case 'trash':
      return <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>;
    case 'lock':
      return <svg {...common}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
    case 'unlock':
      return <svg {...common}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" /></svg>;
    case 'eye':
      return <svg {...common}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'eye-off':
      return <svg {...common}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 01-4.24-4.24M1 1l22 22" /></svg>;
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12" /></svg>;
    case 'more':
      return <svg {...common}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
    case 'chevron-down':
      return <svg {...common}><path d="M6 9l6 6 6-6" /></svg>;
    case 'rotate':
      return <svg {...common}><path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8" /></svg>;
    case 'fit':
      return <svg {...common}><path d="M4 9V5a1 1 0 011-1h4M15 4h4a1 1 0 011 1v4M20 15v4a1 1 0 01-1 1h-4M9 20H5a1 1 0 01-1-1v-4" /></svg>;
    case 'check':
      return <svg {...common}><path d="M5 12l5 5L20 7" /></svg>;
    case 'history':
      return <svg {...common}><path d="M3 12a9 9 0 109-9 9.74 9.74 0 00-6.74 2.74L3 8" /><path d="M3 3v5h5M12 7v5l4 2" /></svg>;
    case 'wand':
      return <svg {...common}><path d="M15 4V2M15 16v-2M8 9H6M22 9h-2M17.8 11.8l1.4 1.4M3.8 13.2l1.4-1.4M17.8 6.2l1.4-1.4M14 14L3 21" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>;
  }
}
