import { Project, Phase, Step } from "../types";

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Westside Distribution Center",
    description: "200,000 sq ft automated distribution facility with robotics integration",
    status: "active",
    startDate: "2025-01-15",
    endDate: "2026-03-30",
    location: "Phoenix, AZ",
    owner: "Acme Logistics",
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2025-10-01T14:30:00Z",
  },
  {
    id: "2",
    name: "Downtown Office Tower",
    description: "15-story Class A office building with ground-floor retail",
    status: "active",
    startDate: "2025-03-01",
    endDate: "2027-06-15",
    location: "Austin, TX",
    owner: "Metro Development Corp",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-09-28T16:45:00Z",
  },
  {
    id: "3",
    name: "Greenfield Manufacturing Plant",
    description: "High-tech manufacturing facility with clean rooms",
    status: "planning",
    startDate: "2025-11-01",
    location: "San Jose, CA",
    owner: "TechCorp Industries",
    createdAt: "2025-08-15T11:20:00Z",
    updatedAt: "2025-09-30T10:15:00Z",
  },
  {
    id: "4",
    name: "Riverside Residential Complex",
    description: "Mixed-use development with 300 residential units",
    status: "completed",
    startDate: "2023-05-01",
    endDate: "2025-08-15",
    location: "Portland, OR",
    owner: "Urban Living Partners",
    createdAt: "2023-03-01T08:00:00Z",
    updatedAt: "2025-08-15T17:00:00Z",
  },
];

export const mockPhases: Phase[] = [
  {
    id: "p1",
    projectId: "1",
    name: "Site Preparation",
    description: "Grading, utilities, and foundation work",
    status: "completed",
    order: 1,
    startDate: "2025-01-15",
    endDate: "2025-04-30",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "p2",
    projectId: "1",
    name: "Structural Steel Erection",
    description: "Main building frame and roof structure",
    status: "completed",
    order: 2,
    startDate: "2025-05-01",
    endDate: "2025-07-15",
    createdAt: "2025-01-10T10:05:00Z",
  },
  {
    id: "p3",
    projectId: "1",
    name: "Building Envelope",
    description: "Exterior walls, roofing, and windows",
    status: "in-progress",
    order: 3,
    startDate: "2025-07-16",
    endDate: "2025-10-31",
    createdAt: "2025-01-10T10:10:00Z",
  },
  {
    id: "p4",
    projectId: "1",
    name: "MEP Rough-In",
    description: "Mechanical, electrical, and plumbing systems",
    status: "pending",
    order: 4,
    startDate: "2025-09-01",
    createdAt: "2025-01-10T10:15:00Z",
  },
  {
    id: "p5",
    projectId: "1",
    name: "Interior Finishes",
    description: "Drywall, flooring, and paint",
    status: "pending",
    order: 5,
    createdAt: "2025-01-10T10:20:00Z",
  },
];

export const mockSteps: Step[] = [
  {
    id: "s1",
    phaseId: "p3",
    projectId: "1",
    name: "Install Metal Wall Panels - North Elevation",
    description: "Install insulated metal panels on north wall per spec 07420",
    status: "in-progress",
    assignee: "Mike Johnson",
    dueDate: "2025-10-10",
    references: ["DWG-A-301", "SPEC-07420"],
    checklist: [
      { id: "c1", label: "Verify substrate conditions", completed: true },
      { id: "c2", label: "Install flashing at base", completed: true },
      { id: "c3", label: "Set starting track level", completed: false },
      { id: "c4", label: "Install panels per manufacturer spec", completed: false },
    ],
    createdAt: "2025-09-01T09:00:00Z",
  },
  {
    id: "s2",
    phaseId: "p3",
    projectId: "1",
    name: "Roof Membrane Installation - Zone A",
    description: "Install TPO roofing membrane on main building zone A",
    status: "pending",
    assignee: "Sarah Chen",
    dueDate: "2025-10-15",
    references: ["DWG-A-501", "SPEC-07530"],
    checklist: [
      { id: "c5", label: "Inspect deck for defects", completed: false },
      { id: "c6", label: "Install insulation boards", completed: false },
      { id: "c7", label: "Roll out and weld TPO membrane", completed: false },
      { id: "c8", label: "Install edge terminations", completed: false },
    ],
    createdAt: "2025-09-01T09:30:00Z",
  },
  {
    id: "s3",
    phaseId: "p3",
    projectId: "1",
    name: "Window Installation - East Wing",
    description: "Install curtain wall system on east elevation",
    status: "blocked",
    assignee: "Tom Rodriguez",
    dueDate: "2025-10-12",
    references: ["DWG-A-401", "SPEC-08410"],
    checklist: [
      { id: "c9", label: "Review shop drawings", completed: true },
      { id: "c10", label: "Verify opening dimensions", completed: true },
      { id: "c11", label: "Receive glass delivery", completed: false },
      { id: "c12", label: "Install curtain wall frames", completed: false },
    ],
    createdAt: "2025-09-01T10:00:00Z",
  },
];

export function useProjects() {
  return {
    data: mockProjects,
    isLoading: false,
    error: null,
  };
}

export function useProject(id: string) {
  const project = mockProjects.find((p) => p.id === id);
  return {
    data: project,
    isLoading: false,
    error: project ? null : new Error("Project not found"),
  };
}

export function usePhases(projectId: string) {
  const phases = mockPhases.filter((p) => p.projectId === projectId);
  return {
    data: phases,
    isLoading: false,
    error: null,
  };
}

export function useSteps(projectId: string) {
  const steps = mockSteps.filter((s) => s.projectId === projectId);
  return {
    data: steps,
    isLoading: false,
    error: null,
  };
}
