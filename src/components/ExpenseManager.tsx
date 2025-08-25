
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { validateAndSanitizeField } from '@/lib/sanitization';

interface Expense {
  id: string;
  amount: number;
  category: string;
  supplier: string;
  txn_date: string;
  project_id?: string;
  ai_tags?: any;
}

export const ExpenseManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    supplier: '',
    txn_date: new Date().toISOString().split('T')[0],
    project_id: ''
  });

  const companyId = useCompanyId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('company_id', companyId)
        .order('txn_date', { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!companyId,
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          company_id: companyId,
          amount: parseFloat(expenseData.amount),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Expense created successfully" });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create expense", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...updateData,
          amount: parseFloat(updateData.amount),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Expense updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      resetForm();
    }
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Expense deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      supplier: '',
      txn_date: new Date().toISOString().split('T')[0],
      project_id: ''
    });
    setIsCreating(false);
    setEditingExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and sanitize inputs
    const supplierValidation = validateAndSanitizeField(formData.supplier, 'company');
    const amountValidation = validateAndSanitizeField(formData.amount, 'amount');
    
    if (!supplierValidation.isValid) {
      toast({
        title: "Invalid supplier name",
        description: supplierValidation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    if (!amountValidation.isValid) {
      toast({
        title: "Invalid amount",
        description: amountValidation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    const sanitizedData = {
      ...formData,
      supplier: supplierValidation.sanitized,
      amount: amountValidation.sanitized
    };
    
    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, ...sanitizedData });
    } else {
      createExpenseMutation.mutate(sanitizedData);
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category || '',
      supplier: expense.supplier || '',
      txn_date: expense.txn_date,
      project_id: expense.project_id || ''
    });
    setIsCreating(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Management</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (£)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="txn_date">Date</Label>
                  <Input
                    id="txn_date"
                    type="date"
                    value={formData.txn_date}
                    onChange={(e) => setFormData({ ...formData, txn_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}>
                  {editingExpense ? 'Update' : 'Create'} Expense
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {expenses?.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4" />
                    <span className="font-semibold">£{expense.amount.toFixed(2)}</span>
                    {expense.category && (
                      <Badge variant="secondary">{expense.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {expense.supplier} • {new Date(expense.txn_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(expense)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteExpenseMutation.mutate(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expenses?.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No expenses recorded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
