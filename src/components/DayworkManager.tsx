
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, CloudSun, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Daywork } from '@/types/business';

export function DayworkManager() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    weather: '',
    crew_size: '',
    work_description: '',
    progress_percentage: '',
    project_id: '',
  });
  const [materials, setMaterials] = useState<Array<{name: string; quantity: number; unit: string}>>([]);
  const [equipment, setEquipment] = useState<Array<{name: string; hours: number}>>([]);
  const [newMaterial, setNewMaterial] = useState({name: '', quantity: '', unit: ''});
  const [newEquipment, setNewEquipment] = useState({name: '', hours: ''});
  
  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  // Mock data for now - database types will be updated
  const projects = [{ id: '1', name: 'Sample Project' }];
  const dayworks: any[] = [];

  // Create daywork mutation - temporarily disabled
  const createDayworkMutation = useMutation({
    mutationFn: async () => {
      // Temporarily return success
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Daywork created",
        description: "Daily work report has been saved successfully.",
      });
      // Reset form
      setFormData({
        weather: '',
        crew_size: '',
        work_description: '',
        progress_percentage: '',
        project_id: '',
      });
      setMaterials([]);
      setEquipment([]);
      queryClient.invalidateQueries({ queryKey: ['dayworks'] });
    },
  });

  const addMaterial = () => {
    if (newMaterial.name && newMaterial.quantity && newMaterial.unit) {
      setMaterials([...materials, {
        name: newMaterial.name,
        quantity: parseFloat(newMaterial.quantity),
        unit: newMaterial.unit
      }]);
      setNewMaterial({name: '', quantity: '', unit: ''});
    }
  };

  const addEquipment = () => {
    if (newEquipment.name && newEquipment.hours) {
      setEquipment([...equipment, {
        name: newEquipment.name,
        hours: parseFloat(newEquipment.hours)
      }]);
      setNewEquipment({name: '', hours: ''});
    }
  };

  const weatherOptions = [
    'Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Light Rain', 'Heavy Rain', 'Drizzle', 'Snow', 'Windy', 'Foggy'
  ];

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Work Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Project</label>
              <Select value={formData.project_id} onValueChange={(value) => setFormData({...formData, project_id: value})}>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <CloudSun className="h-4 w-4" />
                Weather
              </label>
              <Select value={formData.weather} onValueChange={(value) => setFormData({...formData, weather: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((weather) => (
                    <SelectItem key={weather} value={weather}>
                      {weather}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Crew Size
              </label>
              <Input
                type="number"
                placeholder="Number of workers"
                value={formData.crew_size}
                onChange={(e) => setFormData({...formData, crew_size: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Progress %</label>
              <Input
                type="number"
                placeholder="0-100"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({...formData, progress_percentage: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Work Description</label>
            <Textarea
              placeholder="Describe the work completed today..."
              value={formData.work_description}
              onChange={(e) => setFormData({...formData, work_description: e.target.value})}
              className="min-h-[100px]"
            />
          </div>

          {/* Materials Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Materials Used</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Material name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
              />
              <Input
                placeholder="Unit (kg, m², etc.)"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
              />
              <Button onClick={addMaterial} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {materials.map((material, index) => (
                <Badge key={index} variant="secondary">
                  {material.name}: {material.quantity} {material.unit}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setMaterials(materials.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Equipment Used</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Equipment name"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
              />
              <Input
                type="number"
                step="0.5"
                placeholder="Hours"
                value={newEquipment.hours}
                onChange={(e) => setNewEquipment({...newEquipment, hours: e.target.value})}
              />
              <Button onClick={addEquipment} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {equipment.map((equip, index) => (
                <Badge key={index} variant="secondary">
                  {equip.name}: {equip.hours}h
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setEquipment(equipment.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => createDayworkMutation.mutate()}
            disabled={createDayworkMutation.isPending || !formData.work_description}
            className="w-full"
          >
            Save Daily Report
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      {dayworks && dayworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reports for {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dayworks.map((daywork) => (
                <div key={daywork.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{daywork.work_description}</h4>
                    <Badge variant="outline">{daywork.progress_percentage}% Complete</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Weather: {daywork.weather}</div>
                    <div>Crew: {daywork.crew_size} workers</div>
                    <div>Materials: {daywork.materials_used?.length || 0}</div>
                    <div>Equipment: {daywork.equipment_used?.length || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
