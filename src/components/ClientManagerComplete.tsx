
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export const ClientManagerComplete: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const companyId = useCompanyId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!companyId,
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          company_id: companyId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Client created successfully" });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create client", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Client updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      resetForm();
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Client deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    setIsCreating(false);
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, ...formData });
    } else {
      createClientMutation.mutate(formData);
    }
  };

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setIsCreating(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Management</h2>
          <p className="text-muted-foreground">Manage your client contacts and information</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createClientMutation.isPending || updateClientMutation.isPending}>
                  {editingClient ? 'Update' : 'Create'} Client
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
        {clients?.map((client) => (
          <Card key={client.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{client.name}</span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{client.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {client.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {client.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteClientMutation.mutate(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients?.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No clients added yet</p>
            <Button className="mt-4" onClick={() => setIsCreating(true)}>
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
