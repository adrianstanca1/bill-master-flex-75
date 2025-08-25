
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Send, Edit } from 'lucide-react';
import { InvoiceData, Totals, formatCurrency } from '@/lib/invoice-calc';

interface EnhancedInvoicePreviewProps {
  data: InvoiceData;
  totals: Totals;
  onClose: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onSend?: () => void;
}

export function EnhancedInvoicePreview({ 
  data, 
  totals, 
  onClose, 
  onEdit, 
  onDownload, 
  onSend 
}: EnhancedInvoicePreviewProps) {
  const companyLogo = localStorage.getItem('company-logo');

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Invoice Preview</h1>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
            {onSend && (
              <Button onClick={onSend}>
                <Send className="w-4 h-4 mr-2" />
                Send Invoice
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <Card className="bg-card text-card-foreground print:shadow-none">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                {companyLogo && (
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
                  <p className="text-lg text-muted-foreground">#{data.invoice.number}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-semibold">{new Date(data.invoice.date).toLocaleDateString()}</p>
                {data.invoice.dueDate && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                    <p className="font-semibold">{new Date(data.invoice.dueDate).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>

            {/* Company & Client Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">From:</h3>
                <div className="space-y-1">
                  <p className="font-semibold">{data.company.name}</p>
                  <div className="whitespace-pre-line text-sm text-muted-foreground">
                    {data.company.address}
                  </div>
                  {data.company.email && <p className="text-sm">{data.company.email}</p>}
                  {data.company.phone && <p className="text-sm">{data.company.phone}</p>}
                  {data.company.vatNumber && <p className="text-sm">VAT: {data.company.vatNumber}</p>}
                  {data.company.regNumber && <p className="text-sm">Reg: {data.company.regNumber}</p>}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">To:</h3>
                <div className="space-y-1">
                  <p className="font-semibold">{data.client.name}</p>
                  <div className="whitespace-pre-line text-sm text-muted-foreground">
                    {data.client.address}
                  </div>
                  {data.client.contact && <p className="text-sm">Attn: {data.client.contact}</p>}
                  {data.client.email && <p className="text-sm">{data.client.email}</p>}
                </div>
              </div>
            </div>

            {/* Reference */}
            {data.invoice.reference && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Reference:</p>
                <p className="font-medium">{data.invoice.reference}</p>
              </div>
            )}

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2">Description</th>
                    <th className="text-right py-3 px-2 w-20">Qty</th>
                    <th className="text-right py-3 px-2 w-24">Rate</th>
                    <th className="text-right py-3 px-2 w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 px-2">{item.description}</td>
                      <td className="text-right py-3 px-2">{item.quantity}</td>
                      <td className="text-right py-3 px-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-3 px-2">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                
                {totals.discount > 0 && (
                  <div className="flex justify-between py-1 text-red-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-1">
                  <span>Net Amount:</span>
                  <span>{formatCurrency(totals.netAfterDiscount)}</span>
                </div>
                
                {data.vatMode === 'STANDARD_20' && (
                  <div className="flex justify-between py-1">
                    <span>VAT (20%):</span>
                    <span>{formatCurrency(totals.vatAmount)}</span>
                  </div>
                )}
                
                {data.vatMode === 'REVERSE_CHARGE_20' && (
                  <div className="flex justify-between py-1 text-blue-600">
                    <span>VAT (Reverse Charge):</span>
                    <span>£0.00</span>
                  </div>
                )}
                
                <div className="flex justify-between py-1 border-t border-gray-300">
                  <span>Total Before Retention:</span>
                  <span>{formatCurrency(totals.totalBeforeRetention)}</span>
                </div>
                
                {totals.retention > 0 && (
                  <div className="flex justify-between py-1 text-orange-600">
                    <span>Retention ({((totals.retention / totals.totalBeforeRetention) * 100).toFixed(1)}%):</span>
                    <span>-{formatCurrency(totals.retention)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-1">
                  <span>Total After Retention:</span>
                  <span>{formatCurrency(totals.totalAfterRetention)}</span>
                </div>
                
                {totals.cisDeduction > 0 && (
                  <div className="flex justify-between py-1 text-purple-600">
                    <span>CIS Deduction ({totals.cisPercent}%):</span>
                    <span>-{formatCurrency(totals.cisDeduction)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-300">
                  <span>Amount Due:</span>
                  <span>{formatCurrency(totals.totalDue)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {data.invoice.notes && (
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-2">Notes:</h4>
                <div className="whitespace-pre-line text-sm text-muted-foreground">
                  {data.invoice.notes}
                </div>
              </div>
            )}

            {/* VAT Notice */}
            {data.vatMode === 'REVERSE_CHARGE_20' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 font-medium">
                  VAT Reverse Charge: The customer is liable to account for VAT to HM Revenue & Customs.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
