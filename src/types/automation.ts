export type AutomationTriggerType = "news_sources" | "web_search";
export type AutomationFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type AutomationCategory = "post" | "carousel" | "scriptShort" | "scriptYoutube" | "blog" | "email";
export type AutomationStatus = "draft" | "active" | "paused";

export interface Automation {
  id: string;
  client_id: string;
  name: string;
  trigger_type: AutomationTriggerType;
  trigger_config?: Record<string, any>;
  objective: string;
  category: AutomationCategory;
  frequency: AutomationFrequency;
  status: AutomationStatus;
  end_after_runs?: number | null;
  generations_per_run?: number | null;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
}

export interface AutomationRun {
  id: string;
  automation_id: string;
  client_id: string;
  started_at: string;
  finished_at?: string;
  status: 'running' | 'success' | 'failed';
  items_generated?: number;
  error_message?: string;
  automation?: {
    name: string;
    category: AutomationCategory;
  };
}

export interface CreateAutomationDTO {
  name: string;
  trigger_type: AutomationTriggerType;
  objective: string;
  category: AutomationCategory;
  frequency: AutomationFrequency;
  status: AutomationStatus;
  end_after_runs?: number | null;
  generations_per_run?: number | null;
}