import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, X } from 'lucide-react';

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

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceFormDashboardProps {
  invoice?: Invoice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InvoiceFormDashboard({ invoice, onSuccess, onCancel }: InvoiceFormDashboardProps) {
  const companyId = useCompanyId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    number: '',
    client: '',
    due_date: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[]
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        number: invoice.number,
        client: invoice.client || '',
        due_date: invoice.due_date || '',
        items: invoice.meta?.items || [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
      });
    }
  }, [invoice]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          company_id: companyId,
          status: 'draft',
          total: calculateTotal()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "Invoice created successfully" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create invoice", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...invoiceData,
          total: calculateTotal()
        })
        .eq('id', invoice!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "Invoice updated successfully" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update invoice", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.client) {
      toast({
        title: "Missing required fields",
        description: "Please fill in invoice number and client name",
        variant: "destructive"
      });
      return;
    }

    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      toast({
        title: "Invalid items",
        description: "Please ensure all items have valid descriptions, quantities, and prices",
        variant: "destructive"
      });
      return;
    }

    const invoiceData = {
      number: formData.number,
      client: formData.client,
      due_date: formData.due_date || null,
      meta: { items: formData.items }
    };

    if (invoice) {
      updateInvoiceMutation.mutate(invoiceData);
    } else {
      createInvoiceMutation.mutate(invoiceData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </CardTitle>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="number">Invoice Number *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="INV-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="client">Client Name *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Client name"
                required
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Invoice Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm">Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Quantity *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Unit Price (£) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Total</Label>
                    <Input
                      value={`£${item.total.toFixed(2)}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-right">
              <p className="text-lg font-bold">
                Total: £{calculateTotal().toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {invoice ? 'Update' : 'Create'} Invoice
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}