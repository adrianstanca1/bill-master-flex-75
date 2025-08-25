import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { secureStorage } from '@/lib/SecureStorage';

export const HMRCConnections: React.FC = () => {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const call = async (fn: string, payload: any = {}) => {
    try {
      setBusy(fn);
      const settings = await secureStorage.getItem('as-settings') || {};
      const details = {
        hmrcClientId: settings?.hmrcClientId,
        hmrcRedirectUri: settings?.hmrcRedirectUri,
        vatNumber: settings?.hmrcVatNumber,
        utr: settings?.hmrcUtr,
        companyId: settings?.companyId,
      };
      const { data, error } = await supabase.functions.invoke(fn as any, { body: { ...payload, mock: true, details } });
      if (error) throw new Error(error.message);
      const msg = (data as any)?.message || 'Request sent';
      const url = (data as any)?.url;
      const desc = url ? `${msg} — ${url}` : msg;
      toast({ title: `HMRC: ${fn}`, description: desc });
    } catch (e: any) {
      toast({ title: `HMRC: ${fn}`, description: e.message || 'Function error', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HMRC Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button onClick={() => call('hmrc-oauth', { action: 'start' })} disabled={busy!==null}>
            Connect HMRC (OAuth)
          </Button>
          <Button variant="outline" onClick={() => call('hmrc-vat', { action: 'submit_vat' })} disabled={busy!==null}>
            Submit VAT Return
          </Button>
          <Button variant="outline" onClick={() => call('hmrc-cis', { action: 'verify' })} disabled={busy!==null}>
            Verify CIS Subcontractor
          </Button>
          <Button variant="outline" onClick={() => call('hmrc-rti', { action: 'fps' })} disabled={busy!==null}>
            Submit RTI (FPS)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Mock API is active — configure your HMRC IDs in Settings.</p>
      </CardContent>
    </Card>
  );
};
