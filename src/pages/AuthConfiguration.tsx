import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthenticationDashboard } from '@/components/AuthenticationDashboard';
import { AuthSecuritySettings } from '@/components/AuthSecuritySettings';
import { 
  Shield, 
  Users, 
  Settings,
  Activity,
  Lock
} from 'lucide-react';
import SEO from '@/components/SEO';

export default function AuthConfiguration() {
  return (
    <>
      <SEO 
        title="Authentication Configuration | AS Agents" 
        description="Configure and manage authentication, security settings, and user access controls"
        noindex 
      />
      
      <div className="container mx-auto py-6 space-y-6">
        <div className="cyber-card p-8 hover-glow">
          <h1 className="text-4xl font-bold text-gradient mb-3">Authentication Center</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive authentication management and security controls
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Settings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Access Policies
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <AuthenticationDashboard />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6 mt-6">
            <AuthSecuritySettings />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6 mt-6">
            <div className="cyber-card p-8 text-center hover-glow">
              <Users className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold mb-2">User Management</h3>
              <p className="text-muted-foreground mb-6">
                Manage user accounts, roles, and permissions across your organization
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Active Users</h4>
                  <p className="text-2xl font-bold text-green-600">24</p>
                  <p className="text-sm text-muted-foreground">Currently online</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Pending Invites</h4>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                  <p className="text-sm text-muted-foreground">Awaiting acceptance</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Role Assignments</h4>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-sm text-muted-foreground">Custom roles</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="policies" className="space-y-6 mt-6">
            <div className="cyber-card p-8 text-center hover-glow">
              <Lock className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold mb-2">Access Policies</h3>
              <p className="text-muted-foreground mb-6">
                Configure fine-grained access controls and permission policies
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Role-Based Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure permissions based on user roles and responsibilities
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Resource Policies</h4>
                  <p className="text-sm text-muted-foreground">
                    Control access to specific resources and data
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Time-Based Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Restrict access based on time and location
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}