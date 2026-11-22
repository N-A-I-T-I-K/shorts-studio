export type Theme = {
  id: string;
  label: string;
  palette: Array<[string, string]>;
  accent: string;
  secondary: string;
  glow: string;
  bgStyle: number;
  font: string;
  photoTint: string;
  photoOpacity: number;
  motion: number;
  character: number;
  card: number;
};

const ACCENTS = [
  '#FFE600', // electric yellow
  '#00E5FF', // cyan
  '#FF4D6D', // hot pink
  '#7CFF6B', // acid green
  '#FF9F1C', // amber
  '#B388FF', // violet
  '#00FFA3', // mint
  '#FF6B00', // orange
];

const FONTS = [
  'Montserrat, "Arial Black", Arial, sans-serif',
  'Impact, "Arial Black", Arial, sans-serif',
  '"Trebuchet MS", "Arial Black", Arial, sans-serif',
  '"Courier New", "Arial Black", monospace',
  'Verdana, "Arial Black", Arial, sans-serif',
];

const cache = new Map<string, Theme>();

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hsl(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  return `hsl(${hue}, ${s}%, ${l}%)`;
}

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function titleCase(id: string): string {
  return id
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Builds a deterministic, unique visual identity from any string.
 * Any theme name -> a stable palette, accent, background style and font.
 * This means every script can define its own theme without touching code.
 */
export function getTheme(id?: string | null): Theme {
  const key = (id || 'story').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'story';
  const hit = cache.get(key);
  if (hit) return hit;

  const h = hashString(key);
  const base = h % 360;
  const palette: Array<[string, string]> = [];
  for (let k = 0; k < 8; k++) {
    const hue = (base + k * 27 + ((h >>> (k % 9)) % 19)) % 360;
    const sat = 54 + ((h >>> (k % 6)) % 20);
    const l1 = 8 + (k % 3);
    const l2 = 21 + ((h >>> (k % 5)) % 13);
    palette.push([hsl(hue, sat, l1), hsl(hue + 18, sat, l2)]);
  }

  const accent = ACCENTS[(h >>> 4) % ACCENTS.length];
  const secondary = hsl(base + 150, 80, 62);
  const theme: Theme = {
    id: key,
    label: titleCase(key),
    palette,
    accent,
    secondary,
    glow: rgba(accent, 0.55),
    bgStyle: (h >>> 7) % 8,
    font: FONTS[(h >>> 11) % FONTS.length],
    photoTint: hsl(base + 200, 60, 6),
    photoOpacity: 0.22 + ((h >>> 13) % 9) / 100,
    motion: (h >>> 17) % 4,
    character: (h >>> 19) % 4,
    card: (h >>> 21) % 3,
  };
  cache.set(key, theme);
  return theme;
}
