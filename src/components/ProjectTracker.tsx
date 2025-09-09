import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export function ProjectTracker() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Tracker</h1>
          <p className="text-muted-foreground">Manage your construction projects</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Projects Module
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Projects Module Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The project tracker is being updated with enhanced security features and improved functionality.
            </p>
            <Badge variant="secondary" className="mt-4">
              Under Development
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}