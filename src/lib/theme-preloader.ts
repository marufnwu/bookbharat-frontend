export interface ServerThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  font_family?: string;
}

export async function getServerThemeConfig(): Promise<ServerThemeConfig | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${apiUrl}/config/site`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.theme || null;
    }
  } catch (error) {
    console.warn('Failed to load server theme config:', error);
  }
  return null;
}

export function generateThemeScript(theme: ServerThemeConfig): string {
  if (!theme) return '';

  // Helper function to convert hex to HSL
  const hexToHsl = (hex: string): string => {
    // Remove the hash if present
    hex = hex.replace('#', '');

    // Parse the hex values
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    // Convert to percentage and degrees
    const hDeg = Math.round(h * 360);
    const sPerc = Math.round(s * 100);
    const lPerc = Math.round(l * 100);

    return `${hDeg} ${sPerc}% ${lPerc}%`;
  };

  // Generate theme application script
  return `
    (function() {
      if (typeof document !== 'undefined' && document.documentElement) {
        const root = document.documentElement;
        try {
          root.style.setProperty('--primary', '${hexToHsl(theme.primary_color)}');
          root.style.setProperty('--secondary', '${hexToHsl(theme.secondary_color)}');
          root.style.setProperty('--accent', '${hexToHsl(theme.accent_color)}');
          root.style.setProperty('--success', '${hexToHsl(theme.success_color)}');
          root.style.setProperty('--warning', '${hexToHsl(theme.warning_color)}');
          root.style.setProperty('--destructive', '${hexToHsl(theme.error_color)}');
          ${theme.font_family ? `root.style.setProperty('--font-sans', '${theme.font_family}');` : ''}
        } catch (error) {
          console.warn('Failed to apply theme:', error);
        }
      }
    })();
  `;
}

export function generateCriticalCSS(theme: ServerThemeConfig): string {
  if (!theme) return '';

  // Helper function to convert hex to HSL (same as above)
  const hexToHsl = (hex: string): string => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    const hDeg = Math.round(h * 360);
    const sPerc = Math.round(s * 100);
    const lPerc = Math.round(l * 100);

    return `${hDeg} ${sPerc}% ${lPerc}%`;
  };

  const colors = {
    primary: hexToHsl(theme.primary_color),
    secondary: hexToHsl(theme.secondary_color),
    accent: hexToHsl(theme.accent_color),
    success: hexToHsl(theme.success_color),
    warning: hexToHsl(theme.warning_color),
    destructive: hexToHsl(theme.error_color),
  };

  return `
    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --success: ${colors.success};
      --warning: ${colors.warning};
      --destructive: ${colors.destructive};
      ${theme.font_family ? `--font-sans: ${theme.font_family};` : ''}
    }

    /* Apply theme immediately to prevent flash */
    body {
      color: hsl(var(--foreground));
      background: hsl(var(--background));
    }

    .bg-primary { background-color: hsl(var(--primary)); }
    .text-primary { color: hsl(var(--primary)); }
    .border-primary { border-color: hsl(var(--primary)); }

    .bg-secondary { background-color: hsl(var(--secondary)); }
    .text-secondary { color: hsl(var(--secondary)); }
    .border-secondary { border-color: hsl(var(--secondary)); }

    .bg-accent { background-color: hsl(var(--accent)); }
    .text-accent { color: hsl(var(--accent)); }
    .border-accent { border-color: hsl(var(--accent)); }
  `;
}