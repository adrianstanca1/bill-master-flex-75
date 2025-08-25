
import React from 'react';
import { EnhancedInvoiceManager } from '@/components/EnhancedInvoiceManager';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import SEO from '@/components/SEO';

export default function Invoices() {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveLayout>
        <SEO 
          title="Invoices | AS Agents" 
          description="Comprehensive invoice management for your construction business - create, track, and send professional invoices"
        />
        <div className="space-y-6">
          <div className="cyber-card p-8 hover-glow">
            <h1 className="text-4xl font-bold text-gradient mb-3">Invoice Management</h1>
            <p className="text-muted-foreground text-lg">
              Create, track, and manage professional invoices for your construction business
            </p>
          </div>
          <EnhancedInvoiceManager />
        </div>
      </ResponsiveLayout>
    </div>
  );
}
