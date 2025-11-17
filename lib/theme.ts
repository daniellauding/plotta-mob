/**
 * Plotta Mobile Theme System
 * Matches the web app's HSL-based design system
 */

export type ColorScheme = 'light' | 'dark';

// HSL color values matching web app
const colors = {
  light: {
    background: 'hsl(0, 0%, 100%)',        // white
    foreground: 'hsl(0, 0%, 0%)',          // black
    card: 'hsl(0, 0%, 98%)',               // very light gray
    cardForeground: 'hsl(0, 0%, 0%)',
    primary: 'hsl(0, 0%, 0%)',             // black
    primaryForeground: 'hsl(0, 0%, 100%)', // white
    secondary: 'hsl(0, 0%, 96%)',          // light gray
    secondaryForeground: 'hsl(0, 0%, 0%)',
    muted: 'hsl(0, 0%, 96%)',
    mutedForeground: 'hsl(0, 0%, 40%)',
    border: 'hsl(0, 0%, 90%)',
    input: 'hsl(0, 0%, 90%)',
    ring: 'hsl(0, 0%, 0%)',
    destructive: 'hsl(0, 70%, 50%)',       // red
    destructiveForeground: 'hsl(0, 0%, 100%)',
  },
  dark: {
    background: 'hsl(0, 0%, 5%)',          // very dark gray
    foreground: 'hsl(0, 0%, 100%)',        // white
    card: 'hsl(0, 0%, 8%)',                // dark gray
    cardForeground: 'hsl(0, 0%, 100%)',
    primary: 'hsl(0, 0%, 100%)',           // white
    primaryForeground: 'hsl(0, 0%, 0%)',   // black
    secondary: 'hsl(0, 0%, 10%)',
    secondaryForeground: 'hsl(0, 0%, 100%)',
    muted: 'hsl(0, 0%, 15%)',
    mutedForeground: 'hsl(0, 0%, 60%)',
    border: 'hsl(0, 0%, 20%)',
    input: 'hsl(0, 0%, 20%)',
    ring: 'hsl(0, 0%, 100%)',
    destructive: 'hsl(0, 70%, 50%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
  },
};

// Sticky note color options (8 colors matching web)
export const STICKY_COLORS = {
  default: {
    value: 'default',
    label: 'Default',
    hsl: 'var(--card)', // will be resolved to actual card color
    light: 'hsl(0, 0%, 98%)',
    dark: 'hsl(0, 0%, 8%)',
  },
  yellow: {
    value: 'yellow',
    label: 'Yellow',
    hsl: 'hsl(45, 85%, 70%)',
    light: 'hsl(45, 85%, 70%)',
    dark: 'hsl(45, 85%, 70%)',
  },
  red: {
    value: 'red',
    label: 'Red',
    hsl: 'hsl(0, 75%, 65%)',
    light: 'hsl(0, 75%, 65%)',
    dark: 'hsl(0, 75%, 65%)',
  },
  blue: {
    value: 'blue',
    label: 'Blue',
    hsl: 'hsl(212, 80%, 70%)',
    light: 'hsl(212, 80%, 70%)',
    dark: 'hsl(212, 80%, 70%)',
  },
  green: {
    value: 'green',
    label: 'Green',
    hsl: 'hsl(142, 60%, 65%)',
    light: 'hsl(142, 60%, 65%)',
    dark: 'hsl(142, 60%, 65%)',
  },
  purple: {
    value: 'purple',
    label: 'Purple',
    hsl: 'hsl(270, 60%, 72%)',
    light: 'hsl(270, 60%, 72%)',
    dark: 'hsl(270, 60%, 72%)',
  },
  orange: {
    value: 'orange',
    label: 'Orange',
    hsl: 'hsl(25, 85%, 68%)',
    light: 'hsl(25, 85%, 68%)',
    dark: 'hsl(25, 85%, 68%)',
  },
  pink: {
    value: 'pink',
    label: 'Pink',
    hsl: 'hsl(330, 70%, 75%)',
    light: 'hsl(330, 70%, 75%)',
    dark: 'hsl(330, 70%, 75%)',
  },
} as const;

export type StickyColorValue = keyof typeof STICKY_COLORS;

// Convert HSL string to RGB hex for React Native
function hslToHex(hsl: string): string {
  // Extract h, s, l values from hsl(h, s%, l%) format
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return '#000000';

  let h = parseInt(match[1]) / 360;
  let s = parseInt(match[2]) / 100;
  let l = parseInt(match[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Theme object with actual hex colors for React Native
export const createTheme = (colorScheme: ColorScheme) => {
  const themeColors = colors[colorScheme];

  return {
    colors: {
      background: hslToHex(themeColors.background),
      foreground: hslToHex(themeColors.foreground),
      card: hslToHex(themeColors.card),
      cardForeground: hslToHex(themeColors.cardForeground),
      primary: hslToHex(themeColors.primary),
      primaryForeground: hslToHex(themeColors.primaryForeground),
      secondary: hslToHex(themeColors.secondary),
      secondaryForeground: hslToHex(themeColors.secondaryForeground),
      muted: hslToHex(themeColors.muted),
      mutedForeground: hslToHex(themeColors.mutedForeground),
      border: hslToHex(themeColors.border),
      input: hslToHex(themeColors.input),
      ring: hslToHex(themeColors.ring),
      destructive: hslToHex(themeColors.destructive),
      destructiveForeground: hslToHex(themeColors.destructiveForeground),
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
    typography: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  };
};

// Get sticky note color as hex
export const getStickyColor = (
  color: StickyColorValue,
  colorScheme: ColorScheme = 'light'
): string => {
  const stickyColor = STICKY_COLORS[color];
  if (!stickyColor) return hslToHex(STICKY_COLORS.default[colorScheme]);

  if (color === 'default') {
    return hslToHex(stickyColor[colorScheme]);
  }

  return hslToHex(stickyColor.hsl);
};

// Default themes
export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');
