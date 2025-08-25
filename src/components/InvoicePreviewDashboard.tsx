import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Send, Edit, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  number: string;
  client: string;
  total: number;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  meta: any;
}

interface InvoicePreviewDashboardProps {
  invoice: Invoice;
  onEdit?: () => void;
  onDownload?: () => void;
  onSend?: () => void;
  onBack?: () => void;
}

export function InvoicePreviewDashboard({ 
  invoice, 
  onEdit, 
  onDownload, 
  onSend, 
  onBack 
}: InvoicePreviewDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const items = invoice.meta?.items || [];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">{invoice.number}</h2>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
          {onSend && invoice.status === 'draft' && (
            <Button onClick={onSend}>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">INVOICE</CardTitle>
              <p className="text-lg text-muted-foreground">#{invoice.number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-semibold">
                {format(new Date(invoice.created_at), 'dd/MM/yyyy')}
              </p>
              {invoice.due_date && (
                <>
                  <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                  <p className="font-semibold">
                    {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Client Info */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
            <p className="font-medium">{invoice.client}</p>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-2">Description</th>
                      <th className="text-right py-3 px-2 w-20">Qty</th>
                      <th className="text-right py-3 px-2 w-24">Unit Price</th>
                      <th className="text-right py-3 px-2 w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-3 px-2">{item.description}</td>
                        <td className="text-right py-3 px-2">{item.quantity}</td>
                        <td className="text-right py-3 px-2">
                          £{item.unitPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="text-right py-3 px-2">
                          £{item.total?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-300">
                <span>Total Amount:</span>
                <span>£{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Invoice Status: <span className="font-medium capitalize">{invoice.status}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}