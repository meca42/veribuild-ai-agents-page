export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type PhaseStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
export type StepStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type FileStatus = 'uploading' | 'ready' | 'archived';
export type DrawingStatus = 'draft' | 'under_review' | 'approved' | 'superseded';
export type DocumentStatus = 'draft' | 'under_review' | 'approved' | 'archived';
export type RFIStatus = 'open' | 'pending_response' | 'answered' | 'closed';
export type SubmittalStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revised';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type InspectionStatus = 'scheduled' | 'in_progress' | 'passed' | 'failed' | 'n/a';
export type AgentStatus = 'active' | 'paused' | 'archived';
export type RunStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface Organization {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  spent?: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: PhaseStatus;
  order: number;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Step {
  id: string;
  projectId: string;
  phaseId: string;
  name: string;
  description?: string;
  status: StepStatus;
  assignee?: string;
  dueDate?: Date;
  checklist: ChecklistItem[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  orgId: string;
  projectId?: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: FileStatus;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
}

export interface DrawingVersion {
  id: string;
  version: number;
  revision: string;
  fileId: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: Date;
  notes?: string;
}

export interface Drawing {
  id: string;
  projectId: string;
  number: string;
  title: string;
  discipline: string;
  status: DrawingStatus;
  currentVersion: number;
  currentRevision: string;
  versions: DrawingVersion[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  version: number;
  fileId: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: Date;
  notes?: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: string;
  status: DocumentStatus;
  currentVersion: number;
  versions: DocumentVersion[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RFI {
  id: string;
  projectId: string;
  number: string;
  subject: string;
  question: string;
  response?: string;
  status: RFIStatus;
  priority: IssuePriority;
  requestedBy: string;
  assignedTo?: string;
  dueDate?: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmittalItem {
  id: string;
  description: string;
  specification: string;
  quantity: number;
  status: SubmittalStatus;
}

export interface Submittal {
  id: string;
  projectId: string;
  number: string;
  title: string;
  type: string;
  status: SubmittalStatus;
  items: SubmittalItem[];
  submittedBy: string;
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BOMItem {
  id: string;
  projectId: string;
  name: string;
  specification: string;
  unit: string;
  quantityRequired: number;
  quantityOrdered: number;
  quantityDelivered: number;
  quantityInstalled: number;
  unitCost?: number;
  supplier?: string;
  leadTime?: number;
  notes?: string;
}

export interface Delivery {
  id: string;
  projectId: string;
  deliveryNumber: string;
  supplier: string;
  deliveredAt: Date;
  receivedBy: string;
  items: Array<{ bomItemId: string; quantity: number }>;
  notes?: string;
}

export interface InventoryLot {
  id: string;
  projectId: string;
  bomItemId: string;
  location: string;
  quantity: number;
  receivedAt: Date;
  expiryDate?: Date;
  lotNumber?: string;
}

export interface Issue {
  id: string;
  projectId: string;
  stepId?: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignedTo?: string;
  reportedBy: string;
  reportedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  tags: string[];
}

export interface Inspection {
  id: string;
  projectId: string;
  stepId?: string;
  type: string;
  scheduledDate: Date;
  inspector?: string;
  status: InspectionStatus;
  result?: string;
  notes?: string;
  completedAt?: Date;
}

export interface Agent {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  status: AgentStatus;
  allowedTools: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRun {
  id: string;
  agentId: string;
  projectId?: string;
  status: RunStatus;
  input: string;
  output?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  tokensUsed?: number;
  trace?: any;
}

export interface ApiKey {
  id: string;
  orgId: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

export interface Webhook {
  id: string;
  orgId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
}
