
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface FinancialData {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueAmount: number;
  profitMargin: number;
  cashFlow: number;
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

interface FinancialSummaryProps {
  data: FinancialData;
  onViewFinancials: () => void;
  onCreateInvoice: () => void;
}

const FinancialSummary = memo(({ data, onViewFinancials, onCreateInvoice }: FinancialSummaryProps) => {
  const isMobile = useIsMobile();

  const formatCurrency = (amount: number) => `£${amount.toLocaleString()}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB');

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Revenue
                </span>
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(data.totalRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Monthly Revenue
                </span>
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(data.monthlyRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Pending Invoices
                </span>
              </div>
              <div className="text-xl font-bold">
                {data.pendingInvoices}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-destructive/20">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Overdue Amount
                </span>
              </div>
              <div className="text-xl font-bold text-destructive">
                {formatCurrency(data.overdueAmount)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onViewFinancials}>
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
              <Button size={isMobile ? "sm" : "default"} onClick={onCreateInvoice}>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-bold text-sm",
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent transactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

FinancialSummary.displayName = 'FinancialSummary';

export { FinancialSummary };
