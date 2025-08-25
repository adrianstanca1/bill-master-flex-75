
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Send, Eye, Edit } from 'lucide-react';

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  id: string;
  title: string;
  total: number;
  status: string;
  created_at: string;
  items: QuoteItem[];
}

interface QuotePreviewProps {
  quote: Quote;
  onEdit?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
}

export function QuotePreview({ quote, onEdit, onSend, onDownload }: QuotePreviewProps) {
  const subtotal = quote.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
  const vatRate = 0.2;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{quote.title}</CardTitle>
            <p className="text-muted-foreground">
              Created: {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={quote.status === 'draft' ? 'secondary' : 'default'}>
            {quote.status}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onSend && (
            <Button variant="outline" size="sm" onClick={onSend}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quote Items */}
        <div>
          <h3 className="font-semibold mb-4">Quote Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-3 bg-muted font-medium text-sm">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {quote.items?.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 p-3 border-t">
                <div className="col-span-6">{item.description}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">£{item.unitPrice.toFixed(2)}</div>
                <div className="col-span-2 text-right">£{(item.quantity * item.unitPrice).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (20%):</span>
            <span>£{vatAmount.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Terms */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Terms & Conditions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>This quote is valid for 30 days from the date of issue</li>
            <li>Payment terms: 30 days net from invoice date</li>
            <li>All work carried out in accordance with relevant health & safety regulations</li>
            <li>Materials and workmanship guaranteed for 12 months</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
