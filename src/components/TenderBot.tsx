
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ErrorHandler from "@/components/ErrorHandler";

export default function TenderBot() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"crawl" | "scrape">("crawl");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  async function handleRun() {
    if (!url.trim()) {
      toast({ 
        title: "Missing URL", 
        description: "Please enter a website URL.", 
        variant: "destructive" 
      });
      return;
    }

    // Basic https URL validation
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") {
        toast({ 
          title: "Use a secure URL", 
          description: "Only https URLs are allowed.", 
          variant: "destructive" 
        });
        return;
      }
    } catch {
      toast({ 
        title: "Invalid URL", 
        description: "Please enter a valid website URL.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("tenderbot", {
        body: { url, mode, limit: 50 },
      });
      
      if (error) {
        console.error("TenderBot error:", error);
        throw error;
      }
      
      setResult(data);
      toast({ 
        title: "TenderBot finished", 
        description: "Results loaded below." 
      });
    } catch (e: any) {
      console.error("TenderBot failed:", e);
      setError(e);
      
      toast({ 
        title: "TenderBot failed", 
        description: "Could not complete the request.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid md:grid-cols-5 gap-2">
        <input
          className="input md:col-span-3"
          type="url"
          inputMode="url"
          placeholder="https://example.com/tenders"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <select className="input" value={mode} onChange={(e) => setMode(e.target.value as any)}>
          <option value="crawl">Crawl (site-wide)</option>
          <option value="scrape">Scrape (single page)</option>
        </select>
        <button 
          className="button" 
          onClick={handleRun} 
          disabled={loading || !url.trim()} 
          aria-busy={loading} 
          aria-live="polite"
        >
          {loading ? "Running…" : "Run TenderBot"}
        </button>
      </div>

      {error && (
        <ErrorHandler 
          error={error} 
          context="TenderBot"
          onRetry={handleRun}
          showApiKeyPrompt={true}
        />
      )}

      {result && (
        <div className="bg-gray-900 rounded-md p-3 overflow-auto">
          {result.error ? (
            <div className="text-red-400">
              <div className="font-semibold mb-2">Error:</div>
              <div className="mb-2">{result.error}</div>
              {result.technical_details && (
                <div className="text-xs text-gray-400">
                  Technical details: {result.technical_details}
                </div>
              )}
            </div>
          ) : (
            <pre className="text-xs text-foreground whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
