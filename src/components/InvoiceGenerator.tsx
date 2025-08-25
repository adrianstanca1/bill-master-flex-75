import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { computeTotals, type VATMode, type InvoiceData } from '@/lib/invoice-calc';
import { format } from 'date-fns';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceTotals } from './InvoiceTotals';
import { EnhancedInvoicePreview } from './EnhancedInvoicePreview';
import { InvoiceList } from './InvoiceList';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from '@/hooks/useCompanyId';
import { secureStorage } from '@/lib/SecureStorage';

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
});

const formSchema = z.object({
  company: z.object({
    name: z.string().min(1, 'Company name is required'),
    address: z.string().min(1, 'Company address is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    vatNumber: z.string().optional().or(z.literal('')),
    regNumber: z.string().optional().or(z.literal('')),
  }),
  client: z.object({
    name: z.string().min(1, 'Client name is required'),
    address: z.string().min(1, 'Client address is required'),
    contact: z.string().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
  }),
  invoice: z.object({
    number: z.string().min(1, 'Invoice number is required'),
    date: z.string().min(1, 'Invoice date is required'),
    dueDate: z.string().optional().or(z.literal('')),
    reference: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  }),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  vatMode: z.enum(['STANDARD_20','REVERSE_CHARGE_20','NO_VAT']),
  discountPercent: z.number().min(0).max(100).default(0),
  retentionPercent: z.number().min(0).max(100).default(0),
  cisEnabled: z.boolean().default(false).optional(),
  cisPercent: z.number().min(0).max(100).default(20).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

async function loadDefaults(): Promise<Partial<FormValues>> {
  if (typeof window === 'undefined') return getInitialDefaults();
  
  const saved = await secureStorage.getItem('as-invoice-defaults');
  if (saved) {
    try { 
      return saved; 
    } catch {
      return getInitialDefaults();
    }
  }
  return getInitialDefaults();
}

function getInitialDefaults(): Partial<FormValues> {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    company: {
      name: 'Your Company Ltd',
      address: 'Your Address Line 1\nCity, Postcode\nUnited Kingdom',
      email: 'info@yourcompany.com',
      phone: '+44 1234 567890',
      vatNumber: 'GB123456789',
      regNumber: '12345678',
    },
    client: {
      name: '',
      address: '',
      contact: '',
      email: '',
    },
    invoice: {
      number: `INV-${Date.now().toString().slice(-6)}`,
      date: today,
      dueDate: '',
      reference: '',
      notes: 'Payment terms: 30 days net\nBank details: Sort Code 12-34-56, Account 12345678',
    },
    items: [
      { description: 'Labour and materials', quantity: 1, unitPrice: 0 },
    ],
    vatMode: 'STANDARD_20' as VATMode,
    discountPercent: 0,
    retentionPercent: 0,
    cisEnabled: false,
    cisPercent: 20,
  };
}

export function InvoiceGenerator() {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [defaults, setDefaults] = useState<Partial<FormValues>>(getInitialDefaults());
  const { toast } = useToast();
  const companyId = useCompanyId();
  
  React.useEffect(() => {
    loadDefaults().then(setDefaults);
  }, []);
  const { control, register, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults as FormValues
  });

  const { fields, append, remove } = useFieldArray({ 
    control, 
    name: 'items' 
  });
  
  const values = watch();
  const totals = computeTotals(values as InvoiceData);

  async function saveDefaults() {
    await secureStorage.setItem('as-invoice-defaults', values, { encrypt: true });
    toast({
      title: "Defaults saved",
      description: "Your default values have been saved securely.",
    });
  }

  function handleCreateNew() {
    reset(getInitialDefaults() as FormValues);
    setEditingInvoice(null);
    setCurrentView('create');
  }

  function handleEditInvoice(invoice: any) {
    const meta = invoice.meta || {};
    
    // Populate form with invoice data
    reset({
      company: meta.company || getInitialDefaults().company,
      client: {
        name: invoice.client || '',
        address: meta.client?.address || '',
        contact: meta.client?.contact || '',
        email: meta.client?.email || '',
      },
      invoice: {
        number: invoice.number,
        date: format(new Date(invoice.created_at), 'yyyy-MM-dd'),
        dueDate: invoice.due_date ? format(new Date(invoice.due_date), 'yyyy-MM-dd') : '',
        reference: meta.reference || '',
        notes: meta.notes || '',
      },
      items: meta.items || [{ description: 'Labour and materials', quantity: 1, unitPrice: 0 }],
      vatMode: meta.reverse_vat ? 'REVERSE_CHARGE_20' : 'STANDARD_20',
      discountPercent: meta.discount_percent || 0,
      retentionPercent: meta.retention_percent || 0,
      cisEnabled: meta.cis_enabled || false,
      cisPercent: meta.cis_percent || 20,
    } as FormValues);
    
    setEditingInvoice(invoice);
    setCurrentView('edit');
  }

  function handlePreview() {
    setCurrentView('preview');
  }

  async function handleSaveBackend() {
    try {
      if (!companyId) {
        toast({ 
          title: "Missing company", 
          description: "Please set up your company in Settings first.", 
          variant: "destructive" 
        });
        return;
      }

      const itemTotals = values.items.map(item => item.quantity * item.unitPrice);
      const netTotal = itemTotals.reduce((sum, total) => sum + total, 0);
      
      // Convert totals to a plain object compatible with Json type
      const totalsForDb = {
        subtotal: totals.subtotal,
        discount: totals.discount,
        netAfterDiscount: totals.netAfterDiscount,
        vatRate: totals.vatRate,
        vatAmount: totals.vatAmount,
        totalBeforeRetention: totals.totalBeforeRetention,
        retention: totals.retention,
        totalAfterRetention: totals.totalAfterRetention,
        cisPercent: totals.cisPercent,
        cisDeduction: totals.cisDeduction,
        totalDue: totals.totalDue,
      };

      const invoiceData = {
        company_id: companyId,
        number: values.invoice.number,
        client: values.client.name,
        total: totals.totalDue,
        due_date: values.invoice.dueDate || null,
        status: 'draft' as const,
        meta: {
          company: values.company,
          client: values.client,
          invoice: values.invoice,
          items: values.items,
          net_total: netTotal,
          vat_amount: totals.vatAmount,
          reverse_vat: values.vatMode === 'REVERSE_CHARGE_20',
          discount_percent: values.discountPercent,
          retention_percent: values.retentionPercent,
          cis_enabled: values.cisEnabled,
          cis_percent: values.cisPercent,
          totals: totalsForDb,
        },
      };

      let result;
      if (editingInvoice) {
        // Update existing invoice
        result = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', editingInvoice.id)
          .select()
          .single();
      } else {
        // Create new invoice
        result = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({ 
        title: editingInvoice ? "Invoice updated" : "Invoice created", 
        description: `Invoice ${values.invoice.number} has been saved successfully.` 
      });
      
      setCurrentView('list');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({ 
        title: "Failed to save invoice", 
        description: error?.message || String(error), 
        variant: "destructive" 
      });
    }
  }

  function handleClosePreview() {
    setCurrentView(editingInvoice ? 'edit' : 'create');
  }

  function handleBackToList() {
    setCurrentView('list');
    setEditingInvoice(null);
  }

  function handleDownloadPDF() {
    toast({
      title: "PDF Download",
      description: "PDF download functionality would be implemented here",
    });
  }

  function handleSendInvoice() {
    toast({
      title: "Send Invoice",
      description: "Email sending functionality would be implemented here",
    });
  }

  if (currentView === 'list') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Invoice Management</h1>
            <p className="text-gray-600">Create, manage and track your invoices</p>
          </div>
          <InvoiceList 
            onCreateNew={handleCreateNew}
            onEditInvoice={handleEditInvoice}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'preview') {
    return (
      <EnhancedInvoicePreview 
        data={values as InvoiceData}
        totals={totals}
        onClose={handleClosePreview}
        onEdit={handleClosePreview}
        onDownload={handleDownloadPDF}
        onSend={handleSendInvoice}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
            </h1>
            <p className="text-gray-600">
              {editingInvoice ? `Editing ${editingInvoice.number}` : 'Generate professional invoices with VAT, CIS, and retention support'}
            </p>
          </div>
          <button
            onClick={handleBackToList}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Invoice List
          </button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InvoiceForm
              register={register}
              fields={fields}
              append={append}
              remove={remove}
              control={control}
              onSaveDefaults={saveDefaults}
              onPreview={handlePreview}
              onSaveBackend={handleSaveBackend}
            />
          </div>
          <div className="lg:col-span-1">
            <InvoiceTotals 
              totals={totals}
              vatMode={values.vatMode}
              register={register}
              setValue={setValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
