import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceList } from '@/components/InvoiceList';
import { InvoiceFormDashboard } from '@/components/InvoiceFormDashboard';
import { InvoicePreviewDashboard } from '@/components/InvoicePreviewDashboard';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, TrendingUp, Clock, AlertTriangle, DollarSign } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  amount: number;
  due_date: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  items: any;
}

export function InvoiceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { companyId, loading: companyLoading } = useCompanyId();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!companyId,
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    outstanding: invoices.filter(i => i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    draft: invoices.filter(i => i.status === 'draft').length,
    totalValue: invoices.reduce((sum, i) => sum + i.amount, 0),
    paidValue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    outstandingValue: invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.amount, 0),
    overdueValue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
  };

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setShowForm(true);
    setActiveTab('form');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedInvoice(null);
    setActiveTab('list');
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('preview');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">
            Create, manage and track your construction invoices
          </p>
        </div>
        <Button onClick={handleCreateNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All Invoices ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2" disabled={!showForm}>
            <Plus className="h-4 w-4" />
            {selectedInvoice ? 'Edit' : 'Create'}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!selectedInvoice}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  £{stats.totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.total} total invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  £{stats.paidValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.paid} invoices paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  £{stats.outstandingValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.outstanding} invoices pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  £{stats.overdueValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdue} invoices overdue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="outline" onClick={() => setActiveTab('list')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">{invoice.client_id || 'No client'}</p>
                      </div>
                      <Badge className={
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        £{invoice.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewInvoice(invoice)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No invoices yet</p>
                    <Button onClick={handleCreateNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first invoice
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <InvoiceList 
            onCreateNew={handleCreateNew}
            onEditInvoice={handleEditInvoice}
          />
        </TabsContent>

        <TabsContent value="form" className="mt-6">
          {showForm && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Invoice form component is being updated with security enhancements.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {selectedInvoice && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Invoice preview for {selectedInvoice.invoice_number}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}