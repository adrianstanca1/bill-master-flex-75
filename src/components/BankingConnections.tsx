import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { secureStorage } from '@/lib/SecureStorage';

export const BankingConnections: React.FC = () => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    try {
      setBusy(true);
      const settings = await secureStorage.getItem('as-settings') || {};
      const details = {
        truelayerClientId: settings?.truelayerClientId,
        truelayerRedirectUri: settings?.truelayerRedirectUri,
      };
      const { data, error } = await supabase.functions.invoke('banking-truelayer', { body: { action: 'consent', mock: true, details } });
      if (error) throw new Error(error.message);
      const url = (data as any)?.url;
      const desc = url ? `Consent URL ready: ${url}` : ((data as any)?.message || 'Consent started');
      toast({ title: 'Banking', description: desc });
    } catch (e: any) {
      toast({ title: 'Banking', description: e.message || 'Function error', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Feeds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={connect} disabled={busy}>Connect via TrueLayer</Button>
        <p className="text-xs text-muted-foreground">Use bank feeds for auto-categorization and cash flow forecasts.</p>
      </CardContent>
    </Card>
  );
};
