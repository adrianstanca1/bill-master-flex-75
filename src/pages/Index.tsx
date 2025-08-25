
import React, { useEffect, useState } from "react";
import AgentChat from "@/components/AgentChat";
import SmartOpsPanel from "@/components/SmartOpsPanel";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { GuestBanner } from "@/components/GuestBanner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [stats, setStats] = useState({ projects: 0, clients: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const [projectRes, clientRes] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true })
      ]);
      setStats({
        projects: projectRes.count ?? 0,
        clients: clientRes.count ?? 0,
      });
    };
    loadStats();
  }, []);

  return (
    <>
      <SEO
        title="AS Agents Business Dashboard"
        description="AI-powered dashboard for invoicing, tenders, quotes, and VAT/CIS."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AS Agents Business Dashboard",
          potentialAction: {
            "@type": "SearchAction",
            target: (typeof window !== "undefined" ? window.location.origin : "") + "/dashboard#invoices?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
            AS Agents
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-2">
            Professional construction management platform for modern businesses
          </p>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto mb-8">
            Managing {stats.projects} projects and {stats.clients} clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <button className="btn-primary">
                Enter Dashboard
              </button>
            </Link>
            <Link to="/agents">
              <button className="btn-secondary">
                AI Agents
              </button>
            </Link>
            <Link to="/register">
              <button className="btn-secondary">
                Register
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-12 px-4 space-y-12">
        <GuestBanner />
        
        {/* Features Grid */}
        <section className="content-grid">
          <div className="feature-card hover-lift">
            <div className="feature-icon">
              <span className="text-2xl">🏗️</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Project Management</h3>
            <p className="text-muted-foreground">
              Advanced project tracking with real-time updates and team collaboration tools
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="feature-icon bg-gradient-secondary">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Financial Control</h3>
            <p className="text-muted-foreground">
              Professional invoicing, quotes, variations, and comprehensive financial tracking
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="feature-icon">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Intelligence</h3>
            <p className="text-muted-foreground">
              Smart business intelligence, automated advisors, and AI agents
            </p>
          </div>
        </section>

        {/* Main Sections */}
        <div className="content-grid lg:grid-cols-2">
          <div className="elevated-card p-8">
            <h2 className="text-2xl font-semibold mb-4">AI Business Coach</h2>
            <p className="text-muted-foreground mb-6">
              Get instant advice on pricing, cash flow, compliance, and business growth. Our AI understands UK construction industry specifics.
            </p>
            <div className="pro-card p-4">
              <AgentChat />
            </div>
          </div>

          <div className="elevated-card p-8">
            <h2 className="text-2xl font-semibold mb-4">SmartOps Control Center</h2>
            <p className="text-muted-foreground mb-6">
              Automated business scanning, tender discovery, quote generation, and regulatory compliance management.
            </p>
            <div className="pro-card p-4">
              <SmartOpsPanel />
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <section className="elevated-card p-8">
          <h2 className="text-2xl font-semibold mb-6">Quick Access</h2>
          <div className="content-grid sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/invoices" className="pro-card p-6 hover-lift text-center interactive-link">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold mb-1">Invoices</div>
              <div className="text-xs text-muted-foreground">Create & manage</div>
            </Link>
            <Link to="/projects" className="pro-card p-6 hover-lift text-center interactive-link">
              <div className="text-2xl mb-2">🏗️</div>
              <div className="font-semibold mb-1">Projects</div>
              <div className="text-xs text-muted-foreground">Track progress</div>
            </Link>
            <Link to="/crm" className="pro-card p-6 hover-lift text-center interactive-link">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold mb-1">Clients</div>
              <div className="text-xs text-muted-foreground">Manage relationships</div>
            </Link>
            <Link to="/hr" className="pro-card p-6 hover-lift text-center interactive-link">
              <div className="text-2xl mb-2">👨‍💼</div>
              <div className="font-semibold mb-1">Team</div>
              <div className="text-xs text-muted-foreground">HR management</div>
            </Link>
          </div>
        </section>

        <footer className="text-center text-sm">
          <Link to="/policy" className="text-muted-foreground hover:underline">
            Privacy Policy
          </Link>
        </footer>
      </div>
    </>
  );
};

export default Index;
