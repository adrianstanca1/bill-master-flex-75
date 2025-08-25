import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Key, 
  Monitor,
  ExternalLink
} from 'lucide-react';
import { EnhancedSecureStorage } from './EnhancedSecureStorage';

interface SecurityEnhancement {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in-progress';
  priority: 'high' | 'medium' | 'low';
  timeEstimate: string;
  category: 'immediate' | 'short-term' | 'monitoring';
}

export function SecurityEnhancementsPanel() {
  const [enhancements] = useState<SecurityEnhancement[]>([
    {
      id: 'otp-settings',
      title: 'Review OTP Settings',
      description: 'Reduce OTP expiry to 5-10 minutes for enhanced security',
      status: 'pending',
      priority: 'medium',
      timeEstimate: '5 minutes',
      category: 'immediate'
    },
    {
      id: 'storage-migration',
      title: 'Complete Storage Migration',
      description: 'Migrate remaining localStorage usage to SecureStorage',
      status: 'in-progress',
      priority: 'high',
      timeEstimate: '1-2 hours',
      category: 'short-term'
    },
    {
      id: 'function-security',
      title: 'Database Function Security',
      description: 'Add explicit search_path settings to custom functions',
      status: 'completed',
      priority: 'medium',
      timeEstimate: '30 minutes',
      category: 'short-term'
    },
    {
      id: 'event-monitoring',
      title: 'Security Event Monitoring',
      description: 'Monitor security_audit_log for unusual patterns',
      status: 'pending',
      priority: 'high',
      timeEstimate: 'Ongoing',
      category: 'monitoring'
    },
    {
      id: 'access-audit',
      title: 'Access Control Audit',
      description: 'Quarterly review of user roles and permissions',
      status: 'pending',
      priority: 'medium',
      timeEstimate: 'Ongoing',
      category: 'monitoring'
    }
  ]);

  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const completedCount = enhancements.filter(e => e.status === 'completed').length;
  const progressPercentage = (completedCount / enhancements.length) * 100;

  const enhancementsByCategory = {
    immediate: enhancements.filter(e => e.category === 'immediate'),
    'short-term': enhancements.filter(e => e.category === 'short-term'),
    monitoring: enhancements.filter(e => e.category === 'monitoring')
  };

  const openSupabaseAuth = () => {
    window.open('https://supabase.com/dashboard/project/zwxyoeqsbntsogvgwily/auth/settings', '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Enhancements
          </CardTitle>
          <CardDescription>
            Implementation status of recommended security improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{enhancements.length} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>OTP configuration needs review in Supabase Dashboard</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={openSupabaseAuth}
                  >
                    Open Settings
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="immediate" className="w-full">
        <TabsList>
          <TabsTrigger value="immediate">Immediate (5 min)</TabsTrigger>
          <TabsTrigger value="short-term">Short-term (1-2 hrs)</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring (Ongoing)</TabsTrigger>
          <TabsTrigger value="storage">Secure Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="immediate" className="space-y-4">
          {enhancementsByCategory.immediate.map((enhancement) => (
            <Card key={enhancement.id} className={getPriorityColor(enhancement.priority)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(enhancement.status)}
                      <h3 className="font-semibold">{enhancement.title}</h3>
                      {getStatusBadge(enhancement.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {enhancement.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Est. time: {enhancement.timeEstimate}</span>
                      <Badge variant="outline" className="text-xs">
                        {enhancement.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="short-term" className="space-y-4">
          {enhancementsByCategory['short-term'].map((enhancement) => (
            <Card key={enhancement.id} className={getPriorityColor(enhancement.priority)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(enhancement.status)}
                      <h3 className="font-semibold">{enhancement.title}</h3>
                      {getStatusBadge(enhancement.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {enhancement.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Est. time: {enhancement.timeEstimate}</span>
                      <Badge variant="outline" className="text-xs">
                        {enhancement.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {enhancementsByCategory.monitoring.map((enhancement) => (
            <Card key={enhancement.id} className={getPriorityColor(enhancement.priority)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(enhancement.status)}
                      <h3 className="font-semibold">{enhancement.title}</h3>
                      {getStatusBadge(enhancement.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {enhancement.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Est. time: {enhancement.timeEstimate}</span>
                      <Badge variant="outline" className="text-xs">
                        {enhancement.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="storage">
          <EnhancedSecureStorage />
        </TabsContent>
      </Tabs>
    </div>
  );
}