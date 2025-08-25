import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  MapPin,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  team: string[];
  location: string;
  description: string;
  milestones: { name: string; completed: boolean; date: string }[];
}

export function EnhancedProjectTracker() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Commercial Office Renovation',
      client: 'TechCorp Ltd',
      status: 'active',
      priority: 'high',
      progress: 65,
      budget: 250000,
      spent: 162500,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      team: ['John Smith', 'Sarah Wilson', 'Mike Johnson'],
      location: 'Manchester',
      description: 'Complete renovation of 3-story office building',
      milestones: [
        { name: 'Design Phase', completed: true, date: '2024-02-15' },
        { name: 'Permits Approved', completed: true, date: '2024-03-01' },
        { name: 'Structural Work', completed: false, date: '2024-04-15' },
        { name: 'Interior Fit-out', completed: false, date: '2024-05-30' }
      ]
    },
    {
      id: '2',
      name: 'Residential Complex',
      client: 'Green Homes',
      status: 'planning',
      priority: 'medium',
      progress: 25,
      budget: 1200000,
      spent: 300000,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      team: ['Emma Davis', 'Tom Brown'],
      location: 'Birmingham',
      description: '50-unit residential development',
      milestones: [
        { name: 'Land Survey', completed: true, date: '2024-03-15' },
        { name: 'Planning Permission', completed: false, date: '2024-04-30' },
        { name: 'Ground Works', completed: false, date: '2024-06-01' },
        { name: 'Building Phase 1', completed: false, date: '2024-09-01' }
      ]
    }
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'planning': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const handleCreateProject = () => {
    toast({
      title: "Create Project",
      description: "New project creation dialog would open here"
    });
  };

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-gradient">{activeProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-gradient">£{(totalBudget / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-2xl font-bold text-gradient">{((totalSpent / totalBudget) * 100).toFixed(0)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-gradient">{avgProgress.toFixed(0)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
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
                  placeholder="Search projects..."
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
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <Button onClick={handleCreateProject} className="cyber-button">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="cyber-card hover-glow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.description}</p>
              
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Budget */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget Usage</span>
                  <span>£{project.spent.toLocaleString()} / £{project.budget.toLocaleString()}</span>
                </div>
                <Progress value={(project.spent / project.budget) * 100} className="h-2" />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{project.team.length} members</span>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="text-sm font-medium mb-2">Milestones</h4>
                <div className="space-y-1">
                  {project.milestones.slice(0, 3).map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle 
                        className={`h-4 w-4 ${milestone.completed ? 'text-green-500' : 'text-muted-foreground'}`} 
                      />
                      <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                        {milestone.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Update Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}