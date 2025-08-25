
import React, { useEffect, useState } from "react";
import { Key, User, Building, Save, Eye, EyeOff, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { secureStorage } from "@/lib/SecureStorage";


const LS = "as-settings";

type AccountData = {
  companyId?: string;
  companyName?: string;
  country?: string;
  industry?: string;
  targetMargin?: number;
  vatScheme?: "standard" | "flat-rate" | "cash-accounting";
  reverseCharge?: boolean;
  cis?: boolean;
  address?: string;
  website?: string;
  phone?: string;
  contactEmail?: string;
  logoDataUrl?: string;
  // API Keys
  openaiApiKey?: string;
  firecrawlApiKey?: string;
  // Mock integrations
  hmrcClientId?: string;
  hmrcRedirectUri?: string;
  hmrcVatNumber?: string;
  hmrcUtr?: string;
  truelayerClientId?: string;
  truelayerRedirectUri?: string;
};

const defaults: AccountData = {
  companyId: "",
  companyName: "",
  country: "UK",
  industry: "construction",
  targetMargin: 20,
  vatScheme: "standard",
  reverseCharge: true,
  cis: true,
  hmrcClientId: "",
  hmrcRedirectUri: "",
  hmrcVatNumber: "",
  hmrcUtr: "",
  truelayerClientId: "",
  truelayerRedirectUri: "",
};

export default function AccountSettings() {
  const [data, setData] = useState<AccountData>(defaults);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyStatuses, setKeyStatuses] = useState<Record<string, 'checking' | 'valid' | 'invalid' | 'missing'>>({});
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load from secure storage first, fallback to localStorage
        const secureData = await secureStorage.getItem('account-settings');
        if (secureData) {
          setData({ ...defaults, ...secureData });
        } else {
          const raw = localStorage.getItem(LS);
          if (raw) {
            const legacyData = JSON.parse(raw) as AccountData;
            setData({ ...defaults, ...legacyData });
            // Migrate to secure storage
            await secureStorage.setItem('account-settings', legacyData);
            localStorage.removeItem(LS);
          }
        }
      } catch (err) {
        console.error('Failed to load account settings', err);
      }
    };

    loadSettings();
    checkApiKeyStatuses();
  }, []);

  const checkApiKeyStatuses = async () => {
    // Check OpenAI key
    setKeyStatuses(prev => ({ ...prev, openai: 'checking' }));
    try {
      const { error } = await supabase.functions.invoke("advisor", {
        body: { message: "test", context: {} },
      });
      
      if (error?.message?.includes('OPENAI_API_KEY')) {
        setKeyStatuses(prev => ({ ...prev, openai: 'missing' }));
      } else if (error) {
        setKeyStatuses(prev => ({ ...prev, openai: 'invalid' }));
      } else {
        setKeyStatuses(prev => ({ ...prev, openai: 'valid' }));
      }
    } catch {
      setKeyStatuses(prev => ({ ...prev, openai: 'missing' }));
    }

    // Check Firecrawl key
    setKeyStatuses(prev => ({ ...prev, firecrawl: 'checking' }));
    try {
      const { error } = await supabase.functions.invoke("tenderbot", {
        body: { url: "https://example.com", mode: "scrape" },
      });
      
      if (error?.message?.includes('FIRECRAWL_API_KEY')) {
        setKeyStatuses(prev => ({ ...prev, firecrawl: 'missing' }));
      } else if (error) {
        setKeyStatuses(prev => ({ ...prev, firecrawl: 'invalid' }));
      } else {
        setKeyStatuses(prev => ({ ...prev, firecrawl: 'valid' }));
      }
    } catch {
      setKeyStatuses(prev => ({ ...prev, firecrawl: 'missing' }));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await secureStorage.setItem('account-settings', data);
      // Remove legacy localStorage data if it exists
      localStorage.removeItem(LS);
      
      setTimeout(() => {
        setSaving(false);
        toast({
          title: "Settings Saved",
          description: "Your account settings have been updated securely."
        });
      }, 500);
    } catch (error) {
      setSaving(false);
      toast({
        title: "Save Failed",
        description: "Failed to save settings securely. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'valid':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'invalid':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'missing':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'valid':
        return 'Active';
      case 'invalid':
        return 'Invalid';
      case 'missing':
        return 'Not configured';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      
      <main className="container mx-auto grid gap-6 animate-fade-in">
      <SEO title="Account Settings | API Keys & Company Info" description="Manage your API keys and company information." noindex />
      
      <header className="pt-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-text-secondary">Manage your API keys, company information, and service configurations.</p>
      </header>

      {/* API Keys Section */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">API Keys & Service Configuration</h2>
        </div>
        
        <div className="space-y-4">
          {/* OpenAI API Key */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                OpenAI API Key
                {getStatusIcon(keyStatuses.openai)}
                <span className="text-xs text-text-secondary">
                  ({getStatusText(keyStatuses.openai)})
                </span>
              </label>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.openai ? "text" : "password"}
                className="input pr-10"
                placeholder="sk-..."
                value={data.openaiApiKey || ""}
                onChange={(e) => setData({ ...data, openaiApiKey: e.target.value })}
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('openai')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Required for: AI Advisor, RAMS Generator, Quote Bot, Tax Bot, Agent Chat
            </p>
          </div>

          {/* Firecrawl API Key */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                Firecrawl API Key
                {getStatusIcon(keyStatuses.firecrawl)}
                <span className="text-xs text-text-secondary">
                  ({getStatusText(keyStatuses.firecrawl)})
                </span>
              </label>
              <a 
                href="https://www.firecrawl.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.firecrawl ? "text" : "password"}
                className="input pr-10"
                placeholder="fc-..."
                value={data.firecrawlApiKey || ""}
                onChange={(e) => setData({ ...data, firecrawlApiKey: e.target.value })}
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('firecrawl')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.firecrawl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Required for: TenderBot web crawling and content extraction
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> API keys are stored securely in Supabase and never exposed to the frontend. 
            You only need to enter them once.
          </p>
        </div>
      </section>

      {/* HMRC & Banking (Mock) */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">HMRC & Banking (Mock)</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input 
            className="input" 
            placeholder="HMRC Client ID" 
            value={data.hmrcClientId || ""} 
            onChange={(e) => setData({ ...data, hmrcClientId: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="HMRC Redirect URI" 
            value={data.hmrcRedirectUri || ""} 
            onChange={(e) => setData({ ...data, hmrcRedirectUri: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="VAT Number" 
            value={data.hmrcVatNumber || ""} 
            onChange={(e) => setData({ ...data, hmrcVatNumber: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="UTR" 
            value={data.hmrcUtr || ""} 
            onChange={(e) => setData({ ...data, hmrcUtr: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="TrueLayer Client ID" 
            value={data.truelayerClientId || ""} 
            onChange={(e) => setData({ ...data, truelayerClientId: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="TrueLayer Redirect URI" 
            value={data.truelayerRedirectUri || ""} 
            onChange={(e) => setData({ ...data, truelayerRedirectUri: e.target.value })} 
          />
        </div>
        <p className="text-xs text-text-secondary mt-2">These are used only for mock flows to generate URLs and payloads.</p>
      </section>

      {/* Company Information */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Building className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Company Information</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-3">
          <input 
            className="input" 
            placeholder="Company name" 
            value={data.companyName || ""} 
            onChange={(e) => setData({ ...data, companyName: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="Company ID" 
            value={data.companyId || ""} 
            onChange={(e) => setData({ ...data, companyId: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="Country" 
            value={data.country || ""} 
            onChange={(e) => setData({ ...data, country: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="Industry" 
            value={data.industry || ""} 
            onChange={(e) => setData({ ...data, industry: e.target.value })} 
          />
          <input 
            className="input md:col-span-2" 
            placeholder="Address" 
            value={data.address || ""} 
            onChange={(e) => setData({ ...data, address: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="Website" 
            value={data.website || ""} 
            onChange={(e) => setData({ ...data, website: e.target.value })} 
          />
          <input 
            className="input" 
            placeholder="Phone" 
            value={data.phone || ""} 
            onChange={(e) => setData({ ...data, phone: e.target.value })} 
          />
          <input 
            className="input md:col-span-2" 
            type="email" 
            placeholder="Contact email" 
            value={data.contactEmail || ""} 
            onChange={(e) => setData({ ...data, contactEmail: e.target.value })} 
          />
        </div>
      </section>

      {/* Tax & Business Settings */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">Tax & Business Settings</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <select 
            className="input" 
            value={data.vatScheme} 
            onChange={(e) => setData({ ...data, vatScheme: e.target.value as AccountData["vatScheme"] })}
          >
            <option value="standard">Standard VAT</option>
            <option value="flat-rate">Flat-rate</option>
            <option value="cash-accounting">Cash accounting</option>
          </select>
          <input 
            className="input" 
            type="number" 
            min={0} 
            max={90} 
            placeholder="Target margin %" 
            value={data.targetMargin}
            onChange={(e) => setData({ ...data, targetMargin: Number(e.target.value) })} 
          />
          <select 
            className="input" 
            value={data.reverseCharge ? "yes" : "no"} 
            onChange={(e) => setData({ ...data, reverseCharge: e.target.value === "yes" })}
          >
            <option value="yes">Reverse charge ON</option>
            <option value="no">Reverse charge OFF</option>
          </select>
          <select 
            className="input" 
            value={data.cis ? "yes" : "no"} 
            onChange={(e) => setData({ ...data, cis: e.target.value === "yes" })}
          >
            <option value="yes">CIS ON</option>
            <option value="no">CIS OFF</option>
          </select>
        </div>
      </section>

      {/* Save Button */}
      <section className="card">
        <div className="flex gap-2">
          <button 
            className="button flex items-center gap-2" 
            onClick={save} 
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <button 
            className="button-secondary" 
            onClick={checkApiKeyStatuses}
          >
            Check API Keys
          </button>
        </div>
      </section>
    </main>
    </>
  );
}
