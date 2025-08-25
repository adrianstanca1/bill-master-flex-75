import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Send, 
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dateIssued: string;
  dateDue: string;
  items: { description: string; quantity: number; rate: number; amount: number }[];
  notes?: string;
  project?: string;
}

export function EnhancedInvoiceManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2024-001',
      client: 'TechCorp Ltd',
      amount: 15750.00,
      status: 'sent',
      dateIssued: '2024-01-15',
      dateDue: '2024-02-14',
      project: 'Office Renovation',
      items: [
        { description: 'Labour - Electrical Work', quantity: 40, rate: 75, amount: 3000 },
        { description: 'Materials - Cables and Fittings', quantity: 1, rate: 2750, amount: 2750 },
        { description: 'Project Management', quantity: 20, rate: 100, amount: 2000 }
      ],
      notes: 'Payment terms: Net 30 days'
    },
    {
      id: '2',
      number: 'INV-2024-002',
      client: 'Green Homes',
      amount: 8500.00,
      status: 'paid',
      dateIssued: '2024-01-10',
      dateDue: '2024-02-09',
      project: 'Residential Complex',
      items: [
        { description: 'Site Survey', quantity: 1, rate: 2500, amount: 2500 },
        { description: 'Planning Consultation', quantity: 12, rate: 500, amount: 6000 }
      ]
    },
    {
      id: '3',
      number: 'INV-2024-003',
      client: 'Retail Solutions',
      amount: 22300.00,
      status: 'overdue',
      dateIssued: '2023-12-15',
      dateDue: '2024-01-14',
      project: 'Shop Fit-out',
      items: [
        { description: 'Flooring Installation', quantity: 150, rate: 45, amount: 6750 },
        { description: 'Electrical Work', quantity: 80, rate: 65, amount: 5200 },
        { description: 'Plumbing', quantity: 35, rate: 85, amount: 2975 }
      ]
    }
  ]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.project && invoice.project.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && ['draft', 'sent'].includes(invoice.status)) ||
                      (activeTab === 'paid' && invoice.status === 'paid') ||
                      (activeTab === 'overdue' && invoice.status === 'overdue');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'sent': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'paid': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'cancelled': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Create Invoice",
      description: "New invoice creation form would open here"
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    toast({
      title: "View Invoice",
      description: `Opening invoice ${invoice.number}`
    });
  };

  const handleSendInvoice = (invoice: Invoice) => {
    toast({
      title: "Send Invoice",
      description: `Invoice ${invoice.number} sent to ${invoice.client}`
    });
  };

  // Calculate summary stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => ['draft', 'sent'].includes(inv.status)).reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-gradient">£{(totalAmount / 1000).toFixed(1)}k</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">£{(paidAmount / 1000).toFixed(1)}k</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-600">£{(pendingAmount / 1000).toFixed(1)}k</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">£{(overdueAmount / 1000).toFixed(1)}k</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="cyber-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <Button onClick={handleCreateInvoice} className="cyber-button">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({invoices.filter(i => ['draft', 'sent'].includes(i.status)).length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({invoices.filter(i => i.status === 'paid').length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({invoices.filter(i => i.status === 'overdue').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="cyber-card hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{invoice.number}</h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1 capitalize">{invoice.status}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{invoice.client}</p>
                      {invoice.project && (
                        <p className="text-sm text-muted-foreground">Project: {invoice.project}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gradient">£{invoice.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.dateDue).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Invoice Details</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Issued: {new Date(invoice.dateIssued).toLocaleDateString()}</p>
                        <p>Items: {invoice.items.length}</p>
                        {invoice.notes && <p>Notes: {invoice.notes}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Items</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {invoice.items.slice(0, 2).map((item, index) => (
                          <p key={index}>
                            {item.description} - £{item.amount.toLocaleString()}
                          </p>
                        ))}
                        {invoice.items.length > 2 && (
                          <p>+ {invoice.items.length - 2} more items</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    {invoice.status !== 'paid' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSendInvoice(invoice)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {invoice.status === 'draft' ? 'Send' : 'Resend'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}