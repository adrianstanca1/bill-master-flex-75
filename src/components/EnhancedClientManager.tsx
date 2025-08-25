import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Plus,
  Search,
  Filter,
  MessageSquare,
  FileText,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  type: 'individual' | 'business' | 'contractor';
  status: 'active' | 'inactive' | 'prospect';
  rating: number;
  totalProjects: number;
  totalRevenue: number;
  lastContact: string;
  joinDate: string;
  avatar?: string;
  notes: string;
  projects: string[];
}

export function EnhancedClientManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [clients] = useState<Client[]>([
    {
      id: '1',
      name: 'James Thompson',
      company: 'TechCorp Ltd',
      email: 'james@techcorp.com',
      phone: '+44 20 7123 4567',
      address: 'London, UK',
      type: 'business',
      status: 'active',
      rating: 5,
      totalProjects: 3,
      totalRevenue: 125000,
      lastContact: '2024-01-20',
      joinDate: '2023-06-15',
      notes: 'Excellent client, always pays on time. Prefers detailed project updates.',
      projects: ['Office Renovation', 'Warehouse Upgrade', 'Retail Fit-out']
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      company: 'Green Homes Development',
      email: 'sarah@greenhomes.co.uk',
      phone: '+44 121 456 7890',
      address: 'Birmingham, UK',
      type: 'business',
      status: 'active',
      rating: 4,
      totalProjects: 2,
      totalRevenue: 85000,
      lastContact: '2024-01-18',
      joinDate: '2023-09-10',
      notes: 'Environmentally conscious client. Focuses on sustainable building practices.',
      projects: ['Residential Complex', 'Eco Office Build']
    },
    {
      id: '3',
      name: 'Michael Brown',
      company: 'Brown Family Home',
      email: 'mike.brown@email.com',
      phone: '+44 161 789 0123',
      address: 'Manchester, UK',
      type: 'individual',
      status: 'prospect',
      rating: 0,
      totalProjects: 0,
      totalRevenue: 0,
      lastContact: '2024-01-15',
      joinDate: '2024-01-15',
      notes: 'Interested in home extension. Budget around £40k.',
      projects: []
    },
    {
      id: '4',
      name: 'David Clarke',
      company: 'Clarke Construction Services',
      email: 'david@clarkecs.com',
      phone: '+44 117 234 5678',
      address: 'Bristol, UK',
      type: 'contractor',
      status: 'active',
      rating: 4,
      totalProjects: 5,
      totalRevenue: 45000,
      lastContact: '2024-01-12',
      joinDate: '2023-03-20',
      notes: 'Reliable subcontractor for electrical work. Available for urgent projects.',
      projects: ['Office Electrical', 'Retail Lighting', 'Warehouse Power']
    }
  ]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'prospect': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: Client['type']) => {
    switch (type) {
      case 'business': return <Building className="h-4 w-4" />;
      case 'individual': return <Users className="h-4 w-4" />;
      case 'contractor': return <Building className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const handleAddClient = () => {
    toast({
      title: "Add Client",
      description: "New client form would open here"
    });
  };

  const handleContactClient = (client: Client) => {
    toast({
      title: "Contact Client",
      description: `Contacting ${client.name} at ${client.email}`
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Calculate summary stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const avgRating = clients.filter(c => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) / 
                   clients.filter(c => c.rating > 0).length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-gradient">{totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-gradient">{activeClients}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-gradient">£{(totalRevenue / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-gradient">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-primary" />
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
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="all">All Types</option>
                <option value="business">Business</option>
                <option value="individual">Individual</option>
                <option value="contractor">Contractor</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>
            <Button onClick={handleAddClient} className="cyber-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="cyber-card hover-glow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback>
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {getTypeIcon(client.type)}
                  <span className="capitalize">{client.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{client.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-2 border-y border-border">
                <div className="text-center">
                  <p className="text-lg font-semibold">{client.totalProjects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">£{(client.totalRevenue / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>

              {/* Rating */}
              {client.rating > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rating:</span>
                  <div className="flex">
                    {renderStars(client.rating)}
                  </div>
                </div>
              )}

              {/* Last Contact */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last contact: {new Date(client.lastContact).toLocaleDateString()}</span>
              </div>

              {/* Recent Projects */}
              {client.projects.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Projects</h4>
                  <div className="space-y-1">
                    {client.projects.slice(0, 2).map((project, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {project}
                      </p>
                    ))}
                    {client.projects.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        + {client.projects.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {client.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleContactClient(client)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  <FileText className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}