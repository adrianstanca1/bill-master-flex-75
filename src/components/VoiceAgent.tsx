import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff,
  Activity,
  Bot,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useConversation } from '@11labs/react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceAgentProps {
  agentId?: string;
  onMessage?: (message: any) => void;
  className?: string;
}

export function VoiceAgent({ agentId, onMessage, className }: VoiceAgentProps) {
  const { toast } = useToast();
  const [isSetup, setIsSetup] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [currentAgentId, setCurrentAgentId] = useState(agentId || '');

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice agent connected');
      toast({
        title: "Voice Agent Connected",
        description: "You can now speak with the AI assistant",
      });
    },
    onDisconnect: () => {
      console.log('Voice agent disconnected');
      toast({
        title: "Voice Agent Disconnected",
        description: "Voice conversation has ended",
      });
    },
    onMessage: (message) => {
      console.log('Voice message:', message);
      onMessage?.(message);
    },
    onError: (error) => {
      console.error('Voice agent error:', error);
      toast({
        title: "Voice Agent Error",
        description: "There was an issue with the voice connection",
        variant: "destructive"
      });
    },
    clientTools: {
      // Business-specific tools the agent can invoke
      getProjectStatus: (params: { projectId: string }) => {
        console.log('Getting project status for:', params.projectId);
        return `Project ${params.projectId} is currently in progress with 75% completion.`;
      },
      calculateQuote: (params: { items: any[] }) => {
        const total = params.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        return `Quote total calculated: £${total.toLocaleString()}`;
      },
      scheduleReminder: (params: { title: string; date: string }) => {
        console.log('Scheduling reminder:', params);
        return `Reminder "${params.title}" scheduled for ${params.date}`;
      }
    }
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    // Check if ElevenLabs is configured
    const checkSetup = async () => {
      // In a real implementation, you'd check if the API key is configured
      // For now, we'll simulate this check
      setIsSetup(!!currentAgentId);
    };
    checkSetup();
  }, [currentAgentId]);

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice features",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleStartConversation = async () => {
    if (!currentAgentId) {
      toast({
        title: "Configuration Required",
        description: "Please configure your ElevenLabs Agent ID first",
        variant: "destructive"
      });
      return;
    }

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    try {
      // For demo purposes, we'll simulate starting the conversation
      // In a real implementation, you would need a proper conversation token
      // await conversation.startSession({ 
      //   conversationToken: currentAgentId, // This would be a proper token from your backend
      //   connectionType: "webrtc"
      // });
      
      // Mock implementation for demo
      console.log('Starting voice agent conversation (demo mode)');
      toast({
        title: "Voice Agent Started",
        description: "Voice agent conversation started (demo mode)",
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to voice agent. Check your configuration.",
        variant: "destructive"
      });
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    try {
      await conversation.setVolume({ volume: volume / 100 });
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'connected': return 'bg-emerald-100 text-emerald-800';
      case 'connecting': return 'bg-blue-100 text-blue-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isSetup) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Voice Agent Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              To enable voice agent functionality, you need to:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Get your ElevenLabs API key</li>
                <li>Create an agent in ElevenLabs dashboard</li>
                <li>Configure the agent ID below</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Agent ID</label>
              <input
                type="text"
                value={currentAgentId}
                onChange={(e) => setCurrentAgentId(e.target.value)}
                placeholder="Enter your ElevenLabs Agent ID"
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
            
            <Button 
              onClick={() => setIsSetup(true)} 
              disabled={!currentAgentId}
              className="w-full"
            >
              Setup Voice Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Voice Agent
          </div>
          <Badge className={getStatusBadgeColor()}>
            {status || 'disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className={cn("h-4 w-4", {
                "text-emerald-500 animate-pulse": status === 'connected',
                "text-blue-500 animate-spin": status === 'connecting',
                "text-gray-400": status === 'disconnected'
              })} />
              <span className="text-sm font-medium">
                {status === 'connected' ? 'Ready to talk' : 
                 status === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                AI Speaking...
              </Badge>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {status === 'disconnected' ? (
              <Button onClick={handleStartConversation} className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            ) : (
              <Button 
                onClick={handleEndConversation} 
                variant="destructive" 
                className="flex-1"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Conversation
              </Button>
            )}
          </div>

          {/* Voice Features */}
          {status === 'connected' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="70"
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              
              <Alert>
                <Mic className="h-4 w-4" />
                <AlertDescription>
                  Speak naturally to interact with the AI agent. It can help with:
                  <ul className="list-disc list-inside mt-1 text-xs space-y-0.5">
                    <li>Project status updates</li>
                    <li>Quote calculations</li>
                    <li>Scheduling reminders</li>
                    <li>Business advice and analytics</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}