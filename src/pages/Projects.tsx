import React, { useState } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { EnhancedProjectTracker } from '@/components/EnhancedProjectTracker';
import { ProjectsOverview } from '@/components/ProjectsOverview';
import { ProjectMetrics } from '@/components/ProjectMetrics';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, BarChart3, Calendar, Settings } from 'lucide-react';

export default function Projects() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock projects data for the overview component
  const mockProjects = [
    {
      id: '1',
      name: 'Kitchen Extension',
      client: 'Smith Family',
      location: '123 Oak Street, London',
      status: 'active' as const,
      progress: 65,
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      budget: 45000,
      spent: 29250
    },
    {
      id: '2',
      name: 'Bathroom Renovation',
      client: 'Johnson Ltd',
      location: '456 Pine Avenue, Manchester',
      status: 'completed' as const,
      progress: 100,
      startDate: '2023-11-01',
      endDate: '2024-01-10',
      budget: 25000,
      spent: 24500
    },
    {
      id: '3',
      name: 'Office Refurbishment',
      client: 'TechCorp',
      location: '789 Business Park, Birmingham',
      status: 'pending' as const,
      progress: 0,
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      budget: 120000,
      spent: 0
    }
  ];

  const handleViewProject = (id: string) => {
    console.log('Viewing project:', id);
    // This would navigate to project details
  };

  const handleCreateProject = () => {
    setActiveTab('tracker');
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveLayout>
        <SEO 
          title="Projects | AS Agents" 
          description="Comprehensive project management for your construction business - track progress, manage timelines, and monitor budgets"
        />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Management</h1>
            <p className="text-muted-foreground">
              Manage all aspects of your construction projects from planning to completion
            </p>
          </div>

          {/* Project Metrics */}
          <ProjectMetrics />

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tracker" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ProjectsOverview 
                onViewProject={handleViewProject}
                onCreateProject={handleCreateProject}
              />
            </TabsContent>

            <TabsContent value="tracker" className="space-y-6">
              <EnhancedProjectTracker />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">Project timeline view coming soon</p>
                    <p className="text-sm">This will show Gantt charts and project schedules</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Project Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-4">Performance analytics coming soon</p>
                      <p className="text-sm">Track project profitability, timelines, and efficiency</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-4">Budget analysis coming soon</p>
                      <p className="text-sm">Monitor project costs and budget variance</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveLayout>
    </div>
  );
}