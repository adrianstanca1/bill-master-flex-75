import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';

import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RemindersWidget } from '@/components/RemindersWidget';
import { supabase } from '@/integrations/supabase/client';
import { DashboardOverview } from '@/components/DashboardOverview';
import { HMRCConnections } from '@/components/HMRCConnections';
import { BankingConnections } from '@/components/BankingConnections';

const SiteManager: React.FC = () => {
  const [stats, setStats] = useState({ projects: 0, active: 0, pending: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: projects } = await supabase.from('projects').select('id');
        const total = projects?.length || 0;
        setStats({ projects: total, active: 0, pending: 0 });
      } catch (err) {
        console.error('Failed to load project stats', err);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      <ResponsiveLayout>
        <SEO title="Site Manager Dashboard" description="Operational view for site managers: tasks, projects, reminders, and actions." />
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Site Manager</h1>
          <p className="text-muted-foreground">Today’s operations overview</p>
        </header>
        <DashboardOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Total projects</div>
                <div className="text-2xl font-bold">{stats.projects}</div>
              </div>
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-2xl font-bold">{stats.active}</div>
              </div>
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </div>
            </CardContent>
          </Card>

          <RemindersWidget />

          <HMRCConnections />
          <BankingConnections />
        </div>
      </ResponsiveLayout>
    </div>
  );
};

export default SiteManager;
