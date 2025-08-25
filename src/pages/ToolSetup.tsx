
import React from "react";
import FunctionDiagnostics from "@/components/FunctionDiagnostics";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";


export default function ToolSetup() {
  return (
    <ResponsiveLayout>
      
      <SEO title="Tool Setup | AI functions & keys" description="Configure API keys and verify edge functions." noindex />
      <header className="pt-6">
        <h1 className="text-2xl font-bold">Important information for tool setup</h1>
        <p className="text-muted-foreground">Configure required API keys and settings for each function.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>AI Functions requiring OpenAI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">agent, advisor, quote-bot, tax-bot, rams</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Requires a valid OPENAI_API_KEY stored as a Supabase Secret.</li>
            <li>Sign in before invoking these functions.</li>
            <li>
              Get a key: <a className="text-primary hover:underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">OpenAI API Keys</a>
            </li>
            <li>
              Check logs: <a className="text-primary hover:underline" href={`https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/functions/agent/logs`} target="_blank" rel="noreferrer">Agent Logs</a>
              {" • "}
              <a className="text-primary hover:underline" href={`https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/functions/advisor/logs`} target="_blank" rel="noreferrer">Advisor Logs</a>
              {" • "}
              <a className="text-primary hover:underline" href={`https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/functions/rams/logs`} target="_blank" rel="noreferrer">RAMS Logs</a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TenderBot (Firecrawl)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Requires FIRECRAWL_API_KEY stored as a Supabase Secret.</li>
            <li>Ensure the URL is https and within allowed scope.</li>
            <li>
              Learn more: <a className="text-primary hover:underline" href="https://www.firecrawl.dev/" target="_blank" rel="noreferrer">Firecrawl</a>
            </li>
            <li>
              Check logs: <a className="text-primary hover:underline" href={`https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/functions/tenderbot/logs`} target="_blank" rel="noreferrer">TenderBot Logs</a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tender Search</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>No API keys required. Returns curated search links to tender portals.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SmartOps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Enter your Company ID in <Link className="text-primary hover:underline" to="/settings">Settings</Link>.</li>
            <li>Requires you to be signed in. Data access is protected via RLS.</li>
            <li>
              Check logs: <a className="text-primary hover:underline" href={`https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/functions/smartops/logs`} target="_blank" rel="noreferrer">SmartOps Logs</a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Run all health checks. Failed items will include suggested fixes.</p>
          <FunctionDiagnostics />
        </CardContent>
      </Card>
    </ResponsiveLayout>
  );
}
