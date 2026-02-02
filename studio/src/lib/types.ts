






export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  ownerId?: string;
  source?: string;
  followUpStatus?: string;
  search?: string;
  temperature?: string;
}

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'Active' | 'Invited' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  mfaEnabled: boolean;
  lastActive: string; // ISO string
  primaryMfaMethod?: 'Authenticator App' | 'SMS';
  lastMfaVerification?: string; // ISO string
  notificationPreferences?: Record<string, any>;
}

export type LeadTemperature = 'Hot' | 'Warm' | 'Cold';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  owner: User;
  dealScore: number;
  enrichedData?: {
    industry: string;
    companySize: number;
    website: string;
    socialProfiles: { [key: string]: string };
  };
  temperature: LeadTemperature;
  lastInteraction: {
    type: 'Email' | 'Call' | 'Meeting' | 'None' | 'AI Update';
    date: string; // ISO string
    summary: string;
  };
  aiScoreReason: string;
  followUpStatus?: 'Pending' | 'Overdue' | 'None';
  hygieneStatus?: 'Clean' | 'Duplicate Suspected' | 'Incomplete Data';
  source?: string;
  transfer_status?: 'Pending' | 'Accepted' | 'Rejected';
  transfer_note?: string;
  transfer_date?: string; // ISO string
}

export type DealStage = string;

export interface Deal {
  id: string;
  name: string;
  lead: Lead;
  stage: DealStage;
  value: number;
  closeDate: string;
  owner: User;
  probability: number;
}

export type TaskStatus = 'Focus Now' | 'Today' | 'Upcoming' | 'Overdue' | 'Completed';
export type TaskIntent = 'High-value deal' | 'No reply in 3 days' | 'Deal at risk' | 'Initial outreach' | 'Manual task';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO string
  completed: boolean;
  assignedTo: User;
  relatedDeal?: Deal;
  relatedLead?: Lead;
  status: TaskStatus;
  priority?: number; // 1-100
  aiReason?: string;
  intent?: TaskIntent;
}

export type CommunicationType = 'Email' | 'WhatsApp' | 'SMS' | 'Call';

export interface Communication {
  id: string;
  type: CommunicationType;
  contact: Lead;
  summary: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  content: string;
}

export type FollowUpStatus = 'Overdue' | 'Due' | 'Upcoming' | 'Completed';

export interface FollowUp {
  id: string;
  title: string;
  lead: Lead;
  deal?: Deal;
  dueDate: string; // ISO string
  priorityScore: number; // 1-100, for AI sorting
  status: FollowUpStatus;
  isAiGenerated: boolean;
  lastInteractionSummary: string;
  aiSuggestedMessage?: string;
  aiBestTimeToContact?: string;
  actionType: 'Email' | 'Call' | 'WhatsApp' | 'Task';
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'On Leave' | 'Half Day';

export interface AttendanceRecord {
  id: string;
  user: User;
  date: string; // ISO string for the date
  status: AttendanceStatus;
  checkInTime?: string; // ISO string
  checkOutTime?: string; // ISO string
  workFromHome: boolean;
  notes?: string;
}

export interface PerformanceSignal {
  tasksCompleted: number;
  followUpsCompleted: number;
  dealsProgressed: number;
  dealsClosed: number;
  missedFollowUps: number;
}

export interface EmployeePerformance {
  user: User;
  attendance: {
    daysPresent: number;
    absences: number;
    lateArrivals: number;
    averageHours: number;
  };
  performance: PerformanceSignal;
  aiInsight?: string;
  burnoutRisk?: 'Low' | 'Medium' | 'High';
}

// Activity Log Types
export type ActivityAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'LOGIN' | 'LOGOUT'
  | 'CHECK_IN' | 'CHECK_OUT' | 'COMPLETE' | 'EXECUTE' | 'OVERRIDE' | 'VIEW' | 'NOTE';

export type ActivityEntityType =
  | 'Lead' | 'Deal' | 'Task' | 'FollowUp' | 'User' | 'Automation'
  | 'Attendance' | 'Setting' | 'Role' | 'ActivityLog';

export type ActivitySource = 'Manual' | 'AI' | 'System' | 'Automation';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  actor: User | { name: 'AI System', role: 'AI' };
  action: ActivityAction;
  target: {
    type: ActivityEntityType;
    id: string;
    name: string;
  };
  summary: string;
  details?: {
    before?: string | null;
    after?: string | null;
    reason?: string; // For AI actions
    confidence?: number; // For AI actions
  };
  source: ActivitySource;
}

export interface Notification {
  id: string;
  type: 'AI' | 'Task' | 'Deal' | 'System' | 'Lead';
  title: string;
  description: string;
  timestamp: string; // ISO string
  isRead: boolean;
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  inviteDate: string; // ISO string
  expiryDate: string; // ISO string
  status: 'Pending' | 'Expired';
}

export type Permission = {
  id: string;
  category: string;
  description: string;
  isEditable: boolean;
}

export type Role = {
  name: UserRole;
  description: string;
  permissions: Record<string, boolean>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Lead Management' | 'Follow-ups & SLA' | 'CRM Hygiene' | 'AI Insights' | 'Assignment & Routing' | 'Notifications';
  triggerSummary: string;
  actionSummary: string;
  hasAi: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export type ExecutionStatus = 'Success' | 'Failed' | 'Skipped';
export type ExecutionActor = 'System' | 'AI' | 'User';

export interface ExecutionLog {
  id: string;
  timestamp: string; // ISO String
  workflowName: string;
  triggeredEntity: {
    type: 'Lead' | 'Deal' | 'User';
    name: string;
  };
  actionExecuted: string;
  status: ExecutionStatus;
  actor: ExecutionActor;
  executionTime: number; // in ms
}

export type SessionRiskLevel = 'Low' | 'Medium' | 'High';

export interface Session {
  id: string;
  user: User;
  deviceType: 'Web' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  loginTime: string; // ISO string
  lastActivity: string; // ISO string
  isMfaVerified: boolean;
  riskLevel: SessionRiskLevel;
}

export interface AiAnomalyLog {
  id: string;
  timestamp: string; // ISO string
  anomaly: string;
  description: string;
  riskLevel: 'Medium' | 'High';
  entity?: {
    type: 'Lead' | 'Deal' | 'Rule';
    name: string;
  };
}

export interface Analytics {
  totalRevenue: number;
  conversionRate: number;
  avgDealSize: number;

  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  contactedLeads: number;
  leadsBySource: { source: string; count: number }[];

  tasks: {
    total: number;
    completed: number;
    overdue: number;
    highPriority: number;
  };
  followUps: {
    total: number;
    completed: number;
    overdue: number;
  };

  pipelineByStage: { stage: string; value: number }[];
  salesRepPerformance: {
    id: string;
    name: string;
    avatar_url: string;
    dealsWon: number;
    revenueGenerated: number;
    pipelineValue: number;
    conversionRate: number;
    tasksCompleted: number;
  }[];
}
