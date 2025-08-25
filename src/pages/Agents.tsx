import React, { useState } from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";



const Agents: React.FC = () => {
  const { toast } = useToast();

  // FundingBot
  const [fundKeywords, setFundKeywords] = useState("");
  const [fundLocation, setFundLocation] = useState("UK");
  const [fundResults, setFundResults] = useState<any[]>([]);
  const [loadingFunding, setLoadingFunding] = useState(false);

  // RiskBot
  const [riskInput, setRiskInput] = useState("");
  const [riskResults, setRiskResults] = useState<any[]>([]);
  const [loadingRisk, setLoadingRisk] = useState(false);

  // Bid Package
  const [tenderUrl, setTenderUrl] = useState("");
  const [companyNotes, setCompanyNotes] = useState("");
  const [bidResult, setBidResult] = useState<any | null>(null);
  const [loadingBid, setLoadingBid] = useState(false);

  const findFunding = async () => {
    if (!fundKeywords.trim()) return;
    setLoadingFunding(true);
    setFundResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("funding-bot", {
        body: { keywords: fundKeywords, location: fundLocation }
      });
      if (error) throw new Error(error.message);
      setFundResults(data?.grants || []);
      toast({ title: "Funding suggestions ready", description: `${(data?.grants || []).length} results` });
    } catch (e: any) {
      toast({ title: "Failed to fetch funding", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoadingFunding(false);
    }
  };

  const analyzeRisk = async () => {
    if (!riskInput.trim()) return;
    setLoadingRisk(true);
    setRiskResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("risk-bot", {
        body: { content: riskInput }
      });
      if (error) throw new Error(error.message);
      setRiskResults(data?.risks || []);
      toast({ title: "Risk analysis complete", description: `${(data?.risks || []).length} issues found` });
    } catch (e: any) {
      toast({ title: "Risk analysis failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoadingRisk(false);
    }
  };

  const generateBid = async () => {
    if (!tenderUrl.trim() && !companyNotes.trim()) return;
    setLoadingBid(true);
    setBidResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("bid-package", {
        body: { url: tenderUrl || undefined, details: companyNotes || undefined }
      });
      if (error) throw new Error(error.message);
      setBidResult(data || null);
      toast({ title: "Bid package generated" });
    } catch (e: any) {
      toast({ title: "Bid generation failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoadingBid(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Agents Hub",
    description: "Discover grants, assess risks, and generate bid packages with AI.",
  };

  return (
    <>
      
      <ResponsiveLayout>
        <SEO title="AI Agents Hub | AS Agents" description="Discover grants, assess risks, and generate bid packages with AI." jsonLd={jsonLd} />
        <h1 className="sr-only">AI Agents Hub</h1>

      <div className="cyber-grid">
        <div className="cyber-card p-6 hover-glow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gradient mb-2">FundingBot</h2>
            <p className="text-muted-foreground text-sm">Discover grants and funding opportunities</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input 
                placeholder="Keywords (e.g. retrofit, SME)" 
                value={fundKeywords} 
                onChange={(e) => setFundKeywords(e.target.value)}
                className="bg-cyber-gray border-border/30"
              />
              <Input 
                placeholder="Location" 
                value={fundLocation} 
                onChange={(e) => setFundLocation(e.target.value)}
                className="bg-cyber-gray border-border/30"
              />
              <Button onClick={findFunding} disabled={loadingFunding} className="btn-neon">
                {loadingFunding ? "Searching..." : "Find Grants"}
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {fundResults.map((g, idx) => (
                <div key={idx} className="glass-card p-4 hover-lift">
                  <h3 className="font-semibold mb-1">{g.title}</h3>
                  {g.amount && <p className="text-neon-green text-sm">Up to {g.amount}</p>}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {g.deadline && <span className="status-warning">Deadline: {g.deadline}</span>}
                    {g.relevance && <span className="status-online">Relevance: {g.relevance}/100</span>}
                  </div>
                  {g.url && (
                    <a 
                      className="text-neon-blue hover:text-neon-green transition-colors mt-2 inline-block text-sm" 
                      href={g.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View details ↗
                    </a>
                  )}
                </div>
              ))}
              {fundResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No results yet. Try a search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cyber-card p-6 hover-glow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gradient mb-2">RiskBot</h2>
            <p className="text-muted-foreground text-sm">Analyze text for compliance and financial risks</p>
          </div>
          <div className="space-y-4">
            <Textarea 
              rows={6} 
              placeholder="Paste a quote, invoice, or project notes to analyze risks" 
              value={riskInput} 
              onChange={(e) => setRiskInput(e.target.value)}
              className="bg-cyber-gray border-border/30"
            />
            <div className="flex justify-end">
              <Button onClick={analyzeRisk} disabled={loadingRisk} className="btn-neon">
                {loadingRisk ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {riskResults.map((r, idx) => (
                <div key={idx} className="glass-card p-4">
                  <div className="font-medium mb-1">{r.title || r.issue}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="status-warning">Severity: {r.severity || r.score}</span>
                  </div>
                  {r.recommendation && (
                    <div className="text-sm text-muted-foreground">
                      Action: {r.recommendation}
                    </div>
                  )}
                </div>
              ))}
              {riskResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No analysis yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cyber-card p-6 hover-glow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gradient mb-2">Bid Package Generator</h2>
            <p className="text-muted-foreground text-sm">Assemble cover letter, checklist, and summaries</p>
          </div>
          <div className="space-y-4">
            <Input 
              placeholder="Tender URL (optional)" 
              value={tenderUrl} 
              onChange={(e) => setTenderUrl(e.target.value)}
              className="bg-cyber-gray border-border/30"
            />
            <Textarea 
              rows={4} 
              placeholder="Company strengths or requirements (optional)" 
              value={companyNotes} 
              onChange={(e) => setCompanyNotes(e.target.value)}
              className="bg-cyber-gray border-border/30"
            />
            <div className="flex justify-end">
              <Button onClick={generateBid} disabled={loadingBid} className="btn-neon">
                {loadingBid ? "Generating..." : "Generate"}
              </Button>
            </div>

            {bidResult && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bidResult.cover_letter && (
                  <div className="glass-card p-4">
                    <h3 className="font-semibold mb-3 text-gradient">Cover Letter</h3>
                    <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {bidResult.cover_letter}
                    </div>
                  </div>
                )}
                {bidResult.compliance_checklist && (
                  <div className="glass-card p-4">
                    <h3 className="font-semibold mb-3 text-gradient">Compliance Checklist</h3>
                    <ul className="space-y-1 text-sm">
                      {bidResult.compliance_checklist.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-neon-green">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {bidResult.summary && (
                  <div className="glass-card p-4">
                    <h3 className="font-semibold mb-3 text-gradient">Summary</h3>
                    <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {bidResult.summary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cyber-card p-6 hover-glow">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gradient mb-2">Procurement Manager</h2>
            <p className="text-muted-foreground text-sm">Track materials, requests, and supplier notes</p>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Advanced procurement features coming soon...</p>
            <div className="mt-4 inline-block status-warning">
              Development Phase
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
    </>
  );
};

export default Agents;
