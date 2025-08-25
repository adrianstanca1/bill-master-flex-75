
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, Image, MapPin, Calendar, Tag, 
  Upload, Download, Eye, Trash2, Filter,
  Grid3X3, List, Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';

interface SitePhoto {
  id: string;
  url: string;
  caption?: string;
  project_id?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  photo_date?: string;
}

export function SitePhotos() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    caption: '',
    tags: '',
    project_id: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Fetch projects for filtering
  const { data: projects } = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', companyId);
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch site photos
  const { data: photos, isLoading } = useQuery({
    queryKey: ['site-photos', companyId, selectedProject],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        .from('site_photos')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (selectedProject !== 'all') {
        query = query.eq('project_id', selectedProject);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(photo => ({
        ...photo,
        photo_date: photo.created_at // Use created_at as photo_date
      })) as SitePhoto[];
    },
    enabled: !!companyId,
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async () => {
      if (!companyId || !selectedImage) throw new Error('Missing required data');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload image to storage (simulated - in real app would use Supabase storage)
      const imageUrl = URL.createObjectURL(selectedImage);
      
      const tags = uploadData.tags ? uploadData.tags.split(',').map(tag => tag.trim()) : [];

      const { data, error } = await supabase
        .from('site_photos')
        .insert({
          company_id: companyId,
          url: imageUrl,
          caption: uploadData.caption,
          project_id: uploadData.project_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Photo uploaded",
        description: "Site photo has been added successfully.",
      });
      setUploadData({ caption: '', tags: '', project_id: '' });
      setSelectedImage(null);
      setShowUploadDialog(false);
      queryClient.invalidateQueries({ queryKey: ['site-photos'] });
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const filteredPhotos = photos?.filter(photo => {
    const matchesSearch = photo.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }) || [];

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
            <Camera className="h-5 w-5" />
            Site Photos
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "sm" : "default"}>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? "w-[95vw] max-w-[95vw]" : ""}>
                <DialogHeader>
                  <DialogTitle>Upload Site Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Select Image</label>
                    <div className="mt-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full h-32 border-dashed"
                      >
                        {selectedImage ? (
                          <div className="text-center">
                            <Image className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">{selectedImage.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Click to select image</p>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Caption</label>
                    <Textarea
                      placeholder="Describe what this photo shows..."
                      value={uploadData.caption}
                      onChange={(e) => setUploadData({...uploadData, caption: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Project</label>
                    <Select value={uploadData.project_id} onValueChange={(value) => setUploadData({...uploadData, project_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <Input
                      placeholder="foundation, concrete, progress (comma separated)"
                      value={uploadData.tags}
                      onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                    />
                  </div>

                  <Button 
                    onClick={() => uploadPhotoMutation.mutate()}
                    disabled={uploadPhotoMutation.isPending || !selectedImage}
                    className="w-full"
                  >
                    Upload Photo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading photos...</div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No photos found. Upload your first site photo to get started.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Site photo'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {photo.caption && (
                        <p className="text-sm line-clamp-2">{photo.caption}</p>
                      )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(photo.created_at).toLocaleDateString()}
                        </div>
                      {photo.tags && photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {photo.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {photo.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{photo.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Site photo'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">
                            {photo.caption || 'Untitled Photo'}
                          </h4>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(photo.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {photo.tags && photo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {photo.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
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
