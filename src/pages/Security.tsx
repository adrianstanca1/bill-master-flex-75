
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityPolicyEnforcer } from '@/components/SecurityPolicyEnforcer';
import { TemporarySecurityStub } from '@/components/TemporarySecurityStub';
import { SimplifiedSecurityDashboard } from '@/components/SimplifiedSecurityDashboard';
import { SecurityConfigurationManager } from '@/components/SecurityConfigurationManager';
import { SecurityEnhancementsPanel } from '@/components/SecurityEnhancementsPanel';
import { SecurityEnhancedRoleManager } from '@/components/SecurityEnhancedRoleManager';
import { SecurityFixesStatus } from '@/components/SecurityFixesStatus';
import { SecurityFixesImplemented } from '@/components/SecurityFixesImplemented';
import { SecurityHeaders } from '@/components/SecurityHeaders';
import { SecurityMonitoringDashboard } from '@/components/SecurityMonitoringDashboard';
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

        <Tabs defaultValue="fixes" className="w-full">
          <TabsList>
            <TabsTrigger value="fixes">Security Fixes</TabsTrigger>
            <TabsTrigger value="headers">Security Headers</TabsTrigger>
            <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fixes" className="space-y-6">
            <SecurityFixesImplemented />
            <SecurityFixesStatus />
          </TabsContent>

          <TabsContent value="headers" className="space-y-6">
            <SecurityHeaders />
          </TabsContent>
          
          <TabsContent value="enhancements" className="space-y-6">
            <SecurityEnhancementsPanel />
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-6">
            <SecurityEnhancedRoleManager />
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
            <SecurityMonitoringDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
