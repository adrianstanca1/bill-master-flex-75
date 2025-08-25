
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Reminder } from '@/types/business';

export function ReminderSystem() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
    category: 'general' as const,
    recurring: false,
    recurring_pattern: '' as const,
    project_id: '',
  });
  
  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  // Fetch reminders
  const { data: reminders } = useQuery({
    queryKey: ['reminders', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data?.map(reminder => ({
        ...reminder,
        priority: 'medium',
        category: 'general', 
        status: reminder.completed ? 'completed' : 'pending',
        recurring: false
      })) as Reminder[];
    },
    enabled: !!companyId,
  });

  // Fetch projects for assignment
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

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('No company ID');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          company_id: companyId,
          title: formData.title,
          description: formData.description,
          due_date: new Date(formData.due_date).toISOString(),
          priority: formData.priority,
          category: formData.category,
          recurring: formData.recurring,
          recurring_pattern: formData.recurring ? formData.recurring_pattern : null,
          project_id: formData.project_id || null,
          created_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Reminder created",
        description: "Your reminder has been set successfully.",
      });
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'general',
        recurring: false,
        recurring_pattern: '',
        project_id: '',
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  // Complete reminder mutation
  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('reminders')
        .update({ completed: true })
        .eq('id', reminderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Reminder completed",
        description: "The reminder has been marked as completed.",
      });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminders & Tasks
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Reminder'}
          </Button>
        </CardHeader>
        
        {showForm && (
          <CardContent className="border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Reminder title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Due Date & Time</label>
                <Input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Additional details..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.recurring}
                onCheckedChange={(checked) => setFormData({...formData, recurring: checked})}
              />
              <label className="text-sm font-medium">Recurring reminder</label>
            </div>

            {formData.recurring && (
              <div>
                <label className="text-sm font-medium">Recurring Pattern</label>
                <Select value={formData.recurring_pattern} onValueChange={(value: any) => setFormData({...formData, recurring_pattern: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={() => createReminderMutation.mutate()}
              disabled={createReminderMutation.isPending || !formData.title || !formData.due_date}
              className="w-full"
            >
              Create Reminder
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Reminders List */}
      {reminders && reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminders
                .filter(reminder => reminder.status === 'pending')
                .map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={`border rounded-lg p-4 space-y-2 ${
                    isOverdue(reminder.due_date) ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(reminder.category)}
                      <h4 className="font-medium">{reminder.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(reminder.priority)}`} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => completeReminderMutation.mutate(reminder.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Due: {new Date(reminder.due_date).toLocaleString()}</span>
                    <Badge variant="secondary" className="text-xs">
                      {reminder.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {reminder.category}
                    </Badge>
                    {isOverdue(reminder.due_date) && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
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
