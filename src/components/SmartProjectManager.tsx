import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Filter,
  Search,
  Kanban,
  List,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  team: string[];
  description: string;
  tasks: {
    total: number;
    completed: number;
  };
}

interface NewProject {
  name: string;
  client: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function SmartProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<NewProject>({
    name: '',
    client: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    priority: 'medium'
  });
  const { toast } = useToast();

  useEffect(() => {
    // Mock project data
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Office Renovation Phase 2',
        client: 'TechCorp Ltd',
        status: 'in-progress',
        priority: 'high',
        progress: 65,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-03-30'),
        budget: 85000,
        spent: 52000,
        team: ['John Smith', 'Sarah Johnson', 'Mike Wilson'],
        description: 'Complete renovation of floors 3-5 including electrical and plumbing upgrades.',
        tasks: { total: 24, completed: 16 }
      },
      {
        id: '2',
        name: 'Warehouse Extension',
        client: 'LogiFlow Solutions',
        status: 'planning',
        priority: 'medium',
        progress: 15,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-05-15'),
        budget: 120000,
        spent: 8000,
        team: ['David Brown', 'Lisa Chen'],
        description: 'Extension of existing warehouse facility by 2000 sq ft.',
        tasks: { total: 18, completed: 3 }
      },
      {
        id: '3',
        name: 'Residential Complex',
        client: 'Green Valley Homes',
        status: 'review',
        priority: 'urgent',
        progress: 90,
        startDate: new Date('2023-10-01'),
        endDate: new Date('2024-02-28'),
        budget: 450000,
        spent: 425000,
        team: ['Robert Taylor', 'Emma Davis', 'Tom Anderson', 'Nina Patel'],
        description: 'Construction of 12-unit residential complex with modern amenities.',
        tasks: { total: 45, completed: 41 }
      }
    ];
    setProjects(mockProjects);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const addProject = () => {
    if (!newProject.name || !newProject.client) {
      toast({
        title: "Missing Information",
        description: "Please fill in the project name and client.",
        variant: "destructive"
      });
      return;
    }

    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProject.name,
      client: newProject.client,
      status: 'planning',
      priority: newProject.priority,
      progress: 0,
      startDate: new Date(newProject.startDate),
      endDate: new Date(newProject.endDate),
      budget: parseFloat(newProject.budget) || 0,
      spent: 0,
      team: [],
      description: newProject.description,
      tasks: { total: 0, completed: 0 }
    };

    setProjects(prev => [...prev, project]);
    setNewProject({
      name: '',
      client: '',
      description: '',
      budget: '',
      startDate: '',
      endDate: '',
      priority: 'medium'
    });
    setIsAddingProject(false);

    toast({
      title: "Project Created",
      description: `${project.name} has been added successfully.`,
    });
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{project.client}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('-', ' ')}
          </Badge>
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
        
        <Progress value={project.progress} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>£{project.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{project.endDate.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{project.team.length} team members</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
          <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
        </div>
      </CardContent>
    </Card>
  );

  const KanbanView = () => {
    const statuses = ['planning', 'in-progress', 'review', 'completed', 'on-hold'];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statuses.map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize">{status.replace('-', ' ')}</h3>
              <Badge variant="outline">
                {filteredProjects.filter(p => p.status === status).length}
              </Badge>
            </div>
            <div className="space-y-3">
              {filteredProjects
                .filter(project => project.status === status)
                .map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-4">
      {filteredProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">
            Track and manage all your construction projects
          </p>
        </div>
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Input
                  value={newProject.client}
                  onChange={(e) => setNewProject(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget</label>
                <Input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Project budget"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newProject.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    setNewProject(prev => ({ ...prev, priority: value }))
                  }
                >
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddingProject(false)}>
                Cancel
              </Button>
              <Button onClick={addProject}>
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded-lg p-1">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <Kanban className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
    </div>
  );
}