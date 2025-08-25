import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const MockQuoteTester: React.FC = () => {
  const { toast } = useToast();
  const companyId = useCompanyId();

  const [title, setTitle] = useState('Sample Quote');
  const [amount, setAmount] = useState('1250');
  const [number, setNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ quoteId?: string; invoiceId?: string; invoiceNumber?: string } | null>(null);

  const createAndConvert = async () => {
    if (!companyId) {
      toast({ title: 'Mock Quote', description: 'Please set a valid Company ID in Settings first.', variant: 'destructive' });
      return;
    }

    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) {
      toast({ title: 'Mock Quote', description: 'Enter a valid positive amount.', variant: 'destructive' });
      return;
    }

    try {
      setBusy(true);
      setResult(null);

      // 1) Create a minimal quote row
      const items = [
        { description: title || 'Item', quantity: 1, unitPrice: amt }
      ];

      const { data: qIns, error: qErr } = await supabase
        .from('quotes')
        .insert({
          company_id: companyId,
          title: title || 'Sample Quote',
          items,
          total: amt,
          status: 'draft',
        })
        .select('id')
        .maybeSingle();

      if (qErr) throw new Error(qErr.message);
      const quoteId = qIns?.id as string;
      if (!quoteId) throw new Error('Failed to create quote');

      // 2) Convert quote to invoice via Edge Function
      const body: any = { quoteId };
      if (number.trim()) body.number = number.trim();
      if (dueDate) body.dueDate = dueDate; // YYYY-MM-DD

      const { data: conv, error: fnErr } = await supabase.functions.invoke('quotes', { body });
      if (fnErr) throw new Error(fnErr.message);
      const invoice = (conv as any)?.invoice;

      setResult({
        quoteId,
        invoiceId: invoice?.id,
        invoiceNumber: invoice?.number,
      });

      toast({
        title: 'Mock Quote → Invoice',
        description: invoice?.number ? `Created invoice ${invoice.number}` : 'Converted quote to invoice',
      });
    } catch (e: any) {
      toast({ title: 'Mock Quote', description: e.message || 'Conversion failed', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Quote Tester</CardTitle>
        <CardDescription>Create a sample quote and convert it to an invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!companyId && (
          <p className="text-sm text-muted-foreground">No Company ID set. Open Settings → Service Config (Mock) to add one.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Roofing repairs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="number">Invoice Number (optional)</Label>
            <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g., INV-1001" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="due">Due Date (optional)</Label>
            <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={createAndConvert} disabled={busy || !companyId}>
            {busy ? 'Working…' : 'Create & Convert'}
          </Button>
          {result?.invoiceNumber && (
            <span className="text-sm text-muted-foreground">Created invoice: {result.invoiceNumber}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MockQuoteTester;
