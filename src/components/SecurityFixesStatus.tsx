import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Shield, Lock } from 'lucide-react';

export function SecurityFixesStatus() {
  const securityFixes = [
    {
      title: 'Company ID Immutability',
      description: 'Prevents users from changing their company association after setup',
      status: 'implemented',
      priority: 'high',
      details: 'Database trigger prevents company_id changes and logs violations'
    },
    {
      title: 'Enhanced Webhook Security',
      description: 'HMAC-SHA256 signature validation for webhook authenticity',
      status: 'implemented',
      priority: 'high',
      details: 'Replaced basic encoding with cryptographically secure signatures'
    },
    {
      title: 'Role-Based Access Control',
      description: 'Prevents self-role escalation and unauthorized privilege changes',
      status: 'pending_migration',
      priority: 'high',
      details: 'Database schema changes required for full implementation'
    },
    {
      title: 'Security Monitoring',
      description: 'Real-time detection and alerting for suspicious activities',
      status: 'implemented',
      priority: 'medium',
      details: 'Live monitoring dashboard with automatic threat detection'
    },
    {
      title: 'Enhanced Input Validation',
      description: 'Comprehensive sanitization and validation across all inputs',
      status: 'implemented',
      priority: 'medium',
      details: 'DOMPurify integration and Zod schema validation'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending_migration':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge variant="default" className="bg-green-100 text-green-800">Implemented</Badge>;
      case 'pending_migration':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Migration</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unspecified</Badge>;
    }
  };

  const implementedCount = securityFixes.filter(fix => fix.status === 'implemented').length;
  const totalCount = securityFixes.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security Fixes Implementation Status
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Progress: {implementedCount}/{totalCount} fixes implemented
          </span>
          <div className="w-32 bg-muted rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(implementedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityFixes.map((fix, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(fix.status)}
                  <h3 className="font-medium">{fix.title}</h3>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(fix.priority)}
                  {getStatusBadge(fix.status)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {fix.description}
              </p>
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Implementation:</strong> {fix.details}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}