import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Building, Phone, Mail, MapPin, Edit, Trash2, Users } from 'lucide-react';
import { validateAndSanitizeField } from '@/lib/sanitization';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function ClientManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const companyId = useCompanyId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const { data: clients = [], isLoading } = useQuery({
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

  const createClientMutation = useMutation({
    mutationFn: async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client created successfully" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create client", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client updated successfully" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update client", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete client", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and sanitize name
    const nameValidation = validateAndSanitizeField(formData.name, 'name');
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid name",
        description: nameValidation.errors[0],
        variant: "destructive"
      });
      return;
    }

    // Validate email if provided
    if (formData.email) {
      const emailValidation = validateAndSanitizeField(formData.email, 'email');
      if (!emailValidation.isValid) {
        toast({
          title: "Invalid email",
          description: emailValidation.errors[0],
          variant: "destructive"
        });
        return;
      }
    }

    // Validate phone if provided
    if (formData.phone) {
      const phoneValidation = validateAndSanitizeField(formData.phone, 'phone');
      if (!phoneValidation.isValid) {
        toast({
          title: "Invalid phone",
          description: phoneValidation.errors[0],
          variant: "destructive"
        });
        return;
      }
    }

    // Sanitize form data
    const sanitizedData = {
      name: nameValidation.sanitized,
      email: formData.email ? validateAndSanitizeField(formData.email, 'email').sanitized : '',
      phone: formData.phone ? validateAndSanitizeField(formData.phone, 'phone').sanitized : '',
      address: formData.address ? validateAndSanitizeField(formData.address, 'address').sanitized : '',
      notes: formData.notes ? validateAndSanitizeField(formData.notes, 'description').sanitized : ''
    };

    if (editingClient) {
      updateClientMutation.mutate({
        id: editingClient.id,
        updates: sanitizedData
      });
    } else {
      createClientMutation.mutate(sanitizedData);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Client Management
          </h2>
          <p className="text-muted-foreground">
            Manage your construction clients and their information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClient(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Company/Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="01234 567890"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Client address"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this client"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createClientMutation.isPending || updateClientMutation.isPending}>
                  {editingClient ? 'Update' : 'Create'} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-sm text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.filter(c => c.email).length}</div>
            <p className="text-sm text-muted-foreground">With Email</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.filter(c => c.phone).length}</div>
            <p className="text-sm text-muted-foreground">With Phone</p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <div className="grid gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No clients found matching your search' : 'No clients yet'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-2">{client.address}</span>
                        </div>
                      )}
                      {client.notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <strong>Notes:</strong> {client.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteClientMutation.mutate(client.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}