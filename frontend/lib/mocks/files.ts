import { FileItem, Drawing, Document } from "../types";

export const mockFiles: FileItem[] = [
  {
    id: "f1",
    name: "Site Survey Report.pdf",
    type: "application/pdf",
    size: 2456789,
    uploadedBy: "Sarah Chen",
    uploadedAt: "2025-09-15T10:30:00Z",
    projectId: "1",
    tags: ["survey", "site"],
    url: "#",
  },
  {
    id: "f2",
    name: "Safety Plan Rev 3.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 156234,
    uploadedBy: "Mike Johnson",
    uploadedAt: "2025-09-20T14:15:00Z",
    projectId: "1",
    tags: ["safety", "plan"],
    url: "#",
  },
  {
    id: "f3",
    name: "Progress Photos - Week 12.zip",
    type: "application/zip",
    size: 45678123,
    uploadedBy: "Tom Rodriguez",
    uploadedAt: "2025-10-01T09:00:00Z",
    projectId: "1",
    tags: ["photos", "progress"],
    url: "#",
  },
];

export const mockDrawings: Drawing[] = [
  {
    id: "d1",
    name: "North Elevation - Metal Panels",
    number: "A-301",
    version: "Rev 2",
    discipline: "architectural",
    status: "current",
    projectId: "1",
    uploadedAt: "2025-08-15T11:00:00Z",
    uploadedBy: "Design Team",
    url: "#",
  },
  {
    id: "d2",
    name: "Roof Plan - Main Building",
    number: "A-501",
    version: "Rev 1",
    discipline: "architectural",
    status: "current",
    projectId: "1",
    uploadedAt: "2025-08-10T10:00:00Z",
    uploadedBy: "Design Team",
    url: "#",
  },
  {
    id: "d3",
    name: "Curtain Wall Details - East Wing",
    number: "A-401",
    version: "Rev 3",
    discipline: "architectural",
    status: "current",
    projectId: "1",
    uploadedAt: "2025-09-01T14:30:00Z",
    uploadedBy: "Design Team",
    url: "#",
  },
  {
    id: "d4",
    name: "Foundation Plan",
    number: "S-101",
    version: "Rev 1",
    discipline: "structural",
    status: "superseded",
    projectId: "1",
    uploadedAt: "2025-07-01T09:00:00Z",
    uploadedBy: "Design Team",
    url: "#",
  },
  {
    id: "d5",
    name: "HVAC Equipment Schedule",
    number: "M-201",
    version: "Rev 1",
    discipline: "mechanical",
    status: "for-review",
    projectId: "1",
    uploadedAt: "2025-09-28T16:00:00Z",
    uploadedBy: "Design Team",
    url: "#",
  },
];

export const mockDocuments: Document[] = [
  {
    id: "doc1",
    name: "Division 07 - Thermal and Moisture Protection",
    type: "spec",
    projectId: "1",
    uploadedAt: "2025-08-01T10:00:00Z",
    uploadedBy: "Design Team",
    url: "#",
  },
  {
    id: "doc2",
    name: "Submittal - Metal Wall Panels",
    type: "submittal",
    projectId: "1",
    uploadedAt: "2025-09-10T14:00:00Z",
    uploadedBy: "Mike Johnson",
    url: "#",
  },
  {
    id: "doc3",
    name: "RFI-045 Response - Roof Flashing Details",
    type: "rfi",
    projectId: "1",
    uploadedAt: "2025-09-25T11:30:00Z",
    uploadedBy: "Design Team",
    url: "#",
  },
  {
    id: "doc4",
    name: "General Conditions - Construction Contract",
    type: "contract",
    projectId: "1",
    uploadedAt: "2025-07-15T09:00:00Z",
    uploadedBy: "Legal Team",
    url: "#",
  },
];

export function useFiles() {
  return {
    data: mockFiles,
    isLoading: false,
    error: null,
  };
}

export function useDrawings() {
  return {
    data: mockDrawings,
    isLoading: false,
    error: null,
  };
}

export function useDocuments() {
  return {
    data: mockDocuments,
    isLoading: false,
    error: null,
  };
}
