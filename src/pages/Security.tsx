
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityPolicyEnforcer } from '@/components/SecurityPolicyEnforcer';
import { TemporarySecurityStub } from '@/components/TemporarySecurityStub';
import { SimplifiedSecurityDashboard } from '@/components/SimplifiedSecurityDashboard';
import { SecurityConfigurationManager } from '@/components/SecurityConfigurationManager';
import { SecurityEnhancementsPanel } from '@/components/SecurityEnhancementsPanel';
import SEO from '@/components/SEO';

export default function Security() {
  return (
    <>
      <SEO 
        title="Security" 
        description="Comprehensive security monitoring and policy management" 
        noindex 
      />
      
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground mt-2">
            Monitor security events, manage policies, and maintain system integrity
          </p>
        </div>

        <Tabs defaultValue="enhancements" className="w-full">
          <TabsList>
            <TabsTrigger value="enhancements">Security Enhancements</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="compliance">Security Compliance</TabsTrigger>
            <TabsTrigger value="dashboard">Security Dashboard</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="threats">Threat Detection</TabsTrigger>
            <TabsTrigger value="policies">Security Policies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhancements" className="space-y-6">
            <SecurityEnhancementsPanel />
          </TabsContent>
          
          <TabsContent value="configuration" className="space-y-6">
            <SecurityConfigurationManager />
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-6">
            <TemporarySecurityStub />
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-6">
            <SimplifiedSecurityDashboard />
          </TabsContent>
          
          <TabsContent value="monitoring" className="space-y-6">
            <TemporarySecurityStub />
          </TabsContent>
          
          <TabsContent value="threats" className="space-y-6">
            <TemporarySecurityStub />
          </TabsContent>
          
          <TabsContent value="policies" className="space-y-6">
            <SecurityConfigurationManager />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
