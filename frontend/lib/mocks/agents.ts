import { Agent, AgentRun } from "../types";

export const mockAgents: Agent[] = [
  {
    id: "ag1",
    name: "Drawing Search Assistant",
    description: "Searches project drawings and returns relevant sections with citations",
    type: "drawing-search",
    status: "active",
    enabledTools: ["search_drawings", "extract_details", "compare_versions"],
    createdAt: "2025-08-01T10:00:00Z",
  },
  {
    id: "ag2",
    name: "RFI Assistant",
    description: "Helps draft RFIs based on drawings and specifications",
    type: "rfi-assistant",
    status: "active",
    enabledTools: ["search_drawings", "search_specs", "draft_rfi"],
    createdAt: "2025-08-05T14:00:00Z",
  },
  {
    id: "ag3",
    name: "Inventory Query Agent",
    description: "Answers questions about material inventory and deliveries",
    type: "inventory-query",
    status: "active",
    enabledTools: ["query_bom", "check_deliveries", "search_inventory"],
    createdAt: "2025-08-10T09:00:00Z",
  },
  {
    id: "ag4",
    name: "Spec QA Agent",
    description: "Answers questions about project specifications",
    type: "spec-qa",
    status: "inactive",
    enabledTools: ["search_specs", "extract_requirements"],
    createdAt: "2025-09-01T11:00:00Z",
  },
];

export const mockRuns: AgentRun[] = [
  {
    id: "run1",
    agentId: "ag1",
    agentName: "Drawing Search Assistant",
    query: "What are the flashing details at the roof parapet?",
    response: "Based on drawing A-501, the parapet flashing detail is shown in Detail 5/A-501. The assembly includes a continuous metal cap flashing over the parapet, with a 4-inch minimum overlap onto the roof membrane.",
    status: "completed",
    projectId: "1",
    user: "Mike Johnson",
    startedAt: "2025-10-02T14:30:00Z",
    completedAt: "2025-10-02T14:30:15Z",
    citations: [
      {
        type: "drawing",
        id: "d2",
        name: "A-501 - Roof Plan",
        excerpt: "Detail 5/A-501 - Parapet flashing assembly with metal cap...",
      },
    ],
  },
  {
    id: "run2",
    agentId: "ag3",
    agentName: "Inventory Query Agent",
    query: "Do we have TPO roofing membrane on site?",
    response: "Yes, we have 12,000 SF of TPO-60-WHITE roofing membrane on site. It was delivered on September 20, 2025 and is currently stored in Staging Area B.",
    status: "completed",
    projectId: "1",
    user: "Sarah Chen",
    startedAt: "2025-10-03T09:15:00Z",
    completedAt: "2025-10-03T09:15:08Z",
  },
  {
    id: "run3",
    agentId: "ag2",
    agentName: "RFI Assistant",
    query: "Draft an RFI about the conflicting window glazing specifications",
    response: "Here's a draft RFI:\n\nSubject: Window Glazing Low-E Coating Location Clarification\n\nQuestion: Specification section 08 44 00 indicates low-E coating should be on surface #2 of the insulated glazing unit, while the window schedule on drawing A-401 shows surface #3. Please clarify which surface location is correct for the low-E coating.\n\nReferences:\n- Spec 08 44 00, Section 2.3\n- Drawing A-401, Window Schedule",
    status: "completed",
    projectId: "1",
    user: "Tom Rodriguez",
    startedAt: "2025-10-03T11:00:00Z",
    completedAt: "2025-10-03T11:00:22Z",
    citations: [
      {
        type: "spec",
        id: "doc1",
        name: "08 44 00 - Curtain Wall",
        excerpt: "Low-E coating shall be applied to surface #2...",
      },
      {
        type: "drawing",
        id: "d3",
        name: "A-401 - Curtain Wall Details",
        excerpt: "Window Schedule: Low-E coating on surface #3",
      },
    ],
  },
];

export function useAgents() {
  return {
    data: mockAgents,
    isLoading: false,
    error: null,
  };
}

export function useRuns() {
  return {
    data: mockRuns,
    isLoading: false,
    error: null,
  };
}
