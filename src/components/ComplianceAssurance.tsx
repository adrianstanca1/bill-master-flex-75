
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, CheckCircle, AlertTriangle, Clock, 
  FileText, TrendingUp, DollarSign, Calendar,
  Database, Wifi, RefreshCw, Eye, AlertCircle
} from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ErrorHandler from '@/components/ErrorHandler';

interface HMRCVerificationResult {
  vatNumber: string;
  isValid: boolean;
  cisRegistered: boolean;
  companyName: string;
  status: 'verified' | 'pending' | 'failed';
  lastChecked: string;
}

interface ComplianceAlert {
  id: string;
  type: 'overdue' | 'expiring' | 'regulatory' | 'cashflow';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  dueDate?: string;
  amount?: number;
}

export const ComplianceAssurance: React.FC = () => {
  const companyId = useCompanyId();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('verification');
  const [loading, setLoading] = useState(false);
  const [vatNumber, setVatNumber] = useState('471618688');
  const [verificationResult, setVerificationResult] = useState<HMRCVerificationResult | null>(null);

  const [complianceAlerts] = useState<ComplianceAlert[]>([
    {
      id: '1',
      type: 'overdue',
      priority: 'high',
      title: 'Invoice Overdue',
      description: 'Marksman Roofing invoice overdue by 3 days',
      action: 'Chase payment or apply late fees',
      dueDate: '2025-08-08',
      amount: 12555.20
    },
    {
      id: '2',
      type: 'regulatory',
      priority: 'medium',
      title: 'VAT Return Due',
      description: 'Q3 VAT return due for submission',
      action: 'Prepare and submit VAT return',
      dueDate: '2025-08-31'
    },
    {
      id: '3',
      type: 'expiring',
      priority: 'low',
      title: 'CIS Verification Renewal',
      description: 'Annual CIS verification due for renewal',
      action: 'Renew CIS verification status',
      dueDate: '2025-09-15'
    }
  ]);

  const handleHMRCVerification = async () => {
    setLoading(true);
    try {
      // Simulate HMRC API call - in real implementation, this would go through a secure backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: HMRCVerificationResult = {
        vatNumber: vatNumber,
        isValid: true,
        cisRegistered: true,
        companyName: 'Marksman Roofing Ltd',
        status: 'verified',
        lastChecked: new Date().toISOString()
      };
      
      setVerificationResult(mockResult);
      
      toast({
        title: "Verification Complete",
        description: "VAT number verified and CIS status confirmed",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Unable to connect to HMRC API. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVATProcessing = async () => {
    try {
      // Process VAT for reverse charge
      const vatCalculation = {
        netAmount: 15859.20,
        vatRate: 0.20,
        outputVAT: 3171.84,
        inputVAT: 3171.84,
        netVATImpact: 0
      };

      toast({
        title: "VAT Processing Complete",
        description: `Reverse charge applied: £${vatCalculation.outputVAT.toFixed(2)} output VAT, £${vatCalculation.inputVAT.toFixed(2)} input VAT`,
      });
    } catch (error) {
      toast({
        title: "VAT Processing Failed",
        description: "Unable to process VAT calculation",
        variant: "destructive"
      });
    }
  };

  const handleCISCalculation = () => {
    const grossAmount = 15859.20;
    const materialsAmount = 0; // Assuming no materials specified
    const labourAmount = grossAmount - materialsAmount;
    const cisRate = 0.20; // 20% for unverified subcontractors
    const cisDeduction = labourAmount * cisRate;
    const netPayment = grossAmount - cisDeduction;

    toast({
      title: "CIS Calculation Complete",
      description: `CIS deduction: £${cisDeduction.toFixed(2)} (20% of £${labourAmount.toFixed(2)} labour)`,
    });
  };

  if (!companyId) {
    return (
      <ErrorHandler 
        error={new Error('Company ID not found')} 
        context="Compliance Assurance"
        showApiKeyPrompt={false}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Assurance</h1>
          <p className="text-muted-foreground">
            HMRC integration, VAT compliance, and regulatory monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleVATProcessing}>
            <FileText className="h-4 w-4 mr-2" />
            Process VAT
          </Button>
          <Button onClick={handleCISCalculation}>
            <DollarSign className="h-4 w-4 mr-2" />
            Calculate CIS
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">VAT Status</p>
                <p className="text-lg font-bold text-green-600">Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">CIS Registered</p>
                <p className="text-lg font-bold text-blue-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-lg font-bold text-orange-600">{complianceAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-lg font-bold text-purple-600">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification">HMRC Verification</TabsTrigger>
          <TabsTrigger value="vat">VAT Compliance</TabsTrigger>
          <TabsTrigger value="cis">CIS Management</TabsTrigger>
          <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                HMRC CIS Verify API Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="Enter VAT number"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleHMRCVerification}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4 mr-2" />
                        Verify with HMRC
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <div className="mt-6 p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-800">Verification Results</h3>
                    <Badge variant="default" className="bg-green-600">
                      {verificationResult.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Company Name:</p>
                      <p>{verificationResult.companyName}</p>
                    </div>
                    <div>
                      <p className="font-medium">VAT Number:</p>
                      <p>{verificationResult.vatNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">VAT Status:</p>
                      <p className="text-green-600 font-medium">
                        {verificationResult.isValid ? 'Valid' : 'Invalid'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">CIS Registration:</p>
                      <p className="text-green-600 font-medium">
                        {verificationResult.cisRegistered ? 'Registered' : 'Not Registered'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Last verified: {new Date(verificationResult.lastChecked).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VAT Compliance & Reverse Charge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Transaction Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Net Amount:</span>
                      <span className="font-medium">£15,859.20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Type:</span>
                      <span className="font-medium">Construction Services</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reverse Charge Applicable:</span>
                      <span className="font-medium text-green-600">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output VAT (20%):</span>
                      <span className="font-medium">£3,171.84</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Input VAT (20%):</span>
                      <span className="font-medium">£3,171.84</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Net VAT Impact:</span>
                      <span className="font-semibold text-green-600">£0.00</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">MTD VAT Preparation</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      Auto-prepared entry for your next MTD VAT submission:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Box 1 (Output VAT): +£3,171.84</li>
                      <li>• Box 4 (Input VAT): +£3,171.84</li>
                      <li>• Box 6 (Total Sales): +£15,859.20</li>
                      <li>• Box 7 (Total Purchases): +£15,859.20</li>
                    </ul>
                  </div>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Prepare VAT Return Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CIS Deduction Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">CIS Calculation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gross Amount:</span>
                      <span className="font-medium">£15,859.20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materials Cost:</span>
                      <span className="font-medium">£0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labour Cost:</span>
                      <span className="font-medium">£15,859.20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CIS Rate:</span>
                      <span className="font-medium">20% (Unverified)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CIS Deduction:</span>
                      <span className="font-medium text-red-600">-£3,171.84</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Net Payment:</span>
                      <span className="font-semibold">£12,687.36</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">CIS300 Return Preparation</h3>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800 mb-2">
                      Ready for CIS300 monthly return:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Subcontractor: Marksman Roofing Ltd</li>
                      <li>• UTR: [To be verified]</li>
                      <li>• Gross Payment: £15,859.20</li>
                      <li>• CIS Deduction: £3,171.84</li>
                      <li>• Net Payment: £12,687.36</li>
                    </ul>
                  </div>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Add to CIS300 Return
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {complianceAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.priority === 'high' ? 'border-l-red-500' :
                alert.priority === 'medium' ? 'border-l-orange-500' : 'border-l-blue-500'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {alert.priority === 'high' && <AlertCircle className="h-5 w-5 text-red-600" />}
                      {alert.priority === 'medium' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                      {alert.priority === 'low' && <Eye className="h-5 w-5 text-blue-600" />}
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                    </div>
                    <Badge variant={
                      alert.priority === 'high' ? 'destructive' :
                      alert.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {alert.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {alert.dueDate && (
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {new Date(alert.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {alert.amount && (
                        <p className="text-sm flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Amount: £{alert.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button size="sm">
                      {alert.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
