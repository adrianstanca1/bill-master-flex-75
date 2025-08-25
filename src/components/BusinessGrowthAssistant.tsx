import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp, Shield, FileCheck, Award, 
  Download, CheckCircle, AlertCircle, Clock,
  Building, Star, Target, Briefcase
} from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import ErrorHandler from '@/components/ErrorHandler';

export const BusinessGrowthAssistant: React.FC = () => {
  const companyId = useCompanyId();
  const [activeTab, setActiveTab] = useState('certifications');
  const [generatingDocument, setGeneratingDocument] = useState<string | null>(null);

  const certificationSchemes = [
    {
      name: 'CHAS (Contractors Health and Safety Assessment Scheme)',
      description: 'Pre-qualification health and safety assessment',
      requirements: [
        'Valid Employers Liability Insurance',
        'Health & Safety Policy',
        'Risk Assessment procedures',
        'Method Statements',
        'Training records',
        'Accident/incident records'
      ],
      benefits: [
        'Access to major contractors',
        'Reduced tender questionnaires',
        'Improved safety reputation',
        'Lower insurance premiums'
      ],
      status: 'Not Started',
      estimatedTime: '2-4 weeks'
    },
    {
      name: 'SafeContractor',
      description: 'Health and safety pre-qualification scheme',
      requirements: [
        'Health & Safety Policy',
        'Risk assessments',
        'Training certificates',
        'Insurance documentation',
        'Emergency procedures',
        'Equipment maintenance records'
      ],
      benefits: [
        'Demonstrates safety commitment',
        'Access to client databases',
        'Competitive advantage',
        'Professional recognition'
      ],
      status: 'In Progress',
      estimatedTime: '1-3 weeks'
    },
    {
      name: 'Constructionline',
      description: 'Supplier pre-qualification service',
      requirements: [
        'Financial information',
        'Insurance certificates',
        'Health & Safety documentation',
        'Quality assurance',
        'Environmental policies',
        'References'
      ],
      benefits: [
        'Access to public sector contracts',
        'Supplier database listing',
        'Tender opportunities',
        'Credibility boost'
      ],
      status: 'Not Started',
      estimatedTime: '1-2 weeks'
    }
  ];

  const documentTemplates = [
    {
      name: 'Health & Safety Policy',
      description: 'Comprehensive company health and safety policy document',
      category: 'Safety',
      required: ['Company details', 'Management structure', 'Safety objectives']
    },
    {
      name: 'Risk Assessment Template',
      description: 'Standard risk assessment form for construction activities',
      category: 'Safety',
      required: ['Activity details', 'Hazard identification', 'Control measures']
    },
    {
      name: 'Method Statement Template',
      description: 'Step-by-step work procedure document',
      category: 'Operations',
      required: ['Work description', 'Sequence of work', 'Safety measures']
    },
    {
      name: 'Insurance Declaration',
      description: 'Insurance coverage declaration for certification',
      category: 'Legal',
      required: ['Policy numbers', 'Coverage amounts', 'Renewal dates']
    }
  ];

  const handleGenerateDocument = async (templateName: string) => {
    setGeneratingDocument(templateName);
    // Simulate document generation
    setTimeout(() => {
      setGeneratingDocument(null);
      // In real implementation, this would call an AI service to generate the document
    }, 3000);
  };

  if (!companyId) {
    return (
      <ErrorHandler 
        error={new Error('Company ID not found')} 
        context="Business Growth Assistant"
        showApiKeyPrompt={false}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Growth Assistant</h1>
          <p className="text-muted-foreground">
            Get certified and grow your business with expert guidance
          </p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Set Growth Goals
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Certifications</p>
                <p className="text-2xl font-bold">1/3</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Documents Ready</p>
                <p className="text-2xl font-bold">8/12</p>
                <p className="text-xs text-muted-foreground">67% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Growth Score</p>
                <p className="text-2xl font-bold">72/100</p>
                <p className="text-xs text-muted-foreground">Good progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="documents">Document Generator</TabsTrigger>
          <TabsTrigger value="guidance">AI Guidance</TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="space-y-4">
          <div className="space-y-4">
            {certificationSchemes.map((scheme, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scheme.name}</CardTitle>
                    <Badge 
                      variant={
                        scheme.status === 'Not Started' ? 'outline' :
                        scheme.status === 'In Progress' ? 'secondary' : 'default'
                      }
                    >
                      {scheme.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{scheme.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Requirements
                      </h4>
                      <ul className="space-y-2">
                        {scheme.requirements.map((req, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="w-2 h-2 bg-gray-300 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-600" />
                        Benefits
                      </h4>
                      <ul className="space-y-2">
                        {scheme.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Estimated time: {scheme.estimatedTime}
                    </div>
                    <Button 
                      variant={scheme.status === 'Not Started' ? 'default' : 'outline'}
                    >
                      {scheme.status === 'Not Started' ? 'Start Application' : 'Continue'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <p className="text-muted-foreground">
                Generate professional documents required for certifications
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentTemplates.map((template, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-muted-foreground">Required Information:</p>
                        {template.required.map((req, i) => (
                          <div key={i} className="text-xs flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            {req}
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled={generatingDocument === template.name}
                        onClick={() => handleGenerateDocument(template.name)}
                      >
                        {generatingDocument === template.name ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Generate Document
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Business Growth Advisor</CardTitle>
              <p className="text-muted-foreground">
                Get personalized advice for growing your construction business
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Ask me about certifications, business growth strategies, compliance requirements, or any other business questions..."
                  className="min-h-[100px]"
                />
                <Button className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Get AI Advice
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                  Recommended Next Steps
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Complete your Health & Safety Policy document
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Update insurance documentation for CHAS application
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Gather employee training records for SafeContractor
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
