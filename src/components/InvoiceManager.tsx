
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Download, Send, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanyId } from '@/hooks/useCompanyId';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  items: InvoiceItem[];
}

export const InvoiceManager: React.FC = () => {
  const { toast } = useToast();
  const companyId = useCompanyId();
  const [activeTab, setActiveTab] = useState('list');
  
  // Mock data with better test data
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-001',
      client: 'Acme Construction',
      amount: 15859.20,
      status: 'overdue',
      dueDate: '2025-08-08',
      items: [
        { description: 'Roofing materials', quantity: 1, unitPrice: 12000, total: 12000 },
        { description: 'Labour costs', quantity: 32, unitPrice: 120.60, total: 3859.20 }
      ]
    },
    {
      id: '2',
      number: 'INV-002',
      client: 'BuildCorp Ltd',
      amount: 8900.00,
      status: 'sent',
      dueDate: '2025-08-15',
      items: [
        { description: 'Electrical work', quantity: 1, unitPrice: 8900, total: 8900 }
      ]
    },
    {
      id: '3',
      number: 'INV-003',
      client: 'Modern Homes',
      amount: 5420.50,
      status: 'paid',
      dueDate: '2025-07-30',
      items: [
        { description: 'Plumbing installation', quantity: 1, unitPrice: 5420.50, total: 5420.50 }
      ]
    }
  ]);

  const [newInvoice, setNewInvoice] = useState({
    client: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
  });

  const addInvoiceItem = () => {
    console.log('Adding new invoice item');
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
    toast({
      title: "Item Added",
      description: "New invoice item added to the form",
    });
  };

  const removeInvoiceItem = (index: number) => {
    console.log('Removing invoice item at index:', index);
    if (newInvoice.items.length > 1) {
      setNewInvoice(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      toast({
        title: "Item Removed",
        description: "Invoice item removed from the form",
      });
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one item is required",
        variant: "destructive"
      });
    }
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    console.log('Updating invoice item:', index, field, value);
    setNewInvoice(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateInvoice = async () => {
    console.log('Creating invoice:', newInvoice);
    
    if (!newInvoice.client || !newInvoice.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in client and due date",
        variant: "destructive"
      });
      return;
    }

    if (newInvoice.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast({
        title: "Invalid Items",
        description: "Please fill in all item details with valid values",
        variant: "destructive"
      });
      return;
    }

    try {
      const newInvoiceData: Invoice = {
        id: (invoices.length + 1).toString(),
        number: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        client: newInvoice.client,
        amount: calculateTotal(),
        status: 'draft',
        dueDate: newInvoice.dueDate,
        items: newInvoice.items
      };

      setInvoices(prev => [newInvoiceData, ...prev]);
      
      toast({
        title: "Invoice Created",
        description: `Invoice ${newInvoiceData.number} for ${newInvoice.client} created successfully`,
      });
      
      // Reset form
      setNewInvoice({
        client: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
      });
      
      setActiveTab('list');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log('Viewing invoice:', invoice.id);
    toast({
      title: "View Invoice",
      description: `Opening ${invoice.number} for ${invoice.client}`,
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log('Downloading invoice:', invoice.id);
    toast({
      title: "Download Started",
      description: `Downloading ${invoice.number} as PDF`,
    });
  };

  const handleSendInvoice = (invoice: Invoice) => {
    console.log('Sending invoice:', invoice.id);
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    ));
    toast({
      title: "Invoice Sent",
      description: `${invoice.number} has been sent to ${invoice.client}`,
    });
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    console.log('Marking invoice as paid:', invoice.id);
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'paid' as const } : inv
    ));
    toast({
      title: "Payment Recorded",
      description: `${invoice.number} marked as paid`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with main navigation - moved to top */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-muted-foreground">Create, manage and track your invoices</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
          <Button 
            variant="outline"
            onClick={() => setActiveTab('list')}
          >
            <FileText className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      {/* Main navigation tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{invoices.length}</div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  £{invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  £{invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  £{invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Invoice list */}
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{invoice.number}</h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{invoice.client}</p>
                      <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        £{invoice.amount.toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSendInvoice(invoice)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsPaid(invoice)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client Name *</Label>
                  <Input
                    id="client"
                    value={newInvoice.client}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Invoice Items</h4>
                  <Button onClick={addInvoiceItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label>Unit Price (£) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
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
                          onClick={() => removeInvoiceItem(index)}
                          disabled={newInvoice.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total: £{calculateTotal().toFixed(2)}
                  </p>
                </div>
                <Button onClick={handleCreateInvoice} disabled={!newInvoice.client || !newInvoice.dueDate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
