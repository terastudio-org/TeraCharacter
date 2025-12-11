'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Settings, Zap, Shield, Globe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getAvailableModels, getUnfilteredModels, getProviderStatus, testProviderConnection } from '@/app/actions/chat';
import type { ProviderModel, ProviderType } from '@/lib/provider-config';

interface ProviderSelectorProps {
  selectedModel?: string;
  onModelChange: (modelId: string) => void;
  selectedProvider?: ProviderType;
  onProviderChange?: (provider: ProviderType) => void;
  showUnfilteredOnly?: boolean;
  onShowUnfilteredOnlyChange?: (show: boolean) => void;
  className?: string;
}

export default function ProviderSelector({
  selectedModel,
  onModelChange,
  selectedProvider,
  onProviderChange,
  showUnfilteredOnly = false,
  onShowUnfilteredOnlyChange,
  className
}: ProviderSelectorProps) {
  const [availableModels, setAvailableModels] = useState<ProviderModel[]>([]);
  const [unfilteredModels, setUnfilteredModels] = useState<ProviderModel[]>([]);
  const [providerStatus, setProviderStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [models, unfiltered, status] = await Promise.all([
        getAvailableModels(),
        getUnfilteredModels(),
        getProviderStatus()
      ]);
      
      setAvailableModels(models);
      setUnfilteredModels(unfiltered);
      setProviderStatus(status);
    } catch (error) {
      console.error('Failed to load provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (provider: string) => {
    setTestingConnection(provider);
    try {
      const result = await testProviderConnection(provider);
      setProviderStatus(prev => ({
        ...prev,
        [provider]: result.status
      }));
    } catch (error) {
      console.error(`Failed to test ${provider} connection:`, error);
    } finally {
      setTestingConnection(null);
    }
  };

  const displayModels = showUnfilteredOnly ? unfilteredModels : availableModels;
  const groupedModels = displayModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<ProviderType, ProviderModel[]>);

  const getProviderIcon = (provider: ProviderType) => {
    switch (provider) {
      case 'openai': return <Shield className="w-4 h-4" />;
      case 'huggingface': return <Globe className="w-4 h-4" />;
      case 'groq': return <Zap className="w-4 h-4" />;
      case 'local': return <Settings className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getProviderBadgeColor = (provider: ProviderType) => {
    switch (provider) {
      case 'openai': return 'bg-green-100 text-green-800 border-green-200';
      case 'huggingface': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'groq': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'local': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (available: boolean) => {
    if (available) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Model Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading providers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          AI Model Provider
        </CardTitle>
        <CardDescription>
          Choose your preferred AI model and provider for character conversations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Status */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Provider Status</h4>
          <div className="grid gap-2">
            {Object.entries(providerStatus).map(([provider, status]) => (
              <div key={provider} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  {getProviderIcon(provider as ProviderType)}
                  <span className="font-medium capitalize">{provider}</span>
                  {getStatusIcon(status.available)}
                </div>
                <div className="flex items-center gap-2">
                  {status.available && (
                    <Badge variant="secondary" className={getProviderBadgeColor(provider as ProviderType)}>
                      {status.models} models
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestConnection(provider)}
                    disabled={testingConnection === provider}
                  >
                    {testingConnection === provider ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      'Test'
                    )}
                  </Button>
                </div>
                {status.error && (
                  <div className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {status.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Unfiltered Content Toggle */}
        {onShowUnfilteredOnlyChange && (
          <div className="flex items-center space-x-2">
            <Switch
              id="unfiltered-only"
              checked={showUnfilteredOnly}
              onCheckedChange={onShowUnfilteredOnlyChange}
            />
            <Label htmlFor="unfiltered-only" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Show unfiltered models only
            </Label>
          </div>
        )}

        {/* Model Selection */}
        <div className="space-y-3">
          <Label>Select Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a model..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedModels).map(([provider, models]) => (
                <div key={provider}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    {getProviderIcon(provider as ProviderType)}
                    {provider.toUpperCase()} MODELS
                  </div>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="pl-6">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {model.contextLength.toLocaleString()} tokens
                            {model.supportsStreaming && ' • Streaming'}
                            {model.supportsFunctionCalling && ' • Function Calling'}
                          </div>
                        </div>
                        {supportsUnfiltered(model.id) && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Unfiltered
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  <Separator className="my-1" />
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Info */}
        {selectedModel && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {(() => {
                const model = displayModels.find(m => m.id === selectedModel);
                if (!model) return '';
                
                const providerConfig = providerStatus[model.provider];
                return `${model.name} (${model.provider}) - ${model.contextLength.toLocaleString()} tokens max context`;
              })()}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to check if a model supports unfiltered content
function supportsUnfiltered(modelId: string): boolean {
  return unfilteredModels.some(model => model.id === modelId);
}