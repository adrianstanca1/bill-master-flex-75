import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  Calendar, 
  FileText,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Award,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  Shield
} from 'lucide-react';
import { EmployeeManager } from '@/components/EmployeeManager';
import { TimesheetTracker } from '@/components/TimesheetTracker';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  skills: string[];
  certifications: string[];
  performance: number;
}

interface PayrollItem {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  overtime: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'processed' | 'paid';
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'holiday' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export function EnhancedHRModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const { canViewSalaries, isAdmin, isManager, loading: roleLoading } = useRoleBasedAccess();
  
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      position: 'Site Supervisor',
      department: 'Operations',
      salary: 45000,
      startDate: '2022-03-15',
      status: 'active',
      skills: ['Project Management', 'Safety Compliance', 'Team Leadership'],
      certifications: ['CSCS Gold Card', 'First Aid'],
      performance: 92
    },
    {
      id: '2',
      name: 'Mike Thompson',
      email: 'mike.thompson@example.com',
      position: 'Quantity Surveyor',
      department: 'Finance',
      salary: 52000,
      startDate: '2021-08-01',
      status: 'active',
      skills: ['Cost Estimation', 'Contract Management', 'Risk Assessment'],
      certifications: ['RICS Membership', 'PRINCE2'],
      performance: 88
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      position: 'Health & Safety Officer',
      department: 'Safety',
      salary: 38000,
      startDate: '2023-01-10',
      status: 'on-leave',
      skills: ['Risk Assessment', 'Incident Investigation', 'Training'],
      certifications: ['NEBOSH General Certificate', 'IOSH Managing Safely'],
      performance: 95
    }
  ]);

  const [payrollItems] = useState<PayrollItem[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Sarah Johnson',
      period: 'January 2024',
      baseSalary: 3750,
      overtime: 450,
      deductions: 850,
      netPay: 3350,
      status: 'processed'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Mike Thompson',
      period: 'January 2024',
      baseSalary: 4333,
      overtime: 200,
      deductions: 920,
      netPay: 3613,
      status: 'paid'
    }
  ]);

  const [leaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Sarah Johnson',
      type: 'holiday',
      startDate: '2024-02-15',
      endDate: '2024-02-22',
      days: 6,
      status: 'pending',
      reason: 'Family holiday'
    },
    {
      id: '2',
      employeeId: '3',
      employeeName: 'Emma Davis',
      type: 'sick',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      days: 4,
      status: 'approved',
      reason: 'Medical appointment and recovery'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSalaryBudget = canViewSalaries ? employees.reduce((sum, emp) => sum + emp.salary, 0) : 0;
  const averagePerformance = employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const pendingLeaves = leaveRequests.filter(req => req.status === 'pending').length;

  // Security alert for unauthorized access attempts
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HR Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        {canViewSalaries ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalSalaryBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Annual total
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Restricted</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Salary information requires manager access</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePerformance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">
              Leave requests awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="leave">Leave Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Team Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.position}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{employee.performance}%</div>
                        <Progress value={employee.performance} className="w-20 h-2" />
                      </div>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeManager />
          
          {/* Enhanced Employee Directory */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{employee.name}</h4>
                            <Badge className={getStatusColor(employee.status)}>
                              {employee.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {employee.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          {canViewSalaries ? (
                            <div className="text-sm font-medium">£{employee.salary.toLocaleString()}/year</div>
                          ) : (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Restricted
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Started: {new Date(employee.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{employee.performance}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-6">
          <TimesheetTracker />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          {canViewSalaries ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payroll Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Current Payroll Period: January 2024</h4>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Process Payroll
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {payrollItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{item.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{item.period}</div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm text-right">
                          <div>
                            <div className="text-muted-foreground">Base</div>
                            <div>£{item.baseSalary}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Overtime</div>
                            <div>£{item.overtime}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Deductions</div>
                            <div>-£{item.deductions}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Net Pay</div>
                            <div className="font-bold">£{item.netPay}</div>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Restricted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Payroll information requires manager or admin access. Contact your administrator for permission.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Leave Requests</h4>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {leaveRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{request.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </div>
                        {request.reason && (
                          <div className="text-sm text-muted-foreground italic">
                            "{request.reason}"
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-sm font-medium">{request.days} days</div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}