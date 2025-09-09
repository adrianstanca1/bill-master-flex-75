import { EmailVerificationFlow } from '@/components/auth/EmailVerificationFlow';
import SEO from '@/components/SEO';

export default function EmailVerification() {
  return (
    <>
      <SEO 
        title="Verify Your Email" 
        description="Verify your email address to complete your account setup"
        noindex 
      />
      <div className="container max-w-md mx-auto py-10">
        <EmailVerificationFlow />
      </div>
    </>
  );
}