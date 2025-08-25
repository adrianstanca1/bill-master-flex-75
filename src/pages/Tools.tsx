
import React from 'react';
import { SmartToolsPanel } from '@/components/SmartToolsPanel';
import { ToolManager } from '@/components/ToolManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Bot } from 'lucide-react';
import SEO from '@/components/SEO';

const Tools: React.FC = () => {
  return (
    <>
      <SEO 
        title="Tools | AS Agents" 
        description="Smart tools and AI-powered solutions for construction management"
      />
      <div className="container mx-auto p-6 space-y-6">
        <div className="cyber-card p-8 hover-glow">
          <h1 className="text-4xl font-bold text-gradient mb-3">Smart Tools</h1>
          <p className="text-muted-foreground text-lg">
            AI-powered tools and automation to streamline your workflow
          </p>
        </div>

        <Tabs defaultValue="smart-tools" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="smart-tools" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Smart Tools
            </TabsTrigger>
            <TabsTrigger value="tool-manager" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Tool Manager
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smart-tools" className="mt-6">
            <SmartToolsPanel />
          </TabsContent>

          <TabsContent value="tool-manager" className="mt-6">
            <ToolManager />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Tools;
