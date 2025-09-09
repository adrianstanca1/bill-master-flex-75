import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export function RemindersWidget() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Reminders feature coming soon</p>
          <Badge variant="secondary" className="mt-2">
            In Development
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}