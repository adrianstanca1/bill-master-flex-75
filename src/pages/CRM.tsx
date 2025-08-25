import React from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { EnhancedClientManager } from '@/components/EnhancedClientManager';
import SEO from '@/components/SEO';

export default function CRM() {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveLayout>
        <SEO 
          title="CRM | AS Agents" 
          description="Customer relationship management for your construction business - manage clients, track communications, and build relationships"
        />
        <div className="cyber-card p-8 hover-glow">
          <h1 className="text-4xl font-bold text-gradient mb-3">Client Relationship Management</h1>
          <p className="text-muted-foreground text-lg">
            Manage your clients, track interactions, and grow your business relationships
          </p>
        </div>

        <EnhancedClientManager />
      </ResponsiveLayout>
    </div>
  );
}