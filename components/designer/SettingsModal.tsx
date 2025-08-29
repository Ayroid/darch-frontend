"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Settings,
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Globe,
  Zap
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle, // ✅ added
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region?: string;
}

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('aws');
  const [credentials, setCredentials] = useState<AWSCredentials>({
    accessKeyId: '',
    secretAccessKey: '',
    sessionToken: '',
    region: 'us-east-1'
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const settingsTabs: SettingsTab[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'editor', label: 'Editor', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'hotkeys', label: 'Hotkeys', icon: Zap },
    { id: 'aws', label: 'AWS Configuration', icon: Database, category: 'Integration' },
    { id: 'api', label: 'API Settings', icon: Globe, category: 'Integration' },
    { id: 'account', label: 'Account', icon: User, category: 'Account' },
    { id: 'notifications', label: 'Notifications', icon: Bell, category: 'Account' },
    { id: 'security', label: 'Security', icon: Shield, category: 'Account' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadCredentials();
    }
  }, [isOpen]);

  const loadCredentials = () => {
    try {
      const storedCredentials = localStorage.getItem('darch-aws-credentials');
      if (storedCredentials) {
        setCredentials(JSON.parse(storedCredentials));
      }
    } catch (err) {
      console.error('Failed to load credentials:', err);
    }
  };

  const handleInputChange = (field: keyof AWSCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSaved(false);
    setError('');
    try {
      if (!credentials.accessKeyId || !credentials.secretAccessKey) {
        throw new Error('Access Key ID and Secret Access Key are required');
      }
      localStorage.setItem('darch-aws-credentials', JSON.stringify(credentials));

      // Download credentials backup
      const blob = new Blob([JSON.stringify(credentials, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'darch-aws-credentials.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCredentials = () => {
    setCredentials({ accessKeyId: '', secretAccessKey: '', sessionToken: '', region: 'us-east-1' });
    localStorage.removeItem('darch-aws-credentials');
    setSaved(false);
    setError('');
  };

  const regions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-east-2', label: 'US East (Ohio)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'aws':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                AWS Configuration
              </CardTitle>
              <CardDescription>
                Configure your AWS credentials for cloud integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Access Key ID */}
              <div className="space-y-2">
                <Label htmlFor="accessKeyId" className="flex items-center gap-1">
                  Access Key ID
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </Label>
                <Input
                  id="accessKeyId"
                  type="text"
                  value={credentials.accessKeyId}
                  onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>

              {/* Secret Access Key */}
              <div className="space-y-2">
                <Label htmlFor="secretAccessKey" className="flex items-center gap-1">
                  Secret Access Key
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="secretAccessKey"
                    type={showSecretKey ? "text" : "password"}
                    value={credentials.secretAccessKey}
                    onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Session Token */}
              <div className="space-y-2">
                <Label htmlFor="sessionToken" className="flex items-center gap-1">
                  Session Token
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </Label>
                <Input
                  id="sessionToken"
                  type="text"
                  value={credentials.sessionToken}
                  onChange={(e) => handleInputChange('sessionToken', e.target.value)}
                  placeholder="For temporary credentials only"
                />
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="region">Default Region</Label>
                <Select
                  value={credentials.region}
                  onValueChange={(value) => handleInputChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Save Credentials'}
                </Button>
                <Button onClick={handleClearCredentials} variant="outline">
                  Clear
                </Button>
              </div>

              {/* Status Messages */}
              {saved && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    ✓ Credentials saved successfully and downloaded as backup
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>✗ {error}</AlertDescription>
                </Alert>
              )}
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Security Note:</strong> Credentials are stored locally in your
                  browser and saved as a backup file. In production, use more secure credential
                  management.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case 'general':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure general application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes as you work
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Default file format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 'appearance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select defaultValue="dark">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing for a more compact interface
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                This settings panel is under development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                More configuration options will be available in future updates.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const groupedTabs = settingsTabs.reduce((groups, tab) => {
    const category = tab.category || 'Options';
    if (!groups[category]) groups[category] = [];
    groups[category].push(tab);
    return groups;
  }, {} as Record<string, SettingsTab[]>);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full h-[90vh] p-0 overflow-hidden">
        {/* ✅ Accessibility fix */}
        <DialogTitle className="sr-only">Settings</DialogTitle>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {Object.entries(groupedTabs).map(([category, tabs]) => (
                  <div key={category} className="mb-6">
                    {category !== 'Options' && (
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        {category}
                      </div>
                    )}
                    <div className="space-y-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                              activeTab === tab.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 mt-10">{renderTabContent()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
