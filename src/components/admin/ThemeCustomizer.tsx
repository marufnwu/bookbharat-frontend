'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useConfig } from '@/contexts/ConfigContext';
import { contentApi } from '@/lib/api';
import { Palette, Save, RotateCcw, Download, Upload } from 'lucide-react';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-1">
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded cursor-pointer border-0 p-0"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  </div>
);

export default function ThemeCustomizer() {
  const { siteConfig, refreshConfig, applyTheme } = useConfig();
  const [themeColors, setThemeColors] = useState({
    primary_color: '#1e40af',
    secondary_color: '#f59e0b',
    accent_color: '#10b981',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    error_color: '#ef4444',
  });
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteConfig?.theme) {
      setThemeColors({
        primary_color: siteConfig.theme.primary_color,
        secondary_color: siteConfig.theme.secondary_color,
        accent_color: siteConfig.theme.accent_color,
        success_color: siteConfig.theme.success_color,
        warning_color: siteConfig.theme.warning_color,
        error_color: siteConfig.theme.error_color,
      });
    }
  }, [siteConfig]);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const response = await contentApi.getThemePresets();
      if (response.success) {
        setPresets(Object.entries(response.data).map(([key, value]) => ({
          id: key,
          ...value
        })));
      }
    } catch (error) {
      console.error('Failed to load theme presets:', error);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    const newColors = { ...themeColors, [key]: value };
    setThemeColors(newColors);
    // Apply theme changes in real-time for preview
    applyTheme(newColors);
  };

  const applyPreset = (preset: any) => {
    const newColors = {
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color,
      success_color: preset.success_color,
      warning_color: preset.warning_color,
      error_color: preset.error_color,
    };
    setThemeColors(newColors);
    applyTheme(newColors);
  };

  const saveTheme = async () => {
    if (!siteConfig) return;

    setIsSaving(true);
    try {
      const updatedConfig = {
        ...siteConfig,
        theme: {
          ...siteConfig.theme,
          ...themeColors,
        }
      };

      const response = await contentApi.updateSiteConfig(updatedConfig);
      
      if (response.success) {
        await refreshConfig();
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const resetTheme = () => {
    if (siteConfig?.theme) {
      const originalColors = {
        primary_color: siteConfig.theme.primary_color,
        secondary_color: siteConfig.theme.secondary_color,
        accent_color: siteConfig.theme.accent_color,
        success_color: siteConfig.theme.success_color,
        warning_color: siteConfig.theme.warning_color,
        error_color: siteConfig.theme.error_color,
      };
      setThemeColors(originalColors);
      applyTheme(originalColors);
    }
  };

  const exportTheme = () => {
    const themeExport = {
      name: 'Custom Theme',
      colors: themeColors,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(themeExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookbharat-theme.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.colors) {
          setThemeColors(imported.colors);
          applyTheme(imported.colors);
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Palette className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Theme Customizer</h1>
            <p className="text-muted-foreground">Customize your site's colors and appearance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetTheme}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={exportTheme}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <Button onClick={saveTheme} loading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Color Customization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <ColorInput
                  label="Primary Color"
                  value={themeColors.primary_color}
                  onChange={(value) => handleColorChange('primary_color', value)}
                />
                <ColorInput
                  label="Secondary Color"
                  value={themeColors.secondary_color}
                  onChange={(value) => handleColorChange('secondary_color', value)}
                />
                <ColorInput
                  label="Accent Color"
                  value={themeColors.accent_color}
                  onChange={(value) => handleColorChange('accent_color', value)}
                />
                <ColorInput
                  label="Success Color"
                  value={themeColors.success_color}
                  onChange={(value) => handleColorChange('success_color', value)}
                />
                <ColorInput
                  label="Warning Color"
                  value={themeColors.warning_color}
                  onChange={(value) => handleColorChange('warning_color', value)}
                />
                <ColorInput
                  label="Error Color"
                  value={themeColors.error_color}
                  onChange={(value) => handleColorChange('error_color', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button className="w-full">Primary Button</Button>
                  <Button variant="secondary" className="w-full">Secondary Button</Button>
                  <Button variant="outline" className="w-full">Outline Button</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 rounded-full text-sm bg-success text-success-foreground">
                    Success Badge
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm bg-warning text-warning-foreground">
                    Warning Badge
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm bg-destructive text-destructive-foreground">
                    Error Badge
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Sample Content</h3>
                  <p className="text-muted-foreground">
                    This is how your content will look with the current theme. 
                    The colors will automatically adjust throughout your site.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presets */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Theme Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{preset.name}</h4>
                  </div>
                  <div className="flex space-x-2">
                    {[
                      preset.primary_color,
                      preset.secondary_color,
                      preset.accent_color,
                      preset.success_color,
                      preset.warning_color,
                      preset.error_color,
                    ].map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}