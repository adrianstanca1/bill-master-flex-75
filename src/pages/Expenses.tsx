
import React from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { ExpenseManager } from '@/components/ExpenseManager';
import { EnhancedKPIGrid } from '@/components/EnhancedKPIGrid';
import { StripePaymentManager } from '@/components/StripePaymentManager';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, CreditCard, BarChart3 } from 'lucide-react';

const Expenses: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveLayout>
        <SEO 
          title="Expenses & Payments | ASagents" 
          description="Comprehensive expense management, payment processing, and financial analytics for your business"
        />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Financial Management</h1>
            <p className="text-muted-foreground">
              Manage expenses, process payments, and track financial performance
            </p>
          </div>

          <Tabs defaultValue="expenses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expenses" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-6">
              <ExpenseManager />
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StripePaymentManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <EnhancedKPIGrid />
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveLayout>
    </div>
  );
};

export default Expenses;
