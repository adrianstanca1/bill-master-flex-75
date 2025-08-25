
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Users, MapPin, Clock, Wrench, 
  TrendingUp, AlertTriangle, CheckCircle,
  Cloud, Thermometer, Zap, Package
} from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import ErrorHandler from '@/components/ErrorHandler';

interface ScheduledTask {
  id: string;
  title: string;
  project: string;
  assignedTo: string[];
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  materials: string[];
  weather: {
    condition: string;
    temperature: number;
    precipitation: number;
  };
  dependencies: string[];
  priority: 'high' | 'medium' | 'low';
}

interface MaterialAlert {
  id: string;
  material: string;
  currentStock: number;
  requiredStock: number;
  supplier: string;
  estimatedDelivery: string;
  autoOrderSuggested: boolean;
}

export const OperationsScheduler: React.FC = () => {
  const companyId = useCompanyId();
  const [activeTab, setActiveTab] = useState('schedule');

  const scheduledTasks: ScheduledTask[] = [
    {
      id: '1',
      title: 'Soffit Grid Installation',
      project: 'Dagenham Roofing Project',
      assignedTo: ['John Smith', 'Mike Brown'],
      startDate: '2025-08-15',
      endDate: '2025-08-16',
      status: 'pending',
      materials: ['Top hats', 'Channel sections', 'Fixing brackets'],
      weather: {
        condition: 'Clear',
        temperature: 22,
        precipitation: 0
      },
      dependencies: ['Insulation Installation'],
      priority: 'high'
    },
    {
      id: '2',
      title: 'Insulation Installation',
      project: 'Dagenham Roofing Project',
      assignedTo: ['Sarah Johnson'],
      startDate: '2025-08-13',
      endDate: '2025-08-14',
      status: 'in-progress',
      materials: ['50mm Stone wool', 'Vapor barrier'],
      weather: {
        condition: 'Partly cloudy',
        temperature: 20,
        precipitation: 10
      },
      dependencies: [],
      priority: 'high'
    },
    {
      id: '3',
      title: 'Boarding Installation',
      project: 'Dagenham Roofing Project',
      assignedTo: ['John Smith', 'Sarah Johnson'],
      startDate: '2025-08-17',
      endDate: '2025-08-19',
      status: 'pending',
      materials: ['Sinat board', 'Screws', 'Adhesive'],
      weather: {
        condition: 'Light rain',
        temperature: 18,
        precipitation: 40
      },
      dependencies: ['Soffit Grid Installation'],
      priority: 'medium'
    }
  ];

  const materialAlerts: MaterialAlert[] = [
    {
      id: '1',
      material: '50mm Stone wool',
      currentStock: 5,
      requiredStock: 20,
      supplier: 'BuildMart Supplies',
      estimatedDelivery: '2025-08-14',
      autoOrderSuggested: true
    },
    {
      id: '2',
      material: 'Channel sections',
      currentStock: 10,
      requiredStock: 15,
      supplier: 'Metal Works Ltd',
      estimatedDelivery: '2025-08-16',
      autoOrderSuggested: false
    }
  ];

  const handleAutoOrder = (materialId: string) => {
    const material = materialAlerts.find(m => m.id === materialId);
    if (material) {
      console.log(`Auto-ordering ${material.material} from ${material.supplier}`);
      // Implement auto-ordering logic
    }
  };

  if (!companyId) {
    return (
      <ErrorHandler 
        error={new Error('Company ID not found')} 
        context="Operations Scheduler"
        showApiKeyPrompt={false}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations & Scheduling</h1>
          <p className="text-muted-foreground">
            AI-powered project scheduling and resource optimization
          </p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{scheduledTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Workers Assigned</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Material Alerts</p>
                <p className="text-2xl font-bold">{materialAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Efficiency Score</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Task Schedule</TabsTrigger>
          <TabsTrigger value="materials">Material Management</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="space-y-4">
            {scheduledTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{task.project}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                        Assigned Workers
                      </h4>
                      <div className="space-y-1">
                        {task.assignedTo.map((worker, i) => (
                          <Badge key={i} variant="outline">{worker}</Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-medium mb-2 mt-4 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        Schedule
                      </h4>
                      <p className="text-sm">
                        {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Package className="h-4 w-4 mr-2 text-purple-600" />
                        Required Materials
                      </h4>
                      <div className="space-y-1">
                        {task.materials.map((material, i) => (
                          <div key={i} className="text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                            {material}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Cloud className="h-4 w-4 mr-2 text-blue-600" />
                        Weather Forecast
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Condition:</span>
                          <span>{task.weather.condition}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Temperature:</span>
                          <span>{task.weather.temperature}°C</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Rain chance:</span>
                          <span>{task.weather.precipitation}%</span>
                        </div>
                      </div>
                      
                      {task.dependencies.length > 0 && (
                        <>
                          <h4 className="font-medium mb-2 mt-4 flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-orange-600" />
                            Dependencies
                          </h4>
                          {task.dependencies.map((dep, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{dep}</Badge>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {task.weather.precipitation > 30 && (
                          <div className="flex items-center text-orange-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Weather may impact schedule
                          </div>
                        )}
                      </div>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <div className="space-y-4">
            {materialAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2 text-orange-600" />
                      {alert.material}
                    </CardTitle>
                    {alert.autoOrderSuggested && (
                      <Badge variant="destructive">Auto-order recommended</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Stock Levels</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Stock:</span>
                          <span className="font-medium">{alert.currentStock} units</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Required:</span>
                          <span className="font-medium">{alert.requiredStock} units</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Shortage:</span>
                          <span className="font-medium text-red-600">
                            {alert.requiredStock - alert.currentStock} units
                          </span>
                        </div>
                        <Progress 
                          value={(alert.currentStock / alert.requiredStock) * 100} 
                          className="mt-2" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Supplier Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Supplier:</span>
                          <p className="font-medium">{alert.supplier}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Est. Delivery:</span>
                          <p className="font-medium">{new Date(alert.estimatedDelivery).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant={alert.autoOrderSuggested ? "default" : "outline"}
                          onClick={() => handleAutoOrder(alert.id)}
                        >
                          {alert.autoOrderSuggested ? 'Auto-Order Now' : 'Manual Order'}
                        </Button>
                        <Button variant="outline" className="w-full">
                          Find Alternative Supplier
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Optimization Recommendations</CardTitle>
              <p className="text-muted-foreground">
                Intelligent scheduling and resource optimization suggestions
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Weather Optimization</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Rain predicted for Aug 17-19. Recommend moving indoor tasks (Boarding Installation) 
                    to these dates and rescheduling outdoor work.
                  </p>
                  <Button size="sm" variant="outline">Apply Suggestion</Button>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Resource Allocation</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Assign John Smith to Soffit Grid Installation on Aug 15. His experience with 
                    similar tasks will reduce completion time by 15%.
                  </p>
                  <Button size="sm" variant="outline">Apply Suggestion</Button>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Material Procurement</h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Stone wool prices have dropped 5% this week. Recommend ordering extra 
                    stock now for future projects to save an estimated £150.
                  </p>
                  <Button size="sm" variant="outline">Apply Suggestion</Button>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Dependency Optimization</h3>
                  <p className="text-sm text-purple-700 mb-3">
                    Parallelize insulation and soffit preparation work to reduce overall 
                    project timeline by 2 days without affecting quality.
                  </p>
                  <Button size="sm" variant="outline">Apply Suggestion</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
