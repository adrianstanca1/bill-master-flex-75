import type { Json } from "@/integrations/supabase/types";

export type TaskSuggestion = {
  taskName: string;
  frequency: "once" | "daily" | "weekly" | "monthly";
  checklistTemplateKey?: string;
  startTime?: string; // HH:mm
};

export type ChecklistSeed = {
  key: string; // unique within plugin, e.g. "scaffold_weekly"
  name: string;
  items: Array<{ idx?: number; question: string; input_type: "yes_no" | "text" | "numeric"; required?: boolean }>;
};

export type CivixPlugin = {
  id: string;
  name: string;
  industryTags: string[];
  seedChecklists?: ChecklistSeed[];
  suggestTasks?: (project: { meta?: Json; description?: string; total_workers?: number; tools?: { type?: string }[] }) => TaskSuggestion[];
};

export const ScaffoldingPlugin: CivixPlugin = {
  id: "scaffolding",
  name: "Scaffolding",
  industryTags: ["construction", "scaffold"],
  seedChecklists: [
    {
      key: "scaffold_weekly",
      name: "Scaffold Weekly Inspection",
      items: [
        { question: "Guardrails intact?", input_type: "yes_no" },
        { question: "Tags up to date?", input_type: "yes_no" },
        { question: "Notes", input_type: "text", required: false },
      ],
    },
  ],
  suggestTasks: (project) => {
    const tasks: TaskSuggestion[] = [];
    const hasScaffold = project.description?.toLowerCase().includes("scaffold") ||
      (project.tools || []).some((t) => (t.type || "").toUpperCase().includes("SCAFFOLD"));
    if (hasScaffold) {
      tasks.push({ taskName: "Scaffold Inspection", frequency: "weekly", checklistTemplateKey: "scaffold_weekly", startTime: "09:00" });
    }
    return tasks;
  },
};

export const HVACPlugin: CivixPlugin = {
  id: "hvac",
  name: "HVAC",
  industryTags: ["construction", "mep", "hvac"],
  seedChecklists: [
    {
      key: "mewp_check",
      name: "MEWP Pre-use Check",
      items: [
        { question: "Hydraulics leak-free?", input_type: "yes_no" },
        { question: "Battery charge level", input_type: "numeric" },
        { question: "Comments", input_type: "text", required: false },
      ],
    },
  ],
  suggestTasks: (project) => {
    const tasks: TaskSuggestion[] = [];
    const usesMEWP = (project.tools || []).some((t) => (t.type || "").toUpperCase().includes("MEWP"));
    if (usesMEWP) tasks.push({ taskName: "MEWP Pre-use Check", frequency: "daily", checklistTemplateKey: "mewp_check", startTime: "07:45" });
    if ((project.total_workers || 0) > 5) tasks.push({ taskName: "Daily Toolbox Talk", frequency: "daily", startTime: "08:00" });
    return tasks;
  },
};

export const PluginsRegistry: CivixPlugin[] = [ScaffoldingPlugin, HVACPlugin];
