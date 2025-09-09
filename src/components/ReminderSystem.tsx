import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export function ReminderSystem() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Reminder System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h4 className="font-medium mb-1">Reminder System Coming Soon</h4>
          <p className="text-sm text-muted-foreground">
            Task reminders and notifications will be available here.
          </p>
          <Badge variant="secondary" className="mt-3">
            Feature Update in Progress
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}