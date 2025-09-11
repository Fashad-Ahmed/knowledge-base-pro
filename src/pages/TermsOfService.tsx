import { SEOHead, seoConfigs } from '@/components/ui/seo-head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Terms of Service - Personal Knowledge Base"
        description="Terms of service for our privacy-first, self-hosted personal knowledge management system."
        keywords={['terms of service', 'legal', 'self-hosted', 'privacy']}
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container max-w-4xl mx-auto py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <CardDescription className="text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using this Personal Knowledge Base application ("Service"), 
                  you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                <p>
                  This Service provides a self-hosted, privacy-first personal knowledge management 
                  system that allows you to create, organize, and manage your notes and information 
                  locally or on your own infrastructure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Self-Hosted Nature</h2>
                <p>
                  This application is designed to be self-hosted. When you run this software:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are responsible for your own data and infrastructure</li>
                  <li>We do not have access to your data or usage patterns</li>
                  <li>You maintain full control over your information</li>
                  <li>You are responsible for backups and data security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Privacy and Data</h2>
                <p>
                  Given the self-hosted nature of this service:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your data remains entirely under your control</li>
                  <li>No analytics or tracking data is sent to external servers by default</li>
                  <li>Any external integrations (like AI services) are opt-in only</li>
                  <li>You can review and modify the source code at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service in compliance with applicable laws</li>
                  <li>Not use the Service for illegal or harmful activities</li>
                  <li>Maintain appropriate security measures for your installation</li>
                  <li>Keep your software updated for security purposes</li>
                  <li>Backup your data regularly</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Open Source License</h2>
                <p>
                  This software is provided under an open source license. You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the software for any purpose</li>
                  <li>Study and modify the source code</li>
                  <li>Distribute copies of the software</li>
                  <li>Distribute modified versions (subject to license terms)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
                <p>
                  This software is provided "as is" without warranty of any kind, either express 
                  or implied. We do not guarantee that the Service will be uninterrupted, secure, 
                  or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
                <p>
                  In no event shall we be liable for any indirect, incidental, special, or 
                  consequential damages arising out of the use of this Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">9. Support and Updates</h2>
                <p>
                  Support for this self-hosted application is provided on a best-effort basis 
                  through community channels. Updates and security patches will be made available 
                  through the official repository.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be 
                  communicated through the software repository and documentation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">11. Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please refer to the documentation 
                  or community support channels provided with the software.
                </p>
              </section>

              <div className="bg-muted p-4 rounded-lg mt-8">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Since this is a self-hosted application, these terms 
                  primarily serve as a reference. As the operator of your own instance, you have 
                  full control over the terms that apply to your users (if any).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}