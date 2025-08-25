
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Timer, Eye, AlertCircle } from 'lucide-react';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  value?: string | number;
  type: 'boolean' | 'number' | 'text';
}

interface SecurityPolicyCardProps {
  policy: SecurityPolicy;
  onUpdate: (policyId: string, updates: Partial<SecurityPolicy>) => void;
  loading: boolean;
}

export function SecurityPolicyCard({ policy, onUpdate, loading }: SecurityPolicyCardProps) {
  const getPolicyIcon = (policyId: string) => {
    switch (policyId) {
      case 'session_timeout': return Timer;
      case 'force_2fa': return Lock;
      case 'password_expiry': return Lock;
      case 'ip_whitelist': return Shield;
      case 'audit_all_actions': return Eye;
      case 'data_retention': return AlertCircle;
      default: return Shield;
    }
  };

  const IconComponent = getPolicyIcon(policy.id);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <IconComponent className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h4 className="font-medium">{policy.name}</h4>
              <p className="text-sm text-muted-foreground">{policy.description}</p>
            </div>
          </div>
          <Switch
            checked={policy.enabled}
            onCheckedChange={(enabled) => onUpdate(policy.id, { enabled })}
            disabled={loading}
          />
        </div>
        
        {policy.enabled && policy.type !== 'boolean' && (
          <div className="mt-3 flex items-center gap-2">
            <Label htmlFor={policy.id} className="text-sm">
              Value:
            </Label>
            <Input
              id={policy.id}
              type={policy.type === 'number' ? 'number' : 'text'}
              value={policy.value || ''}
              onChange={(e) => onUpdate(policy.id, { 
                value: policy.type === 'number' ? parseInt(e.target.value) : e.target.value 
              })}
              className="w-32"
              disabled={loading}
            />
            {policy.type === 'number' && (
              <span className="text-xs text-muted-foreground">
                {policy.id.includes('timeout') ? 'minutes' :
                 policy.id.includes('expiry') || policy.id.includes('retention') ? 'days' : ''}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
