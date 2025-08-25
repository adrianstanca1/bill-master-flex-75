import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';

export function SecurityImplementationStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Implementation Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Security enhancements are being implemented. Some features require database migrations to be complete.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Role-Based Access Control</p>
              <p className="text-sm text-muted-foreground">Add role field to profiles table</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending Migration
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enhanced Security Logging</p>
              <p className="text-sm text-muted-foreground">Comprehensive audit trails</p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Brute Force Protection</p>
              <p className="text-sm text-muted-foreground">Account lockout mechanisms</p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Session Security</p>
              <p className="text-sm text-muted-foreground">Enhanced session management</p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Input Validation</p>
              <p className="text-sm text-muted-foreground">Comprehensive input sanitization</p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </Badge>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Next Steps:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Run database migrations to add role-based access control</li>
            <li>• Configure RLS policies with role checking</li>
            <li>• Deploy secure webhook and role management functions</li>
            <li>• Enable real-time security monitoring</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}