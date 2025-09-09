import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import { AuthAnalytics } from "@/components/auth/AuthAnalytics";
import { SessionManager } from "@/components/auth/SessionManager";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { 
  Shield, 
  BarChart3, 
  Settings, 
  Users, 
  ArrowLeft,
  Lock,
  Smartphone,
  Eye
} from "lucide-react";

export default function AuthDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const [activeTab, setActiveTab] = useState('analytics');

  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  return (
    <main className="container max-w-6xl mx-auto py-8">
      <SEO 
        title="Authentication Dashboard"
        description="Manage your authentication settings and security"
        noindex
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Authentication Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your security settings and view authentication analytics
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Welcome back, {user?.email}!
            </h2>
            <p className="text-blue-700 dark:text-blue-300">
              Your account security is our top priority. Review your authentication settings and activity below.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Authentication Analytics</h3>
            <p className="text-muted-foreground">
              Monitor your login patterns, security events, and account activity
            </p>
          </div>
          <AuthAnalytics />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Session Management</h3>
            <p className="text-muted-foreground">
              View and manage your active sessions across all devices
            </p>
          </div>
          <SessionManager />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Two-Factor Authentication</h3>
            <p className="text-muted-foreground">
              Add an extra layer of security to protect your account
            </p>
          </div>
          <TwoFactorSetup onSetupComplete={() => {
            console.log('2FA setup completed');
          }} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Authentication Settings</h3>
            <p className="text-muted-foreground">
              Configure your authentication preferences and security options
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="bg-muted/20 border rounded-lg p-6 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold mb-2">Advanced Settings</h4>
              <p className="text-muted-foreground mb-4">
                Additional authentication settings and preferences will be available here
              </p>
              <Button variant="outline">
                Coming Soon
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}