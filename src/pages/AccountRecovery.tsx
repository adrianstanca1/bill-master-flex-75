import { AccountRecovery as AccountRecoveryComponent } from '@/components/auth/AccountRecovery';
import SEO from '@/components/SEO';

export default function AccountRecovery() {
  return (
    <>
      <SEO 
        title="Account Recovery" 
        description="Recover access to your account through multiple recovery methods"
        noindex 
      />
      <div className="container max-w-md mx-auto py-10">
        <AccountRecoveryComponent />
      </div>
    </>
  );
}