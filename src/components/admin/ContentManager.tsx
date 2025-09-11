'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfig } from '@/contexts/ConfigContext';
import { contentApi } from '@/lib/api';
import { 
  Settings, 
  Home, 
  Navigation, 
  Image, 
  FileText, 
  Save, 
  Upload,
  Trash2,
  Plus,
  Edit3
} from 'lucide-react';

interface MediaFile {
  id: number;
  url: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
}

export default function ContentManager() {
  const { siteConfig, homepageConfig, navigationConfig, refreshConfig } = useConfig();
  const [activeTab, setActiveTab] = useState('site');
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Site Configuration State
  const [siteForm, setSiteForm] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    features: {},
    social: {}
  });

  // Homepage Configuration State
  const [homepageForm, setHomepageForm] = useState({
    hero_section: {
      enabled: true,
      title: '',
      subtitle: '',
      background_image: '',
      cta_primary: { text: '', url: '', style: 'primary' },
      cta_secondary: { text: '', url: '', style: 'outline' }
    },
    newsletter: {
      enabled: true,
      title: '',
      subtitle: '',
      placeholder: '',
      button_text: ''
    }
  });

  // Load initial data
  useEffect(() => {
    if (siteConfig) {
      setSiteForm({
        name: siteConfig.site.name,
        description: siteConfig.site.description,
        contact_email: siteConfig.site.contact_email,
        contact_phone: siteConfig.site.contact_phone,
        features: siteConfig.features,
        social: siteConfig.social
      });
    }
  }, [siteConfig]);

  useEffect(() => {
    if (homepageConfig) {
      setHomepageForm({
        hero_section: homepageConfig.hero_section,
        newsletter: homepageConfig.newsletter
      });
    }
  }, [homepageConfig]);

  useEffect(() => {
    if (activeTab === 'media') {
      loadMediaFiles();
    }
  }, [activeTab]);

  const loadMediaFiles = async () => {
    try {
      const response = await contentApi.getMediaLibrary();
      if (response.success) {
        setMediaFiles(response.data);
      }
    } catch (error) {
      console.error('Failed to load media files:', error);
    }
  };

  const saveSiteConfig = async () => {
    if (!siteConfig) return;
    
    setLoading(true);
    try {
      const updatedConfig = {
        ...siteConfig,
        site: {
          ...siteConfig.site,
          name: siteForm.name,
          description: siteForm.description,
          contact_email: siteForm.contact_email,
          contact_phone: siteForm.contact_phone,
        },
        features: siteForm.features,
        social: siteForm.social
      };

      const response = await contentApi.updateSiteConfig(updatedConfig);
      
      if (response.success) {
        await refreshConfig();
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save site config:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  const saveHomepageConfig = async () => {
    if (!homepageConfig) return;
    
    setLoading(true);
    try {
      const updatedConfig = {
        ...homepageConfig,
        hero_section: homepageForm.hero_section,
        newsletter: homepageForm.newsletter
      };

      const response = await contentApi.updateHomepageConfig(updatedConfig);
      
      if (response.success) {
        await refreshConfig();
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save homepage config:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const type = file.type.startsWith('image/') ? 'image' : 'document';
        
        await contentApi.uploadMedia(file, type);
      }
      
      await loadMediaFiles();
      // Show success message
    } catch (error) {
      console.error('Failed to upload media:', error);
      // Show error message
    } finally {
      setUploadingMedia(false);
      // Reset input
      event.target.value = '';
    }
  };

  const deleteMedia = async (id: number) => {
    try {
      await contentApi.deleteMedia(id);
      await loadMediaFiles();
      // Show success message
    } catch (error) {
      console.error('Failed to delete media:', error);
      // Show error message
    }
  };

  const copyMediaUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // Show success message
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Manager</h1>
            <p className="text-muted-foreground">Manage your site's content and settings</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="site" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Site Settings</span>
          </TabsTrigger>
          <TabsTrigger value="homepage" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Homepage</span>
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center space-x-2">
            <Navigation className="h-4 w-4" />
            <span>Navigation</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>Media</span>
          </TabsTrigger>
        </TabsList>

        {/* Site Settings */}
        <TabsContent value="site" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Name
                </label>
                <Input
                  value={siteForm.name}
                  onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                  placeholder="Your site name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Description
                </label>
                <Textarea
                  value={siteForm.description}
                  onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })}
                  placeholder="Brief description of your site"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={siteForm.contact_email}
                    onChange={(e) => setSiteForm({ ...siteForm, contact_email: e.target.value })}
                    placeholder="support@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contact Phone
                  </label>
                  <Input
                    value={siteForm.contact_phone}
                    onChange={(e) => setSiteForm({ ...siteForm, contact_phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <Button onClick={saveSiteConfig} loading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Site Settings
              </Button>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {siteConfig && Object.entries(siteConfig.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => 
                        setSiteForm({
                          ...siteForm,
                          features: { ...siteForm.features, [key]: checked }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Content */}
        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Enable Hero Section
                </label>
                <Switch
                  checked={homepageForm.hero_section.enabled}
                  onCheckedChange={(checked) => 
                    setHomepageForm({
                      ...homepageForm,
                      hero_section: { ...homepageForm.hero_section, enabled: checked }
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hero Title
                </label>
                <Input
                  value={homepageForm.hero_section.title}
                  onChange={(e) => setHomepageForm({
                    ...homepageForm,
                    hero_section: { ...homepageForm.hero_section, title: e.target.value }
                  })}
                  placeholder="Your main headline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hero Subtitle
                </label>
                <Textarea
                  value={homepageForm.hero_section.subtitle}
                  onChange={(e) => setHomepageForm({
                    ...homepageForm,
                    hero_section: { ...homepageForm.hero_section, subtitle: e.target.value }
                  })}
                  placeholder="Supporting text for your headline"
                  rows={3}
                />
              </div>

              <Button onClick={saveHomepageConfig} loading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Homepage Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation */}
        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Navigation management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Manager */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Media Library</CardTitle>
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <Button loading={uploadingMedia} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </span>
                  </Button>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {mediaFiles.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No media files uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => copyMediaUrl(file.url)}
                        >
                          Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMedia(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}