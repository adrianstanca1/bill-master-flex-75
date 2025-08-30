import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, TestTube, Mic, VolumeX } from 'lucide-react';

interface VoiceConfig {
  apiKey: string;
  agentId: string;
  voiceId: string;
  model: string;
  language: string;
  prompt: string;
  firstMessage: string;
}

export function VoiceAgentConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<VoiceConfig>({
    apiKey: '',
    agentId: '',
    voiceId: 'Aria', // Default voice
    model: 'eleven_turbo_v2_5',
    language: 'en',
    prompt: 'You are a helpful business assistant for ASagents. Help users with project management, financial queries, and business operations.',
    firstMessage: 'Hello! I\'m your ASagents AI assistant. How can I help you today?'
  });

  const [isConfigValid, setIsConfigValid] = useState(false);

  const voices = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Warm, professional' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Confident, authoritative' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Clear, friendly' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Calm, supportive' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Energetic, engaging' }
  ];

  const models = [
    { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'High quality, low latency (32 languages)' },
    { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Most lifelike, 29 languages' },
    { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'English only, fastest' }
  ];

  const handleConfigChange = (field: keyof VoiceConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    
    // Validate configuration
    const isValid = newConfig.apiKey.length > 0 && newConfig.agentId.length > 0;
    setIsConfigValid(isValid);
  };

  const saveConfiguration = () => {
    if (!isConfigValid) {
      toast({
        title: "Configuration Incomplete",
        description: "Please provide both API Key and Agent ID",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage for demo purposes
    localStorage.setItem('voiceAgentConfig', JSON.stringify(config));
    
    toast({
      title: "Configuration Saved",
      description: "Voice agent settings have been saved successfully",
    });
  };

  const testConfiguration = () => {
    if (!isConfigValid) {
      toast({
        title: "Cannot Test",
        description: "Complete the configuration first",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Test Connection",
      description: "Voice agent configuration test initiated",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Voice Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure ElevenLabs voice agent settings for your business assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Configuration */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="apiKey">ElevenLabs API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from ElevenLabs dashboard
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentId">Agent ID</Label>
              <Input
                id="agentId"
                placeholder="agent_..."
                value={config.agentId}
                onChange={(e) => handleConfigChange('agentId', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Create an agent in ElevenLabs UI
              </p>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label>Voice Selection</Label>
            <Select value={config.voiceId} onValueChange={(value) => handleConfigChange('voiceId', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span>{voice.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {voice.description}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select value={config.model} onValueChange={(value) => handleConfigChange('model', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="space-y-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={config.language} onValueChange={(value) => handleConfigChange('language', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Behavior */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Agent Prompt</Label>
              <Textarea
                id="prompt"
                rows={4}
                placeholder="Define how your agent should behave..."
                value={config.prompt}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstMessage">First Message</Label>
              <Input
                id="firstMessage"
                placeholder="Initial greeting message..."
                value={config.firstMessage}
                onChange={(e) => handleConfigChange('firstMessage', e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={saveConfiguration} disabled={!isConfigValid}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" onClick={testConfiguration} disabled={!isConfigValid}>
              <TestTube className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </div>

          {!isConfigValid && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Setup Required:</strong> Please provide your ElevenLabs API key and Agent ID to enable voice features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">1</Badge>
              <div>
                <p className="font-medium">Create ElevenLabs Account</p>
                <p className="text-muted-foreground">
                  Sign up at elevenlabs.io and get your API key from the dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">2</Badge>
              <div>
                <p className="font-medium">Create Conversational Agent</p>
                <p className="text-muted-foreground">
                  Use the ElevenLabs UI to create a new conversational agent
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">3</Badge>
              <div>
                <p className="font-medium">Configure Settings</p>
                <p className="text-muted-foreground">
                  Enter your API key and Agent ID in the form above
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">4</Badge>
              <div>
                <p className="font-medium">Test & Deploy</p>
                <p className="text-muted-foreground">
                  Test the configuration and start using your voice assistant
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}