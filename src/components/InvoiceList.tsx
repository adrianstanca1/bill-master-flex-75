
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Send, MoreVertical, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

interface InvoiceListProps {
  onCreateNew: () => void;
  onEditInvoice: (invoice: Invoice) => void;
}

export function InvoiceList({ onCreateNew, onEditInvoice }: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const companyId = useCompanyId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      return data?.map(invoice => ({ ...invoice, meta: invoice.meta || {} })) as Invoice[];
    },
    enabled: !!companyId,
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "Invoice updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update invoice", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete invoice", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsSent = (invoice: Invoice) => {
    updateInvoiceMutation.mutate({
      id: invoice.id,
      updates: { status: 'sent' }
    });
  };

  const markAsPaid = (invoice: Invoice) => {
    updateInvoiceMutation.mutate({
      id: invoice.id,
      updates: { status: 'paid' }
    });
  };

  const downloadInvoice = (invoice: Invoice) => {
    // In a real app, this would generate and download a PDF
    toast({ title: "PDF download would start here" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading invoices...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No invoices found</p>
              <Button onClick={onCreateNew} className="mt-4">
                Create your first invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{invoice.number}</h3>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-1">
                      Client: {invoice.client || 'No client specified'}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      £{invoice.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                      {invoice.due_date && (
                        <span className="ml-4">
                          Due: {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditInvoice(invoice)}
                    >
                      Edit
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => downloadInvoice(invoice)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {invoice.status === 'draft' && (
                          <DropdownMenuItem onClick={() => markAsSent(invoice)}>
                            <Send className="h-4 w-4 mr-2" />
                            Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <DropdownMenuItem onClick={() => markAsPaid(invoice)}>
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{filteredInvoices.length}</p>
                <p className="text-sm text-gray-600">Total Invoices</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  £{filteredInvoices
                    .filter(i => i.status === 'paid')
                    .reduce((sum, i) => sum + i.total, 0)
                    .toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Paid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  £{filteredInvoices
                    .filter(i => i.status === 'sent')
                    .reduce((sum, i) => sum + i.total, 0)
                    .toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Outstanding</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  £{filteredInvoices
                    .filter(i => i.status === 'overdue')
                    .reduce((sum, i) => sum + i.total, 0)
                    .toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
