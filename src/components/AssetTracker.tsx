
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Wrench, Truck, AlertTriangle, CheckCircle, 
  MapPin, Calendar, DollarSign, Search, Filter,
  Camera, QrCode, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';

interface Asset {
  id: string;
  company_id: string;
  asset_name: string;
  asset_type: string;
  status: string;
  condition: string;
  purchase_date?: string | null;
  location?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export function AssetTracker() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_type: 'equipment',
    status: 'active',
    condition: 'good',
    purchase_date: '',
    location: '',
    notes: '',
  });

  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Fetch assets
  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('asset_tracking')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!companyId,
  });

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('No company ID');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('asset_tracking')
        .insert({
          company_id: companyId,
          asset_name: formData.asset_name,
          asset_type: formData.asset_type,
          status: formData.status,
          condition: formData.condition,
          purchase_date: formData.purchase_date || null,
          location: formData.location || null,
          notes: formData.notes || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Asset added",
        description: "New asset has been added to your inventory.",
      });
      setFormData({
        asset_name: '',
        asset_type: 'equipment',
        status: 'active',
        condition: 'good',
        purchase_date: '',
        location: '',
        notes: '',
      });
      setShowAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'retired': return 'bg-red-500';
      case 'lost': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'equipment': return <Wrench className="h-5 w-5" />;
      case 'vehicle': return <Truck className="h-5 w-5" />;
      case 'material': return <Package className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  if (!companyId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please set up your company in Settings first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Asset Management
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size={isMobile ? "sm" : "default"}>Add Asset</Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? "w-[95vw] max-w-[95vw]" : ""}>
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Asset Name</label>
                    <Input
                      placeholder="e.g., Excavator CAT 320"
                      value={formData.asset_name}
                      onChange={(e) => setFormData({...formData, asset_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.asset_type} onValueChange={(value) => setFormData({...formData, asset_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="Current location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Purchase Date</label>
                    <Input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Condition</label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Additional notes about this asset..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => createAssetMutation.mutate()}
                  disabled={createAssetMutation.isPending || !formData.asset_name}
                  className="w-full"
                >
                  Add Asset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading assets...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assets found. Add your first asset to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getAssetIcon(asset.asset_type)}
                        <h4 className="font-medium text-sm">{asset.asset_name}</h4>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`} />
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {asset.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {asset.location}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {asset.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {asset.condition}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
