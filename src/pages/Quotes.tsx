
import React, { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuotesList } from "@/components/QuotesList";
import { QuoteEditor } from "@/components/QuoteEditor";

interface Quote {
  id: string;
  company_id: string;
  title: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
}

type ViewMode = 'list' | 'create' | 'edit';

const Quotes: React.FC = () => {
  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  // Fetch quotes
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Quote[];
    },
    enabled: !!companyId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('quotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['quotes', companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  // Create/Update quote mutation
  const saveQuoteMutation = useMutation({
    mutationFn: async (data: { title: string; items: any[]; total: number }) => {
      if (!companyId) throw new Error('No company ID');
      
      if (editingQuote) {
        const { error } = await supabase
          .from('quotes')
          .update({
            title: data.title,
            items: data.items,
            total: data.total,
          })
          .eq('id', editingQuote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quotes')
          .insert({
            company_id: companyId,
            title: data.title,
            items: data.items,
            total: data.total,
            status: 'draft',
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setViewMode('list');
      setEditingQuote(null);
      queryClient.invalidateQueries({ queryKey: ['quotes', companyId] });
    },
  });

  const convertToInvoice = async (quote: Quote) => {
    const number = window.prompt("Invoice number? (e.g. INV-1001)") || undefined;
    const dueDate = window.prompt("Invoice due date (YYYY-MM-DD)?") || undefined;
    const client = window.prompt("Client name (optional)") || undefined;
    try {
      const { data, error } = await supabase.functions.invoke("quotes", {
        body: { quoteId: quote.id, number, dueDate, client },
      });
      if (error) throw new Error(error.message);
      toast({ title: "Converted to invoice", description: data?.invoice?.number || "Invoice created" });
    } catch (e: any) {
      toast({ title: "Conversion failed", description: e.message || String(e), variant: "destructive" });
    }
  };

  const handleCreateNew = () => {
    setEditingQuote(null);
    setViewMode('create');
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingQuote(null);
  };

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Quotes",
    description: "Create quotes and convert them to invoices",
  }), []);

  return (
    <>
      <ResponsiveLayout>
        <SEO title="Quotes | AS Agents" description="Create quotes and convert them to invoices." jsonLd={jsonLd} />
        <h1 className="sr-only">Quotes</h1>
        
        {viewMode === 'list' ? (
          <QuotesList
            quotes={quotes}
            isLoading={isLoading}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onConvertToInvoice={convertToInvoice}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            <QuoteEditor
              quote={editingQuote}
              onSave={saveQuoteMutation.mutateAsync}
              onCancel={handleCancel}
            />
          </div>
        )}
      </ResponsiveLayout>
    </>
  );
};

export default Quotes;
