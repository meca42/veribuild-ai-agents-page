export interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed";
  startDate: string;
  endDate?: string;
  location: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Step {
  id: string;
  phaseId: string;
  projectId: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  assignee?: string;
  dueDate?: string;
  references: string[];
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  projectId?: string;
  tags: string[];
  url: string;
}

export interface Drawing {
  id: string;
  name: string;
  number: string;
  version: string;
  discipline: "architectural" | "structural" | "mechanical" | "electrical" | "plumbing";
  status: "current" | "superseded" | "for-review";
  projectId: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface Document {
  id: string;
  name: string;
  type: "spec" | "submittal" | "rfi" | "contract" | "other";
  projectId: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface RFI {
  id: string;
  number: string;
  subject: string;
  question: string;
  answer?: string;
  status: "draft" | "submitted" | "answered" | "closed";
  priority: "low" | "medium" | "high";
  projectId: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  answeredAt?: string;
}

export interface Submittal {
  id: string;
  number: string;
  title: string;
  type: "product-data" | "shop-drawing" | "sample" | "other";
  status: "draft" | "submitted" | "under-review" | "approved" | "rejected";
  projectId: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
}

export interface Material {
  id: string;
  name: string;
  partNumber?: string;
  quantity: number;
  unit: string;
  location?: string;
  status: "ordered" | "in-transit" | "received" | "installed";
  projectId: string;
  createdAt: string;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  items: DeliveryItem[];
  deliveredAt: string;
  receivedBy: string;
  projectId: string;
  notes?: string;
}

export interface DeliveryItem {
  materialId: string;
  quantity: number;
  condition: "good" | "damaged" | "missing";
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  projectId: string;
  assignee?: string;
  createdBy: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Inspection {
  id: string;
  title: string;
  type: "safety" | "quality" | "progress" | "final";
  status: "scheduled" | "in-progress" | "completed" | "failed";
  projectId: string;
  inspector: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  passed?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: "drawing-search" | "rfi-assistant" | "inventory-query" | "spec-qa" | "custom";
  status: "active" | "inactive";
  enabledTools: string[];
  createdAt: string;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  query: string;
  response: string;
  status: "running" | "completed" | "failed";
  projectId?: string;
  user: string;
  startedAt: string;
  completedAt?: string;
  citations?: Citation[];
}

export interface Citation {
  type: "drawing" | "document" | "spec";
  id: string;
  name: string;
  excerpt: string;
}
