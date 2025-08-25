import React from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { EmployeeManager } from '@/components/EmployeeManager';
import { TimesheetTracker } from '@/components/TimesheetTracker';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Calendar, FileText } from 'lucide-react';

export default function HR() {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveLayout>
        <SEO 
          title="HR Management | AS Agents" 
          description="Human resources management for your construction business - manage employees, track time, and handle payroll"
        />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">HR Management</h1>
            <p className="text-muted-foreground">
              Manage your team, track working hours, and handle employee administration
            </p>
          </div>

          <Tabs defaultValue="employees" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="timesheets" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timesheets
              </TabsTrigger>
              <TabsTrigger value="payroll" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payroll
              </TabsTrigger>
              <TabsTrigger value="leave" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Leave
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-6">
              <EmployeeManager />
            </TabsContent>

            <TabsContent value="timesheets" className="space-y-6">
              <TimesheetTracker />
            </TabsContent>

            <TabsContent value="payroll" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Payroll Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">Payroll management coming soon</p>
                    <p className="text-sm">Process wages, handle deductions, and generate payslips</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leave" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Leave Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">Leave management coming soon</p>
                    <p className="text-sm">Track holiday requests, sick leave, and staff availability</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveLayout>
    </div>
  );
}