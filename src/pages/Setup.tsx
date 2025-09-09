import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCompanySetup } from "@/hooks/useCompanySetup";
import { useAuthContext } from "@/components/auth/AuthProvider";
import SEO from "@/components/SEO";
import { Building2, Loader2, CheckCircle } from "lucide-react";

interface FormData {
  companyName: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
}

export default function Setup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setupCompany, getCompanyData, isLoading } = useCompanySetup();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Setup: Auth state changed', { isAuthenticated, authLoading, user: user?.email });
    
    if (!authLoading && !isAuthenticated) {
      console.log('Setup: Not authenticated, redirecting to auth');
      navigate('/auth', { replace: true });
      return;
    }

    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  // Check if user already has setup completed
  useEffect(() => {
    const checkExistingSetup = async () => {
      if (!user) return;
      
      try {
        const companyData = await getCompanyData();
        if (companyData?.companyName) {
          console.log('Setup: Company already exists, redirecting to dashboard');
          toast({
            title: "Setup already complete",
            description: "Redirecting to your dashboard...",
          });
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Setup: Error checking existing setup:', error);
        // Continue with setup if there's an error
      }
    };

    if (user && !authLoading) {
      checkExistingSetup();
    }
  }, [user, authLoading, getCompanyData, navigate, toast]);

  const industries = [
    'Construction',
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Education',
    'Real Estate',
    'Transportation',
    'Consulting',
    'Other'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your company name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.industry) {
      toast({
        title: "Industry required",
        description: "Please select your industry.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Setup: Submitting form data:', formData);
    
    try {
      const companyId = await setupCompany(formData);
      console.log('Setup: Company setup successful, company ID:', companyId);
      
      toast({
        title: "Setup Complete! 🎉",
        description: "Welcome to your workspace!",
      });
      
      // Navigate to dashboard after successful setup
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error('Setup: Error during company setup:', error);
      toast({
        title: "Setup failed",
        description: "There was an error setting up your company. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="container max-w-2xl mx-auto py-10">
      <SEO 
        title="Complete Setup"
        description="Set up your company profile to get started"
        noindex
      />

      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gradient">Welcome to ConstructTime Pro!</h1>
        <p className="text-muted-foreground text-lg">
          Let's set up your company profile to get you started.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Setup
          </CardTitle>
          <CardDescription>
            Tell us about your company to personalize your experience
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry *
                </Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-12"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  This is your account email and cannot be changed here.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your company address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full h-12 bg-gradient-primary"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up your company...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center mt-6 text-sm text-muted-foreground">
        You can update these details anytime from your settings page.
      </div>
    </main>
  );
}