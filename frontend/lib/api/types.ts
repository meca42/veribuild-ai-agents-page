export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type PhaseStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
export type StepStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type FileStatus = 'uploading' | 'ready' | 'archived';
export type DrawingStatus = 'draft' | 'under_review' | 'approved' | 'superseded';
export type DocumentStatus = 'draft' | 'under_review' | 'approved' | 'archived';
export type RFIStatus = 'open' | 'answered' | 'closed';
export type SubmittalStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'resubmit';
export type SubmittalItemStatus = 'pending' | 'approved' | 'rejected' | 'n/a';
export type IssueType = 'defect' | 'safety' | 'coordination' | 'other';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'verified' | 'closed';
export type InspectionStatus = 'scheduled' | 'in_progress' | 'passed' | 'failed' | 'closed';
export type InspectionItemResult = 'pass' | 'fail' | 'n/a';
export type AgentStatus = 'active' | 'paused' | 'archived';
export type RunStatus = 'running' | 'completed' | 'failed' | 'cancelled';
export type ToolPolicy = 'conservative' | 'balanced' | 'aggressive';
export type AgentRunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
export type AgentRunTrigger = 'ui' | 'api' | 'schedule' | 'webhook';
export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';
export type ToolCallStatus = 'ok' | 'error';

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
  title: string;
  question: string;
  answer?: string;
  status: RFIStatus;
  askedBy?: string;
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: RFIAttachment[];
}

export interface RFIAttachment {
  id: string;
  rfiId: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
}

export interface SubmittalItem {
  id: string;
  submittalId: string;
  description: string;
  qty?: number;
  unit?: string;
  manufacturer?: string;
  model?: string;
  status: SubmittalItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmittalAttachment {
  id: string;
  submittalId: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
}

export interface Submittal {
  id: string;
  projectId: string;
  number: string;
  title: string;
  specSection?: string;
  status: SubmittalStatus;
  submittedBy?: string;
  reviewerId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  items?: SubmittalItem[];
  attachments?: SubmittalAttachment[];
}

export interface BOMItem {
  id: string;
  projectId: string;
  itemNumber: string;
  description?: string;
  specSection?: string;
  unit?: string;
  plannedQty: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryItem {
  id: string;
  deliveryId: string;
  bomItemId?: string;
  itemNumber: string;
  description?: string;
  qty: number;
  unit?: string;
  activity?: string;
  sourceFileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Delivery {
  id: string;
  projectId: string;
  vendor?: string;
  packingListNumber?: string;
  receivedAt: Date;
  receivedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: DeliveryItem[];
}

export interface InventoryLot {
  id: string;
  projectId: string;
  bomItemId?: string;
  location?: string;
  qty: number;
  unit?: string;
  lastCountedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueAttachment {
  id: string;
  issueId: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
}

export interface Issue {
  id: string;
  projectId: string;
  stepId?: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: number;
  dueDate?: Date;
  assigneeId?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: IssueAttachment[];
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  label: string;
  result: InspectionItemResult;
  notes?: string;
  orderIndex: number;
}

export interface Inspection {
  id: string;
  projectId: string;
  name: string;
  status: InspectionStatus;
  scheduledAt?: Date;
  performedAt?: Date;
  performedBy?: string;
  meta: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  items?: InspectionItem[];
}

export interface Tool {
  id: string;
  orgId: string;
  name: string;
  version: string;
  description?: string;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface Agent {
  id: string;
  orgId: string;
  projectId?: string;
  name: string;
  model: string;
  systemPrompt?: string;
  temperature: number;
  toolPolicy: ToolPolicy;
  maxSteps: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tools?: Tool[];
  toolCount?: number;
  lastRun?: Date;
}

export interface AgentTool {
  agentId: string;
  toolId: string;
  config: Record<string, any>;
}

export interface AgentMessage {
  id: string;
  runId: string;
  role: MessageRole;
  content?: string;
  toolName?: string;
  seq: number;
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  runId: string;
  toolId: string;
  seq: number;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: ToolCallStatus;
  startedAt: Date;
  finishedAt?: Date;
  error?: string;
  toolName?: string;
}

export interface AgentRun {
  id: string;
  agentId: string;
  projectId?: string;
  startedBy?: string;
  trigger: AgentRunTrigger;
  input?: string;
  status: AgentRunStatus;
  startedAt?: Date;
  finishedAt?: Date;
  latencyMs?: number;
  error?: string;
  resultSummary?: string;
  resultBlob?: Record<string, any>;
  createdAt: Date;
  agentName?: string;
  messages?: AgentMessage[];
  toolCalls?: ToolCall[];
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
