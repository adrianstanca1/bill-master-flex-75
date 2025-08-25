import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Shield, Database, Cookie, ExternalLink } from 'lucide-react';

export default function Policy() {
  return (
    <>
      <SEO 
        title="Privacy Policy & Terms of Service" 
        description="Privacy policy, terms of service, and data protection information for AS Cladding & Roofing professional construction management platform." 
      />
      
      <ResponsiveLayout maxWidth="lg">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy & Terms</h1>
            <p className="text-muted-foreground mt-2">
              Learn about how we protect your data and the terms governing our services
            </p>
          </div>

          <div className="mb-6">
            <Button asChild>
              <Link to="/terms" className="flex items-center gap-2">
                View Terms of Service
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy Policy
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Protection
              </TabsTrigger>
              <TabsTrigger value="cookies" className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                Cookie Policy
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-sm text-muted-foreground mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>

                  <section className="space-y-4">
                    <h3 className="font-semibold">1. Information We Collect</h3>
                    <p>
                      We collect information you provide directly to us, such as when you create an account, 
                      use our services, or contact us for support. This may include:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Name, email address, and contact information</li>
                      <li>Company information and business details</li>
                      <li>Project data, invoices, and financial information</li>
                      <li>Usage data and analytics</li>
                    </ul>

                    <h3 className="font-semibold">2. How We Use Your Information</h3>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process transactions and send related information</li>
                      <li>Send technical notices and support messages</li>
                      <li>Respond to your comments and questions</li>
                      <li>Comply with legal obligations</li>
                    </ul>

                    <h3 className="font-semibold">3. Information Sharing and Disclosure</h3>
                    <p>
                      We do not sell, trade, or otherwise transfer your personal information to third parties 
                      without your consent, except as described in this policy or as required by law.
                    </p>

                    <h3 className="font-semibold">4. Data Security</h3>
                    <p>
                      We implement appropriate technical and organizational measures to protect your personal 
                      information against unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <h3 className="font-semibold">5. Your Rights</h3>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Access and update your personal information</li>
                      <li>Request deletion of your data</li>
                      <li>Opt-out of marketing communications</li>
                      <li>Export your data</li>
                    </ul>

                    <h3 className="font-semibold">6. Contact Us</h3>
                    <p>
                      If you have any questions about this Privacy Policy, please contact us at 
                      privacy@ascladdingroofing.com
                    </p>
                  </section>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Protection</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <section className="space-y-4">
                    <h3 className="font-semibold">GDPR Compliance</h3>
                    <p>
                      We are committed to protecting your personal data in accordance with the 
                      General Data Protection Regulation (GDPR) and other applicable data protection laws.
                    </p>

                    <h3 className="font-semibold">Data Processing Legal Basis</h3>
                    <p>We process your personal data based on:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Contractual necessity for service provision</li>
                      <li>Legitimate interests for business operations</li>
                      <li>Legal compliance requirements</li>
                      <li>Your explicit consent where required</li>
                    </ul>

                    <h3 className="font-semibold">Data Retention</h3>
                    <p>
                      We retain your personal data only as long as necessary for the purposes outlined 
                      in our privacy policy or as required by law. Account data is typically retained 
                      for 7 years after account closure for legal and compliance purposes.
                    </p>

                    <h3 className="font-semibold">International Data Transfers</h3>
                    <p>
                      Your data may be transferred to and processed in countries other than your own. 
                      We ensure appropriate safeguards are in place for such transfers.
                    </p>

                    <h3 className="font-semibold">Data Subject Rights</h3>
                    <p>Under GDPR, you have the right to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Access your personal data</li>
                      <li>Rectify inaccurate data</li>
                      <li>Erase your data (right to be forgotten)</li>
                      <li>Restrict processing</li>
                      <li>Data portability</li>
                      <li>Object to processing</li>
                      <li>Withdraw consent</li>
                    </ul>

                    <h3 className="font-semibold">Contact Our Data Protection Officer</h3>
                    <p>
                      For data protection inquiries, contact our DPO at dpo@ascladdingroofing.com
                    </p>
                  </section>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cookies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cookie Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <section className="space-y-4">
                    <h3 className="font-semibold">What Are Cookies?</h3>
                    <p>
                      Cookies are small text files that are placed on your device when you visit our website. 
                      They help us provide you with a better experience by remembering your preferences.
                    </p>

                    <h3 className="font-semibold">Types of Cookies We Use</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">Essential Cookies</h4>
                        <p>Required for the website to function properly, including authentication and security.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Functional Cookies</h4>
                        <p>Remember your preferences and settings to enhance your experience.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Analytics Cookies</h4>
                        <p>Help us understand how visitors interact with our website to improve our services.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Marketing Cookies</h4>
                        <p>Used to deliver relevant advertisements and track campaign effectiveness.</p>
                      </div>
                    </div>

                    <h3 className="font-semibold">Managing Cookies</h3>
                    <p>
                      You can control and manage cookies through your browser settings. However, 
                      disabling certain cookies may affect the functionality of our services.
                    </p>

                    <h3 className="font-semibold">Third-Party Cookies</h3>
                    <p>
                      We may use third-party services that place cookies on your device. These services 
                      have their own privacy policies governing their use of cookies.
                    </p>

                    <h3 className="font-semibold">Cookie Consent</h3>
                    <p>
                      By continuing to use our website, you consent to our use of cookies as described 
                      in this policy. You can withdraw your consent at any time through your browser settings.
                    </p>
                  </section>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveLayout>
    </>
  );
}