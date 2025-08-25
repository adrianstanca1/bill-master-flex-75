import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { FileText, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Service" 
        description="Terms of service for AS Cladding & Roofing professional construction management platform." 
      />
      
      <ResponsiveLayout maxWidth="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/policy" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Policies
              </Link>
            </Button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground">
              Terms and conditions governing the use of AS Cladding & Roofing services
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground mb-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="space-y-4">
                <h3 className="font-semibold">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using AS Cladding & Roofing's construction management platform, 
                  you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3 className="font-semibold">2. Description of Service</h3>
                <p>
                  Our platform provides construction management tools including project tracking, 
                  invoicing, quote generation, and business analytics for construction professionals.
                </p>

                <h3 className="font-semibold">3. User Accounts</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must notify us immediately of any unauthorized access</li>
                  <li>One person or legal entity may not maintain more than one account</li>
                </ul>

                <h3 className="font-semibold">4. Acceptable Use</h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to the service</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Upload malicious code or spam</li>
                </ul>

                <h3 className="font-semibold">5. Payment Terms</h3>
                <p>
                  If you choose a paid plan, you agree to pay all fees associated with your account. 
                  Fees are non-refundable except as required by law.
                </p>

                <h3 className="font-semibold">6. Intellectual Property</h3>
                <p>
                  The service and its original content, features, and functionality are and will remain 
                  the exclusive property of AS Cladding & Roofing and its licensors. The service is 
                  protected by copyright, trademark, and other laws.
                </p>

                <h3 className="font-semibold">7. User Content</h3>
                <p>
                  You retain ownership of any content you submit to the service. By submitting content, 
                  you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
                  and distribute your content in connection with the service.
                </p>

                <h3 className="font-semibold">8. Privacy</h3>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the service, to understand our practices.
                </p>

                <h3 className="font-semibold">9. Disclaimers</h3>
                <p>
                  The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no 
                  warranties, expressed or implied, and hereby disclaim all other warranties 
                  including implied warranties of merchantability, fitness for a particular purpose, 
                  and non-infringement.
                </p>

                <h3 className="font-semibold">10. Limitation of Liability</h3>
                <p>
                  AS Cladding & Roofing shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages resulting from your use of the service, including 
                  but not limited to loss of profits, data, or business opportunities.
                </p>

                <h3 className="font-semibold">11. Indemnification</h3>
                <p>
                  You agree to defend, indemnify, and hold harmless AS Cladding & Roofing and its 
                  officers, directors, employees, and agents from and against any claims, liabilities, 
                  damages, judgments, awards, losses, costs, expenses, or fees arising out of or 
                  relating to your violation of these terms.
                </p>

                <h3 className="font-semibold">12. Governing Law</h3>
                <p>
                  These terms shall be interpreted and governed in accordance with the laws of 
                  England and Wales, without regard to its conflict of law provisions.
                </p>

                <h3 className="font-semibold">13. Termination</h3>
                <p>
                  We may terminate or suspend your account at any time for violation of these terms. 
                  You may terminate your account at any time by contacting us. Upon termination, 
                  your right to use the service will cease immediately.
                </p>

                <h3 className="font-semibold">14. Changes to Terms</h3>
                <p>
                  We reserve the right to modify or replace these terms at any time. If a revision 
                  is material, we will try to provide at least 30 days notice prior to any new terms 
                  taking effect.
                </p>

                <h3 className="font-semibold">15. Contact Information</h3>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p><strong>AS Cladding & Roofing Ltd</strong></p>
                  <p>Email: legal@ascladdingroofing.com</p>
                  <p>Phone: [Contact Number]</p>
                  <p>Address: [Business Address]</p>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    By using our service, you acknowledge that you have read and understood these 
                    Terms of Service and agree to be bound by them.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    </>
  );
}