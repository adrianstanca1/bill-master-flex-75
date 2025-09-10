
import React from 'react';
import { EnhancedSecurityDashboard } from '@/components/EnhancedSecurityDashboard';
import SEO from '@/components/SEO';

export default function Security() {
  return (
    <>
      <SEO 
        title="Security Control Center" 
        description="Comprehensive security monitoring, configuration management, and threat protection" 
        noindex 
      />
      
      <EnhancedSecurityDashboard />
    </>
  );
}
