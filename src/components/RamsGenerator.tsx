
import React, { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useToast } from "@/hooks/use-toast";
import ErrorHandler from "@/components/ErrorHandler";

export default function RamsGenerator() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState("");
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<any>(null);
  const companyId = useCompanyId();
  const { toast } = useToast();

  const project = useMemo(
    () => ({
      name,
      location,
      description,
      date,
      tasks: tasks
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }),
    [name, location, description, date, tasks]
  );

  async function generate() {
    if (!name) {
      toast({
        title: "Missing Information",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setHtml("");
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("rams", {
        body: { project },
      });
      
      if (error) {
        console.error("RAMS generation error:", error);
        throw error;
      }
      
      const sanitizedHtml = DOMPurify.sanitize((data as any)?.html || "");
      setHtml(sanitizedHtml);
      
      toast({
        title: "Success",
        description: "RAMS document generated successfully"
      });
    } catch (e: any) {
      console.error("RAMS generation failed:", e);
      setError(e);
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate RAMS document.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  function openPrint() {
    if (!html) return;
    const win = window.open("", "_blank");
    if (!win) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RAMS Document - ${name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${DOMPurify.sanitize(html)}
      </body>
      </html>
    `;
    
    win.document.write(printContent);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="grid gap-3">
      <div className="grid md:grid-cols-2 gap-2">
        <input 
          className="input" 
          placeholder="Project name *" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required
        />
        <input 
          className="input" 
          placeholder="Location" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
        />
        <input 
          className="input" 
          placeholder="Brief description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <input 
          className="input" 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
        <input 
          className="input md:col-span-2" 
          placeholder="Tasks (comma separated)" 
          value={tasks} 
          onChange={(e) => setTasks(e.target.value)} 
        />
      </div>
      
      <div className="flex gap-2">
        <button 
          className="button" 
          onClick={generate} 
          disabled={loading || !name}
        >
          {loading ? "Generating…" : "Generate RAMS"}
        </button>
        <button 
          className="button-secondary" 
          onClick={openPrint} 
          disabled={!html}
        >
          Print / Open
        </button>
      </div>

      {error && (
        <ErrorHandler 
          error={error} 
          context="RAMS Generator"
          onRetry={generate}
          showApiKeyPrompt={true}
        />
      )}

      {html && (
        <div className="bg-gray-900 rounded-md p-3 max-h-[400px] overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
        </div>
      )}
    </div>
  );
}
