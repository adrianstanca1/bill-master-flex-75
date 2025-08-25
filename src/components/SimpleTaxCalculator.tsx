import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, PoundSterling } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaxCalculation {
  grossIncome: number;
  vatAmount: number;
  incomeTax: number;
  nationalInsurance: number;
  takeHome: number;
}

export function SimpleTaxCalculator() {
  const [annualTurnover, setAnnualTurnover] = useState('');
  const [expenses, setExpenses] = useState('');
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const { toast } = useToast();

  const calculateTax = () => {
    const turnover = parseFloat(annualTurnover) || 0;
    const businessExpenses = parseFloat(expenses) || 0;

    if (turnover <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid annual turnover",
        variant: "destructive"
      });
      return;
    }

    const profit = turnover - businessExpenses;
    const personalAllowance = 12570; // 2024/25
    
    // VAT calculation (simplified)
    const vatRequired = turnover > 90000;
    const vatAmount = vatRequired ? turnover * 0.2 / 1.2 : 0;
    
    // Income tax (basic calculation)
    const taxableIncome = Math.max(0, profit - personalAllowance);
    let incomeTax = 0;
    
    if (taxableIncome > 0) {
      if (taxableIncome <= 37700) {
        incomeTax = taxableIncome * 0.2;
      } else {
        incomeTax = 37700 * 0.2 + (taxableIncome - 37700) * 0.4;
      }
    }
    
    // National Insurance (simplified)
    let nationalInsurance = 0;
    if (profit > 12570) {
      nationalInsurance = Math.min(profit - 12570, 37700) * 0.09;
      if (profit > 50270) {
        nationalInsurance += (profit - 50270) * 0.02;
      }
    }
    
    const takeHome = profit - incomeTax - nationalInsurance;
    
    setCalculation({
      grossIncome: turnover,
      vatAmount,
      incomeTax,
      nationalInsurance,
      takeHome
    });

    toast({
      title: "Tax Calculated",
      description: "Your tax calculation has been completed",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8 text-primary" />
          UK Tax Calculator
        </h1>
        <p className="text-muted-foreground">Simple tax calculation for construction businesses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PoundSterling className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="turnover">Annual Turnover (£)</Label>
            <Input
              id="turnover"
              type="number"
              placeholder="150000"
              value={annualTurnover}
              onChange={(e) => setAnnualTurnover(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="expenses">Annual Expenses (£)</Label>
            <Input
              id="expenses"
              type="number"
              placeholder="25000"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
            />
          </div>

          <Button onClick={calculateTax} className="w-full">
            Calculate Tax
          </Button>
        </CardContent>
      </Card>

      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Tax Calculation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Gross Income</Label>
                <p className="text-lg font-semibold">£{calculation.grossIncome.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">VAT</Label>
                <p className="text-lg font-semibold text-orange-600">£{calculation.vatAmount.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Income Tax</Label>
                <p className="text-lg font-semibold">£{calculation.incomeTax.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">National Insurance</Label>
                <p className="text-lg font-semibold">£{calculation.nationalInsurance.toLocaleString()}</p>
              </div>
              <div className="col-span-2 border-t pt-2">
                <Label className="text-sm text-muted-foreground">Take Home</Label>
                <p className="text-2xl font-bold text-green-600">£{calculation.takeHome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}