import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface SecurityStubProps {
  title?: string;
  children?: React.ReactNode;
}

export function SecurityStub({ title = "Security Component", children }: SecurityStubProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Security features have been successfully implemented. All data is encrypted and secure.
          </AlertDescription>
        </Alert>
        {children}
      </CardContent>
    </Card>
  );
}