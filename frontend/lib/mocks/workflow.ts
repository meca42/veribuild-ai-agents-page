import { RFI, Submittal, Issue, Inspection } from "../types";

export const mockRFIs: RFI[] = [
  {
    id: "rfi1",
    number: "RFI-045",
    subject: "Roof Flashing Details at Parapet",
    question: "Drawing A-501 shows conflicting flashing details at the parapet. Which detail takes precedence?",
    answer: "Use detail 5/A-501 for all parapet conditions. Detail 3/A-501 is superseded.",
    status: "answered",
    priority: "medium",
    projectId: "1",
    createdBy: "Mike Johnson",
    createdAt: "2025-09-20T10:00:00Z",
    dueDate: "2025-09-27T17:00:00Z",
    answeredAt: "2025-09-23T14:30:00Z",
  },
  {
    id: "rfi2",
    number: "RFI-046",
    subject: "Window Glazing Specification",
    question: "Spec section 08 44 00 calls for low-E coating on surface #2, but window schedule shows surface #3. Please clarify.",
    status: "submitted",
    priority: "high",
    projectId: "1",
    createdBy: "Tom Rodriguez",
    createdAt: "2025-10-01T09:15:00Z",
    dueDate: "2025-10-08T17:00:00Z",
  },
  {
    id: "rfi3",
    number: "RFI-047",
    subject: "Steel Column Base Plate Thickness",
    question: "Can we substitute 1\" base plates for 1.25\" plates at columns C3-C6 per value engineering proposal?",
    status: "draft",
    priority: "low",
    projectId: "1",
    createdBy: "Sarah Chen",
    createdAt: "2025-10-02T11:00:00Z",
  },
];

export const mockSubmittals: Submittal[] = [
  {
    id: "sub1",
    number: "SUB-023",
    title: "Insulated Metal Wall Panels - Product Data",
    type: "product-data",
    status: "approved",
    projectId: "1",
    createdBy: "Mike Johnson",
    createdAt: "2025-08-15T10:00:00Z",
    dueDate: "2025-09-01T17:00:00Z",
  },
  {
    id: "sub2",
    number: "SUB-024",
    title: "Curtain Wall System - Shop Drawings",
    type: "shop-drawing",
    status: "under-review",
    projectId: "1",
    createdBy: "Tom Rodriguez",
    createdAt: "2025-09-10T14:00:00Z",
    dueDate: "2025-10-01T17:00:00Z",
  },
  {
    id: "sub3",
    number: "SUB-025",
    title: "Roofing Membrane - Sample",
    type: "sample",
    status: "submitted",
    projectId: "1",
    createdBy: "Sarah Chen",
    createdAt: "2025-09-25T09:30:00Z",
    dueDate: "2025-10-10T17:00:00Z",
  },
];

export const mockIssues: Issue[] = [
  {
    id: "iss1",
    title: "Water Infiltration at Loading Dock",
    description: "Standing water accumulating at loading dock entrance after rain events. Needs immediate drainage solution.",
    status: "in-progress",
    priority: "high",
    projectId: "1",
    assignee: "Mike Johnson",
    createdBy: "Site Supervisor",
    createdAt: "2025-09-28T08:00:00Z",
  },
  {
    id: "iss2",
    title: "Missing Anchor Bolts - Grid Line E",
    description: "Four anchor bolts missing at column E7. Steel erection delayed until resolved.",
    status: "open",
    priority: "critical",
    projectId: "1",
    assignee: "Sarah Chen",
    createdBy: "Field Engineer",
    createdAt: "2025-10-01T11:30:00Z",
  },
  {
    id: "iss3",
    title: "Paint Color Mismatch - North Elevation",
    description: "Installed metal panels do not match approved color sample. Awaiting replacement material.",
    status: "resolved",
    priority: "medium",
    projectId: "1",
    assignee: "Tom Rodriguez",
    createdBy: "QC Inspector",
    createdAt: "2025-09-15T14:00:00Z",
    resolvedAt: "2025-09-22T16:30:00Z",
  },
];

export const mockInspections: Inspection[] = [
  {
    id: "insp1",
    title: "Foundation Final Inspection",
    type: "final",
    status: "completed",
    projectId: "1",
    inspector: "City Inspector - J. Smith",
    scheduledDate: "2025-04-20T09:00:00Z",
    completedDate: "2025-04-20T11:30:00Z",
    notes: "Approved without conditions. Proceed to next phase.",
    passed: true,
  },
  {
    id: "insp2",
    title: "Steel Frame Safety Inspection",
    type: "safety",
    status: "completed",
    projectId: "1",
    inspector: "Safety Officer - M. Davis",
    scheduledDate: "2025-07-10T13:00:00Z",
    completedDate: "2025-07-10T15:00:00Z",
    notes: "Two minor violations noted. Corrected on site.",
    passed: true,
  },
  {
    id: "insp3",
    title: "Roofing Progress Inspection",
    type: "progress",
    status: "scheduled",
    projectId: "1",
    inspector: "Roofing Consultant - L. Wang",
    scheduledDate: "2025-10-15T10:00:00Z",
    notes: "Verify TPO membrane installation and seam welds.",
  },
];

export function useRFIs() {
  return {
    data: mockRFIs,
    isLoading: false,
    error: null,
  };
}

export function useSubmittals() {
  return {
    data: mockSubmittals,
    isLoading: false,
    error: null,
  };
}

export function useIssues() {
  return {
    data: mockIssues,
    isLoading: false,
    error: null,
  };
}

export function useInspections() {
  return {
    data: mockInspections,
    isLoading: false,
    error: null,
  };
}
