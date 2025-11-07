// Test file to verify theme preloader functionality
import { generateThemeScript, generateCriticalCSS } from './theme-preloader';

// Mock theme data for testing
const mockTheme = {
  primary_color: '#2563eb',
  secondary_color: '#64748b',
  accent_color: '#f59e0b',
  success_color: '#10b981',
  warning_color: '#f59e0b',
  error_color: '#ef4444',
  font_family: 'Inter, sans-serif'
};

describe('Theme Preloader', () => {
  test('generates theme script correctly', () => {
    const script = generateThemeScript(mockTheme);

    // Check if the script contains expected CSS property assignments
    expect(script).toContain('--primary');
    expect(script).toContain('--secondary');
    expect(script).toContain('--accent');
    expect(script).toContain('--success');
    expect(script).toContain('--warning');
    expect(script).toContain('--destructive');
    expect(script).toContain('Inter, sans-serif');
  });

  test('generates critical CSS correctly', () => {
    const css = generateCriticalCSS(mockTheme);

    // Check if CSS contains root variables
    expect(css).toContain(':root');
    expect(css).toContain('--primary');
    expect(css).toContain('--secondary');
    expect(css).toContain('--accent');

    // Check if CSS contains utility classes
    expect(css).toContain('.bg-primary');
    expect(css).toContain('.text-primary');
    expect(css).toContain('.border-primary');
  });

  test('handles null theme gracefully', () => {
    const script = generateThemeScript(null as any);
    const css = generateCriticalCSS(null as any);

    expect(script).toBe('');
    expect(css).toBe('');
  });

  test('handles empty theme gracefully', () => {
    const emptyTheme = {} as any;
    const script = generateThemeScript(emptyTheme);
    const css = generateCriticalCSS(emptyTheme);

    expect(script).toBe('');
    expect(css).toBe('');
  });
});