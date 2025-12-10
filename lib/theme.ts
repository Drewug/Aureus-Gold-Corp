import { ThemeSettings } from '../types';

export const DEFAULT_THEME: ThemeSettings = {
  colors: {
    background: '#0b0b0c',
    backgroundLight: '#1a1a1c',
    backgroundLighter: '#2a2a2e',
    primary: '#d4af37',
    primaryLight: '#f4cf57',
    primaryDim: '#c6a84b',
    text: '#f3f4f6'
  },
  fonts: {
    heading: '"Bree Serif", serif',
    body: 'Inter, sans-serif'
  },
  layout: {
    mode: 'boxed',
    radius: 4
  }
};

const hexToRgb = (hex: string) => {
    let c: any;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255].join(' ');
    }
    return '0 0 0';
}

export const applyTheme = (theme: ThemeSettings) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  // Colors (converted to RGB for Tailwind opacity support)
  root.style.setProperty('--color-charcoal', hexToRgb(theme.colors.background));
  root.style.setProperty('--color-charcoal-light', hexToRgb(theme.colors.backgroundLight));
  root.style.setProperty('--color-charcoal-lighter', hexToRgb(theme.colors.backgroundLighter));
  root.style.setProperty('--color-gold', hexToRgb(theme.colors.primary));
  root.style.setProperty('--color-gold-light', hexToRgb(theme.colors.primaryLight));
  root.style.setProperty('--color-gold-dim', hexToRgb(theme.colors.primaryDim));
  
  // Text color needs to be handled carefully if used with opacity, but usually simple hex is fine for simple text.
  // We'll use RGB for consistency if we add text-opacity.
  root.style.setProperty('--color-text-base', hexToRgb(theme.colors.text));

  // Fonts
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);

  // Layout
  root.style.setProperty('--radius', `${theme.layout.radius}px`);
  
  // Dynamic max-width for "7xl" container
  const maxWidth = theme.layout.mode === 'boxed' ? '80rem' : '100%';
  root.style.setProperty('--layout-max-width', maxWidth);
};

export const saveTheme = (theme: ThemeSettings) => {
  localStorage.setItem('aureus_theme', JSON.stringify(theme));
  applyTheme(theme);
};

export const getTheme = (): ThemeSettings => {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('aureus_theme');
  return stored ? { ...DEFAULT_THEME, ...JSON.parse(stored) } : DEFAULT_THEME;
};
