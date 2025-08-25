
export interface Timesheet {
  id: string;
  company_id: string;
  user_id: string;
  project_id?: string;
  start_time: string;
  end_time?: string;
  break_duration?: number;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Daywork {
  id: string;
  company_id: string;
  project_id?: string;
  date: string;
  weather?: string;
  crew_size?: number;
  work_description: string;
  materials_used?: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  equipment_used?: Array<{
    name: string;
    hours: number;
  }>;
  progress_percentage?: number;
  photos?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  due_date: string;
  assigned_to?: string;
  created_by?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'safety' | 'maintenance' | 'deadline' | 'meeting';
  status: 'pending' | 'completed' | 'cancelled';
  recurring: boolean;
  recurring_pattern?: 'daily' | 'weekly' | 'monthly';
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  company_id: string;
  asset_name: string;
  asset_type: 'equipment' | 'vehicle' | 'material' | 'tool';
  serial_number?: string;
  current_location?: string;
  assigned_to?: string;
  project_id?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  last_service_date?: string;
  next_service_due?: string;
  purchase_date?: string;
  purchase_cost?: number;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface SitePhoto {
  id: string;
  company_id: string;
  project_id?: string;
  url: string;
  caption?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  taken_by?: string;
  photo_date: string;
  tags?: string[];
  ai_analysis?: {
    description: string;
    objects_detected: string[];
    safety_issues?: string[];
    progress_indicators?: string[];
  };
  created_at: string;
}

export interface RAMSDocument {
  id: string;
  company_id: string;
  title: string;
  project_id?: string;
  activity_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  hazards: Array<{
    id: string;
    description: string;
    likelihood: number;
    severity: number;
    risk_score: number;
  }>;
  control_measures: Array<{
    id: string;
    hazard_id: string;
    measure: string;
    responsibility: string;
    timeline: string;
  }>;
  method_statement?: string;
  ppe_required?: string[];
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  location?: string;
  client?: string;
  start_date?: string;
  end_date?: string;
  project_manager_user_id?: string;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  activeProjects: number;
  pendingReminders: number;
  activeTimesheets: number;
  recentDayworks: number;
  totalAssets: number;
  recentPhotos: number;
  ramsDocuments: number;
}
