import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Users, UserPlus, BookOpen, Award, Calendar, 
  AlertCircle, CheckCircle, Clock, TrendingUp,
  FileText, Shield, Target
} from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import ErrorHandler from '@/components/ErrorHandler';

export const HRManager: React.FC = () => {
  const companyId = useCompanyId();
  const [activeTab, setActiveTab] = useState('employees');

  // Mock data - replace with real data from your backend
  const employees = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Site Manager',
      startDate: '2022-01-15',
      certifications: ['SMSTS', 'First Aid', 'CSCS Gold'],
      trainingProgress: 85,
      nextTraining: 'Health & Safety Refresher',
      nextTrainingDate: '2024-09-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Carpenter',
      startDate: '2023-03-20',
      certifications: ['CSCS Blue', 'Manual Handling'],
      trainingProgress: 65,
      nextTraining: 'Working at Height',
      nextTrainingDate: '2024-08-20'
    },
    {
      id: 3,
      name: 'Mike Brown',
      role: 'Electrician',
      startDate: '2021-11-08',
      certifications: ['17th Edition', 'CSCS Gold', 'Test & Inspection'],
      trainingProgress: 92,
      nextTraining: '18th Edition Update',
      nextTrainingDate: '2024-10-01'
    }
  ];

  const trainingMatrix = [
    {
      course: 'SMSTS (Site Management Safety Training Scheme)',
      mandatory: true,
      frequency: '5 years',
      completedBy: ['John Smith'],
      pendingFor: ['Sarah Johnson'],
      nextDeadline: '2025-01-15'
    },
    {
      course: 'First Aid at Work',
      mandatory: true,
      frequency: '3 years',
      completedBy: ['John Smith', 'Mike Brown'],
      pendingFor: ['Sarah Johnson'],
      nextDeadline: '2024-09-01'
    },
    {
      course: 'Working at Height',
      mandatory: true,
      frequency: '3 years',
      completedBy: ['Mike Brown'],
      pendingFor: ['John Smith', 'Sarah Johnson'],
      nextDeadline: '2024-08-20'
    },
    {
      course: 'Manual Handling',
      mandatory: true,
      frequency: '3 years',
      completedBy: ['Sarah Johnson', 'Mike Brown'],
      pendingFor: ['John Smith'],
      nextDeadline: '2024-11-15'
    }
  ];

  const certifications = [
    {
      name: 'CSCS Cards',
      description: 'Construction Skills Certification Scheme',
      employees: [
        { name: 'John Smith', level: 'Gold', expiry: '2025-03-15' },
        { name: 'Sarah Johnson', level: 'Blue', expiry: '2025-06-20' },
        { name: 'Mike Brown', level: 'Gold', expiry: '2024-12-08' }
      ]
    },
    {
      name: 'Health & Safety',
      description: 'Various H&S certifications',
      employees: [
        { name: 'John Smith', level: 'SMSTS', expiry: '2025-01-15' },
        { name: 'Mike Brown', level: 'IOSH Managing Safely', expiry: '2025-11-08' }
      ]
    }
  ];

  if (!companyId) {
    return (
      <ErrorHandler 
        error={new Error('Company ID not found')} 
        context="HR Manager"
        showApiKeyPrompt={false}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Manager</h1>
          <p className="text-muted-foreground">
            Manage employees, training, and certifications
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Training Courses</p>
                <p className="text-2xl font-bold">{trainingMatrix.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Certifications</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="training">Training Matrix</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <p className="text-muted-foreground">{employee.role}</p>
                    </div>
                    <Badge variant="outline">
                      Started: {new Date(employee.startDate).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-blue-600" />
                        Certifications
                      </h4>
                      <div className="space-y-2">
                        {employee.certifications.map((cert, i) => (
                          <Badge key={i} variant="secondary">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                        Training Progress
                      </h4>
                      <Progress value={employee.trainingProgress} className="mb-2" />
                      <p className="text-sm text-muted-foreground">{employee.trainingProgress}% complete</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                        Next Training
                      </h4>
                      <p className="text-sm font-medium">{employee.nextTraining}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(employee.nextTrainingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="space-y-4">
            {trainingMatrix.map((training, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{training.course}</CardTitle>
                    <div className="flex items-center gap-2">
                      {training.mandatory && <Badge variant="destructive">Mandatory</Badge>}
                      <Badge variant="outline">Every {training.frequency}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Completed By
                      </h4>
                      <div className="space-y-1">
                        {training.completedBy.map((name, i) => (
                          <div key={i} className="text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-orange-600" />
                        Pending For
                      </h4>
                      <div className="space-y-1">
                        {training.pendingFor.map((name, i) => (
                          <div key={i} className="text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-2 text-orange-600" />
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                        Next Deadline
                      </h4>
                      <p className="text-sm font-medium">
                        {new Date(training.nextDeadline).toLocaleDateString()}
                      </p>
                      <Button size="sm" className="mt-2">
                        Schedule Training
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="space-y-4">
            {certifications.map((certGroup, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{certGroup.name}</CardTitle>
                  <p className="text-muted-foreground">{certGroup.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {certGroup.employees.map((emp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-sm text-muted-foreground">{emp.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Expires: {new Date(emp.expiry).toLocaleDateString()}
                          </p>
                          <Badge 
                            variant={new Date(emp.expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'destructive' : 'default'}
                          >
                            {new Date(emp.expiry) < new Date() ? 'Expired' : 
                             new Date(emp.expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'Expiring Soon' : 'Valid'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HR Reports & Analytics</CardTitle>
              <p className="text-muted-foreground">
                Generate comprehensive reports on training, certifications, and compliance
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Training Compliance Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Shield className="h-6 w-6 mb-2" />
                  Certification Status Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="h-6 w-6 mb-2" />
                  Skills Gap Analysis
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Training ROI Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
