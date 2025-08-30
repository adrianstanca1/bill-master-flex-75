import { EnhancedAnalyticsDashboard } from '@/components/EnhancedAnalyticsDashboard';
import SEO from '@/components/SEO';

export default function Analytics() {
  return (
    <>
      <SEO 
        title="Business Analytics - ASagents"
        description="Comprehensive business analytics and performance insights for construction companies"
        keywords="business analytics, construction metrics, performance dashboard, revenue analysis"
      />
      <div className="container mx-auto p-6">
        <EnhancedAnalyticsDashboard />
      </div>
    </>
  );
}