import React from 'react';
import { InvoiceData, Totals, formatCurrency } from '@/lib/invoice-calc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoicePreviewProps {
  data: InvoiceData;
  totals: Totals;
  onClose: () => void;
}

export function InvoicePreview({ data, totals, onClose }: InvoicePreviewProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download feature",
      description: "PDF generation requires backend integration. Preview shows the invoice format.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} className="bg-gradient-primary">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <Card className="bg-card text-card-foreground shadow-card print:shadow-none">
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold">{data.company.name}</p>
                  <div className="whitespace-pre-line">{data.company.address}</div>
                  {data.company.email && <p>Email: {data.company.email}</p>}
                  {data.company.phone && <p>Phone: {data.company.phone}</p>}
                  {data.company.vatNumber && <p>VAT No: {data.company.vatNumber}</p>}
                  {data.company.regNumber && <p>Company Reg: {data.company.regNumber}</p>}
                </div>
              </div>
              <div className="text-right text-sm">
                <p><span className="font-semibold">Invoice No:</span> {data.invoice.number}</p>
                <p><span className="font-semibold">Date:</span> {data.invoice.date}</p>
                {data.invoice.dueDate && (
                  <p><span className="font-semibold">Due Date:</span> {data.invoice.dueDate}</p>
                )}
                {data.invoice.reference && (
                  <p><span className="font-semibold">Reference:</span> {data.invoice.reference}</p>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                Bill To:
              </h3>
              <div className="text-sm text-gray-700">
                <p className="font-semibold">{data.client.name}</p>
                <div className="whitespace-pre-line">{data.client.address}</div>
                {data.client.contact && <p>Contact: {data.client.contact}</p>}
                {data.client.email && <p>Email: {data.client.email}</p>}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 font-semibold text-gray-900">Description</th>
                    <th className="text-right py-2 font-semibold text-gray-900 w-20">Qty</th>
                    <th className="text-right py-2 font-semibold text-gray-900 w-24">Unit Price</th>
                    <th className="text-right py-2 font-semibold text-gray-900 w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => {
                    const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 text-gray-700">{item.description}</td>
                        <td className="py-3 text-right text-gray-700">{(item.quantity || 0).toFixed(2)}</td>
                        <td className="py-3 text-right text-gray-700">{formatCurrency(item.unitPrice || 0)}</td>
                        <td className="py-3 text-right text-gray-700 font-medium">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  
                  {totals.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-red-600 font-medium">-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net after discount:</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(totals.netAfterDiscount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT ({(totals.vatRate * 100).toFixed(0)}%):</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(totals.vatAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total before retention:</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(totals.totalBeforeRetention)}</span>
                  </div>
                  
                  {totals.retention > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retention:</span>
                      <span className="text-red-600 font-medium">-{formatCurrency(totals.retention)}</span>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-bold text-lg">Total Due:</span>
                      <span className="text-gray-900 font-bold text-lg">{formatCurrency(totals.totalDue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {(data.invoice.notes || data.vatMode === 'REVERSE_CHARGE_20') && (
              <div className="mt-8 pt-6 border-t border-gray-300">
                <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {data.invoice.notes}
                  {data.vatMode === 'REVERSE_CHARGE_20' && (
                    <>
                      {data.invoice.notes ? '\n\n' : ''}
                      VAT Reverse Charge (Construction Services): Customer to account for VAT at 20%.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300 text-center">
              <p className="text-xs text-gray-500">Generated by AS Invoice Generator</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}