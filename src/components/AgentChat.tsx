import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function AgentChat() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            AI Assistant is available in the full dashboard. Sign in to access advanced AI features.
          </p>
          <Button variant="outline" className="w-full">
            Try AI Assistant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}