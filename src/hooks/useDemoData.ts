import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanyId } from '@/hooks/useCompanyId';

interface DemoDataOptions {
  projects?: boolean;
  invoices?: boolean;
  quotes?: boolean;
  employees?: boolean;
  reminders?: boolean;
  timesheets?: boolean;
}

export function useDemoData() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const companyId = useCompanyId();

  const generateDemoData = useCallback(async (options: DemoDataOptions = {}) => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID not found. Please set up your company first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const promises = [];

      // Demo Projects
      if (options.projects !== false) {
        const demoProjects = [
          {
            company_id: companyId,
            name: "Modern Office Complex - Phase 1",
            location: "London, UK",
            client: "Sterling Properties Ltd",
            start_date: "2024-01-15",
            end_date: "2024-06-30",
            meta: {
              budget: 750000,
              status: "in_progress",
              progress: 65,
              description: "Construction of 5-story modern office building"
            }
          },
          {
            company_id: companyId,
            name: "Riverside Residential Development",
            location: "Manchester, UK",
            client: "Horizon Homes",
            start_date: "2024-02-01",
            end_date: "2024-12-15",
            meta: {
              budget: 1200000,
              status: "planning",
              progress: 25,
              description: "12-unit luxury riverside apartments"
            }
          },
          {
            company_id: companyId,
            name: "Industrial Warehouse Renovation",
            location: "Birmingham, UK",
            client: "Logistics Plus",
            start_date: "2024-03-10",
            end_date: "2024-08-20",
            meta: {
              budget: 450000,
              status: "in_progress",
              progress: 80,
              description: "Complete renovation and modernization"
            }
          }
        ];

        promises.push(
          supabase.from('projects').insert(demoProjects)
        );
      }

      // Demo Invoices
      if (options.invoices !== false) {
        const demoInvoices = [
          {
            company_id: companyId,
            number: "INV-2024-001",
            client: "Sterling Properties Ltd",
            total: 45250.00,
            status: "paid",
            due_date: "2024-01-30",
            items: [
              { description: "Foundation work - Phase 1", quantity: 1, rate: 25000, total: 25000 },
              { description: "Material supply - Concrete", quantity: 100, rate: 202.5, total: 20250 }
            ]
          },
          {
            company_id: companyId,
            number: "INV-2024-002",
            client: "Horizon Homes",
            total: 67890.00,
            status: "sent",
            due_date: "2024-03-15",
            items: [
              { description: "Site preparation and planning", quantity: 1, rate: 35000, total: 35000 },
              { description: "Architectural services", quantity: 1, rate: 32890, total: 32890 }
            ]
          },
          {
            company_id: companyId,
            number: "INV-2024-003",
            client: "Logistics Plus",
            total: 28750.00,
            status: "overdue",
            due_date: "2024-02-20",
            items: [
              { description: "Demolition services", quantity: 1, rate: 15000, total: 15000 },
              { description: "Waste removal and disposal", quantity: 1, rate: 13750, total: 13750 }
            ]
          }
        ];

        promises.push(
          supabase.from('invoices').insert(demoInvoices)
        );
      }

      // Demo Quotes
      if (options.quotes !== false) {
        const demoQuotes = [
          {
            company_id: companyId,
            title: "Commercial Kitchen Fit-out - Green Valley",
            client_name: "Green Valley Developments",
            client_email: "contact@greenvalley.com",
            total: 125000.00,
            status: "pending",
            valid_until: "2024-04-30",
            items: [
              { description: "Commercial kitchen fit-out", quantity: 1, rate: 85000, total: 85000 },
              { description: "Ventilation system installation", quantity: 1, rate: 40000, total: 40000 }
            ]
          },
          {
            company_id: companyId,
            title: "Park Pavilion Construction Project",
            client_name: "City Council",
            client_email: "projects@citycouncil.gov.uk",
            total: 89500.00,
            status: "draft",
            valid_until: "2024-05-15",
            items: [
              { description: "Park pavilion construction", quantity: 1, rate: 65000, total: 65000 },
              { description: "Landscaping and pathways", quantity: 1, rate: 24500, total: 24500 }
            ]
          }
        ];

        promises.push(
          supabase.from('quotes').insert(demoQuotes)
        );
      }

      // Demo Reminders
      if (options.reminders !== false) {
        const demoReminders = [
          {
            company_id: companyId,
            title: "Building Permit Renewal",
            description: "Renew construction permits for Riverside project",
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "high",
            category: "deadline",
            status: "pending",
            recurring: false
          },
          {
            company_id: companyId,
            title: "Safety Inspection",
            description: "Monthly safety inspection for all active sites",
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "urgent",
            category: "safety",
            status: "pending",
            recurring: true,
            recurring_pattern: "monthly"
          },
          {
            company_id: companyId,
            title: "Equipment Maintenance",
            description: "Scheduled maintenance for excavator #EX-001",
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "medium",
            category: "maintenance",
            status: "pending",
            recurring: false
          }
        ];

        promises.push(
          supabase.from('reminders').insert(demoReminders)
        );
      }

      // Execute all insertions
      await Promise.all(promises);

      toast({
        title: "Success!",
        description: "Demo data has been generated successfully.",
      });

    } catch (error) {
      console.error('Error generating demo data:', error);
      toast({
        title: "Error",
        description: "Failed to generate demo data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, toast]);

  const clearDemoData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const promises = [
        supabase.from('projects').delete().eq('company_id', companyId),
        supabase.from('invoices').delete().eq('company_id', companyId),
        supabase.from('quotes').delete().eq('company_id', companyId),
        supabase.from('reminders').delete().eq('company_id', companyId),
        supabase.from('timesheets').delete().eq('company_id', companyId)
      ];

      await Promise.all(promises);

      toast({
        title: "Success!",
        description: "Demo data has been cleared successfully.",
      });

    } catch (error) {
      console.error('Error clearing demo data:', error);
      toast({
        title: "Error",
        description: "Failed to clear demo data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, toast]);

  return {
    generateDemoData,
    clearDemoData,
    loading
  };
}