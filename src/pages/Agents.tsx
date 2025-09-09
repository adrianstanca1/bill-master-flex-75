import React from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { EnhancedAgentsDashboard } from "@/components/EnhancedAgentsDashboard";
import { VoiceAgent } from "@/components/VoiceAgent";
import { VoiceAgentConfig } from "@/components/VoiceAgentConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Mic, Zap, Settings, Workflow, Sparkles } from "lucide-react";
import { AgentWorkflowManager } from "@/components/AgentWorkflowManager";
import { AIAssistantHub } from "@/components/AIAssistantHub";



const Agents: React.FC = () => {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ASagents AI Hub",
    description: "Advanced AI agents for business automation, voice assistance, and workflow optimization.",
  };

  return (
    <>
      <ResponsiveLayout>
        <SEO title="AI Agents Hub | ASagents v1.1.0" description="Advanced AI agents for business automation, voice assistance, and workflow optimization." jsonLd={jsonLd} />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Agents Hub</h1>
            <p className="text-muted-foreground">
              Advanced AI-powered business automation and voice assistance
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="ai-hub" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Hub
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Agent
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="legacy" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Legacy Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <EnhancedAgentsDashboard />
            </TabsContent>

            <TabsContent value="ai-hub" className="space-y-6">
              <AIAssistantHub />
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              <AgentWorkflowManager />
            </TabsContent>

            <TabsContent value="voice" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" />
                    Voice Agent Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VoiceAgent />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <VoiceAgentConfig />
            </TabsContent>

            <TabsContent value="legacy" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>FundingBot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Legacy funding discovery tool. Use the enhanced dashboard for improved features.
                    </p>
                    <div className="text-center py-4 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Migrated to enhanced dashboard</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>RiskBot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Legacy risk analysis tool. Enhanced risk assessment available in the main dashboard.
                    </p>
                    <div className="text-center py-4 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Migrated to enhanced dashboard</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveLayout>
    </>
  );
};

export default Agents;
