
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface SecurityPolicyHeaderProps {
  securityScore: number;
  onResetDefaults: () => void;
  loading: boolean;
}

export function SecurityPolicyHeader({ securityScore, onResetDefaults, loading }: SecurityPolicyHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Policies
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Security Score</div>
            <div className={`text-lg font-bold ${
              securityScore >= 80 ? 'text-green-600' :
              securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {securityScore}%
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onResetDefaults}
            disabled={loading}
          >
            Reset to Defaults
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
  );
}
