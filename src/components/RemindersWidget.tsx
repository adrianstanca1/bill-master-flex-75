
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Plus } from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  priority: string;
  created_at: string;
}

export const RemindersWidget: React.FC = () => {
  const companyId = useCompanyId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<string>('');

  // Fetch reminders
  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('reminders')
        .select('id, title, description, due_date, completed, created_at')
        .eq('company_id', companyId)
        .order('due_date', { ascending: true })
        .limit(10);
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

  // Real-time subscription
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reminders', companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  // Add reminder mutation
  const addReminderMutation = useMutation({
    mutationFn: async () => {
      if (!companyId || !title.trim() || !due) {
        throw new Error('Missing required fields');
      }

      const { error } = await supabase.from('reminders').insert({
        company_id: companyId,
        title: title.trim(),
        due_date: new Date(due).toISOString(),
        priority: 'medium',
        category: 'general',
        status: 'pending'
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setTitle('');
      setDue('');
      toast({ title: 'Reminder added successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Could not create reminder', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  // Mark done mutation
  const markDoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .update({ completed: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Reminder marked as completed' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update reminder', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!companyId ? (
          <div className="text-sm text-muted-foreground">
            Set up your company in Settings to enable reminders.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Title</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Task title" 
                />
              </div>
              <div>
                <Label className="text-xs">Due date</Label>
                <Input 
                  type="date" 
                  value={due} 
                  onChange={(e) => setDue(e.target.value)} 
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => addReminderMutation.mutate()} 
                  disabled={addReminderMutation.isPending || !title.trim() || !due}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Loading reminders...
              </div>
            ) : (
              <ul className="space-y-2">
                {reminders?.map(reminder => (
                  <li key={reminder.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{reminder.title}</div>
                        <span className={`text-xs ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        {isOverdue(reminder.due_date) && reminder.status !== 'completed' && (
                          <span className="text-xs text-red-600 font-medium">OVERDUE</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due {new Date(reminder.due_date).toLocaleDateString()} • {reminder.status}
                      </div>
                    </div>
                    <div>
                      {reminder.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => markDoneMutation.mutate(reminder.id)}
                          disabled={markDoneMutation.isPending}
                        >
                          Mark done
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
                {reminders?.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No reminders yet. Add your first reminder above!
                  </div>
                )}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
