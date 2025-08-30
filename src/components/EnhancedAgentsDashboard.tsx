import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  MessageSquare, 
  Mic,
  Brain,
  Activity,
  Settings,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { AgentsDashboard } from '@/components/AgentsDashboard';
import { VoiceAgent } from '@/components/VoiceAgent';
import { AdvisorAgent } from '@/components/AdvisorAgent';
import AgentChat from '@/components/AgentChat';

interface AgentConversation {
  id: string;
  timestamp: string;
  type: 'text' | 'voice';
  agent: string;
  summary: string;
  status: 'completed' | 'active' | 'error';
}

export function EnhancedAgentsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [conversations, setConversations] = useState<AgentConversation[]>([
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'text',
      agent: 'Business Advisor',
      summary: 'Discussed Q1 revenue projections and growth strategies',
      status: 'completed'
    },
    {
      id: '2', 
      timestamp: '2024-01-15T09:15:00Z',
      type: 'voice',
      agent: 'Voice Assistant',
      summary: 'Reviewed project status and upcoming deadlines',
      status: 'completed'
    }
  ]);

  const handleNewMessage = (message: any) => {
    // Handle new messages from voice or text agents
    console.log('New agent message:', message);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced AI Agents Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Agent
              </TabsTrigger>
              <TabsTrigger value="advisor" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Advisor
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AgentsDashboard />
            </TabsContent>

            <TabsContent value="voice" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <VoiceAgent 
                  onMessage={handleNewMessage}
                  className="lg:col-span-2"
                />
                
                {/* Voice Agent Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Voice Commands</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>"Show me project status"</strong>
                        <p className="text-muted-foreground">Get updates on all active projects</p>
                      </div>
                      <div>
                        <strong>"Calculate quote for..."</strong>
                        <p className="text-muted-foreground">Quick quote calculations</p>
                      </div>
                      <div>
                        <strong>"Schedule a reminder..."</strong>
                        <p className="text-muted-foreground">Add tasks and reminders</p>
                      </div>
                      <div>
                        <strong>"What's my cash flow?"</strong>
                        <p className="text-muted-foreground">Financial insights and analysis</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advisor" className="space-y-6">
              <AdvisorAgent />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <AgentChat />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Agent Analytics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Interactions</span>
                        <Badge variant="secondary">2,847</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Voice Sessions</span>
                        <Badge variant="secondary">156</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Text Conversations</span>
                        <Badge variant="secondary">891</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Success Rate</span>
                        <Badge className="bg-emerald-100 text-emerald-800">94.2%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Project status</span>
                        <span className="text-muted-foreground">32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Financial reports</span>
                        <span className="text-muted-foreground">28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quote generation</span>
                        <span className="text-muted-foreground">19%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scheduling</span>
                        <span className="text-muted-foreground">21%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Response Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Voice Agent</span>
                        <Badge variant="outline">0.8s avg</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Text Agent</span>
                        <Badge variant="outline">1.2s avg</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Business Advisor</span>
                        <Badge variant="outline">2.1s avg</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conversation History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div key={conversation.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            {conversation.type === 'voice' ? 
                              <Mic className="h-4 w-4 text-primary" /> :
                              <MessageSquare className="h-4 w-4 text-primary" />
                            }
                          </div>
                          <div>
                            <div className="font-medium">{conversation.agent}</div>
                            <p className="text-sm text-muted-foreground">{conversation.summary}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conversation.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={conversation.status === 'completed' ? 'default' : 
                                 conversation.status === 'active' ? 'secondary' : 'destructive'}
                        >
                          {conversation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}