
import React from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { EnhancedDashboardGrid } from "@/components/EnhancedDashboardGrid";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { QuickStatsGrid } from "@/components/QuickStatsGrid";
import { RemindersWidget } from "@/components/RemindersWidget";
import { GuestBanner } from "@/components/GuestBanner";
import { SecurityQuickFix } from "@/components/SecurityQuickFix";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Activity, Zap } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const Dashboard: React.FC = () => {
  return (
    <>
      <SEO 
        title="Dashboard | AS Agents" 
        description="Your construction business dashboard with real-time metrics, project tracking, and team management tools."
      />
      <ResponsiveLayout>
        <div className="space-y-8 animate-fade-in">
          <GuestBanner />
          <SecurityQuickFix />
          
          <div className="cyber-card p-8 hover-glow">
            <h1 className="text-4xl font-bold text-gradient mb-3">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Command center for your construction business operations
            </p>
          </div>

          <div className="cyber-card p-6 hover-glow">
            <h2 className="text-lg font-semibold mb-3">Theme</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a color scheme for your dashboard.
            </p>
            <ThemeSwitcher />
          </div>

          {/* Enhanced Dashboard with Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Smart Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <EnhancedDashboardGrid />
              
              <div className="cyber-card p-6 hover-glow">
                <RemindersWidget />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <AdvancedAnalytics />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-6">
              <div className="cyber-card p-8 text-center hover-glow">
                <Zap className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-2xl font-bold mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground mb-6">
                  Get intelligent recommendations and predictive analytics for your business
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Revenue Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      AI suggests focusing on commercial projects for 15% revenue increase
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Risk Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      Weather delays predicted for 2 projects - consider scheduling adjustments
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Cost Savings</h4>
                    <p className="text-sm text-muted-foreground">
                      Material bulk purchasing could save £12,000 this quarter
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveLayout>
    </>
  );
};

export default Dashboard;
