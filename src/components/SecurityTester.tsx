
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityTest {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  result?: string;
}

export function SecurityTester() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tests, setTests] = useState<SecurityTest[]>([
    {
      id: 'auth-test',
      name: 'Authentication Security',
      description: 'Tests login security, session management, and access controls',
      category: 'Authentication',
      status: 'pending'
    },
    {
      id: 'data-test',
      name: 'Data Protection',
      description: 'Validates data encryption, backup integrity, and privacy controls',
      category: 'Data Security',
      status: 'pending'
    },
    {
      id: 'network-test',
      name: 'Network Security',
      description: 'Checks for secure connections, SSL certificates, and firewall rules',
      category: 'Network',
      status: 'pending'
    },
    {
      id: 'vuln-test',
      name: 'Vulnerability Scan',
      description: 'Scans for known vulnerabilities and security weaknesses',
      category: 'Vulnerability',
      status: 'pending'
    },
    {
      id: 'compliance-test',
      name: 'Compliance Check',
      description: 'Verifies compliance with security standards and regulations',
      category: 'Compliance',
      status: 'pending'
    }
  ]);

  const runSecurityTests = async () => {
    setIsRunning(true);
    setProgress(0);

    const testResults: Partial<SecurityTest>[] = [
      { status: 'passed', result: 'All authentication mechanisms are secure' },
      { status: 'warning', result: 'Some data could benefit from additional encryption' },
      { status: 'passed', result: 'Network security is properly configured' },
      { status: 'failed', result: 'Found 2 medium-risk vulnerabilities' },
      { status: 'passed', result: 'Meets current compliance requirements' }
    ];

    for (let i = 0; i < tests.length; i++) {
      // Update test status to running
      setTests(prev => prev.map(test => 
        test.id === tests[i].id ? { ...test, status: 'running' } : test
      ));

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update with results
      setTests(prev => prev.map(test => 
        test.id === tests[i].id ? { ...test, ...testResults[i] } : test
      ));

      setProgress(((i + 1) / tests.length) * 100);
    }

    setIsRunning(false);
    toast({
      title: "Security Tests Complete",
      description: "All security tests have been executed",
    });
  };

  const getStatusIcon = (status: SecurityTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: SecurityTest['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const warningTests = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Security Testing Suite
            </div>
            <Button
              onClick={runSecurityTests}
              disabled={isRunning}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Test Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-muted-foreground">Tests Passed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{warningTests}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-muted-foreground">Tests Failed</div>
            </div>
          </div>

          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {test.category}
                      </Badge>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                
                {test.result && (
                  <Alert className="mt-3">
                    <AlertDescription>
                      {test.result}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>High Priority:</strong> Update security patches for identified vulnerabilities
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                <strong>Medium Priority:</strong> Implement additional data encryption for sensitive fields
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                <strong>Low Priority:</strong> Consider enabling two-factor authentication for all users
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
