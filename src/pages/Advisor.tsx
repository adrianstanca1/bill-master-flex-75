
import React from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

import { AgentDashboard } from "@/components/AgentDashboard";
import { AdvisorAgent } from "@/components/AdvisorAgent";

const Advisor: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <ResponsiveLayout>
        <SEO 
          title="AI Business Advisor | AS Agents" 
          description="Get intelligent business advice and insights from our AI advisor" 
        />
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">AI Business Advisor</h1>
            <p className="text-muted-foreground mt-2">
              Get intelligent insights and recommendations for your construction business
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <AgentDashboard 
                agentId="advisor"
                agentName="Business Advisor"
                agentDescription="Provides strategic business insights and recommendations"
              />
            </div>
            <div>
              <AdvisorAgent />
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    </div>
  );
};

export default Advisor;
