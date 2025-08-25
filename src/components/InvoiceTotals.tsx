
import React from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Totals, VATMode, formatCurrency } from '@/lib/invoice-calc';
import { FormValues } from './InvoiceGenerator';
import { Info } from 'lucide-react';

interface InvoiceTotalsProps {
  totals: Totals;
  vatMode: VATMode;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function InvoiceTotals({ totals, vatMode, register, setValue }: InvoiceTotalsProps) {
  return (
    <div className="space-y-6">
      {/* VAT & Adjustments */}
      <Card className="bg-surface border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">VAT & Adjustments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-text-secondary">VAT Mode</Label>
            <Select 
              value={vatMode} 
              onValueChange={(value: VATMode) => setValue('vatMode', value)}
            >
              <SelectTrigger className="bg-input border-border text-text-primary mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="STANDARD_20" className="text-text-primary">
                  Standard VAT (20%)
                </SelectItem>
                <SelectItem value="REVERSE_CHARGE_20" className="text-text-primary">
                  Reverse Charge (20%)
                </SelectItem>
                <SelectItem value="NO_VAT" className="text-text-primary">
                  No VAT (0%)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-text-secondary">Discount (%)</Label>
            <Input 
              type="number" 
              min="0" 
              max="100" 
              step="0.01"
              placeholder="0.00"
              className="bg-input border-border text-text-primary mt-1"
              {...register('discountPercent', { valueAsNumber: true })} 
            />
          </div>
          
          <div>
            <Label className="text-text-secondary">Retention (%)</Label>
            <Input 
              type="number" 
              min="0" 
              max="100" 
              step="0.01"
              placeholder="0.00"
              className="bg-input border-border text-text-primary mt-1"
              {...register('retentionPercent', { valueAsNumber: true })} 
            />
          </div>

          {/* CIS Deduction */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-text-secondary">Apply CIS deduction (20%)</Label>
              <input type="checkbox" className="scale-110" {...register('cisEnabled')} />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Applied to total after retention
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <Card className="bg-surface border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Discount</span>
                <span className="text-destructive font-medium">-{formatCurrency(totals.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Net after discount</span>
              <span className="text-text-primary font-medium">{formatCurrency(totals.netAfterDiscount)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">VAT ({(totals.vatRate * 100).toFixed(0)}%)</span>
              <span className="text-text-primary font-medium">{formatCurrency(totals.vatAmount)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total before retention</span>
              <span className="text-text-primary font-medium">{formatCurrency(totals.totalBeforeRetention)}</span>
            </div>
            
            {totals.retention > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Retention</span>
                <span className="text-destructive font-medium">-{formatCurrency(totals.retention)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total after retention</span>
              <span className="text-text-primary font-medium">{formatCurrency(totals.totalAfterRetention)}</span>
            </div>

            {totals.cisDeduction > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Less CIS deduction ({totals.cisPercent.toFixed(0)}%)</span>
                <span className="text-destructive font-medium">-{formatCurrency(totals.cisDeduction)}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-text-primary font-semibold">Amount Due</span>
                <span className="text-primary font-bold text-lg">{formatCurrency(totals.totalDue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VAT Information */}
      {vatMode === 'REVERSE_CHARGE_20' && (
        <Card className="bg-surface border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-primary font-medium mb-1">Reverse Charge VAT</p>
                <p className="text-xs text-text-secondary">
                  VAT shows as £0 on the invoice. The customer will account for VAT at 20% 
                  through their VAT return.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CIS Information */}
      {totals.cisDeduction > 0 && (
        <Card className="bg-surface border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-primary font-medium mb-1">CIS Deduction</p>
                <p className="text-xs text-text-secondary">
                  20% deduction applied under Construction Industry Scheme. 
                  This amount will be paid directly to HMRC by your client.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
