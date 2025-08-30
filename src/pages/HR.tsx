import React from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { EnhancedHRModule } from '@/components/EnhancedHRModule';
import SEO from '@/components/SEO';

export default function HR() {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveLayout>
        <SEO 
          title="HR Management | AS Agents" 
          description="Human resources management for your construction business - manage employees, track time, and handle payroll"
        />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">HR Management</h1>
            <p className="text-muted-foreground">
              Comprehensive human resources management with advanced analytics and automation
            </p>
          </div>

          <EnhancedHRModule />
        </div>
      </ResponsiveLayout>
    </div>
  );
}