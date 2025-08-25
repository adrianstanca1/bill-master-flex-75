
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calculator, 
  Users, 
  Calendar, 
  Settings, 
  MessageSquare,
  PieChart,
  Building2,
  ClipboardList,
  Camera
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  route?: string;
  onClick?: () => void;
  color: string;
}

const QuickActionsPanel = memo(() => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'create-invoice',
      title: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: FileText,
      route: '/invoices',
      color: 'text-blue-600'
    },
    {
      id: 'new-quote',
      title: 'New Quote',
      description: 'Create project quote',
      icon: Calculator,
      route: '/quotes',
      color: 'text-green-600'
    },
    {
      id: 'manage-team',
      title: 'Team Management',
      description: 'Manage team & resources',
      icon: Users,
      onClick: () => console.log('Team management'),
      color: 'text-purple-600'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'View project timeline',
      icon: Calendar,
      onClick: () => console.log('Schedule'),
      color: 'text-orange-600'
    },
    {
      id: 'crm',
      title: 'CRM',
      description: 'Customer relationship',
      icon: Building2,
      route: '/crm',
      color: 'text-indigo-600'
    },
    {
      id: 'variations',
      title: 'Variations',
      description: 'Project variations',
      icon: PieChart,
      route: '/variations',
      color: 'text-pink-600'
    },
    {
      id: 'advisor',
      title: 'AI Advisor',
      description: 'Get AI assistance',
      icon: MessageSquare,
      route: '/advisor',
      color: 'text-emerald-600'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Business analytics',
      icon: ClipboardList,
      onClick: () => console.log('Reports'),
      color: 'text-cyan-600'
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.route) {
      navigate(action.route);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              onClick={() => handleActionClick(action)}
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

QuickActionsPanel.displayName = 'QuickActionsPanel';

export { QuickActionsPanel };
