import { faker, generateId, randomElement, randomElements, randomInt, randomPastDate, randomFutureDate, randomDate } from './seed';
import type * as API from '../api/types';

interface MockDatabase {
  organizations: API.Organization[];
  projects: API.Project[];
  phases: API.Phase[];
  steps: API.Step[];
  files: API.File[];
  drawings: API.Drawing[];
  documents: API.Document[];
  rfis: API.RFI[];
  submittals: API.Submittal[];
  bomItems: API.BOMItem[];
  deliveries: API.Delivery[];
  inventoryLots: API.InventoryLot[];
  issues: API.Issue[];
  inspections: API.Inspection[];
  agents: API.Agent[];
  agentRuns: API.AgentRun[];
  apiKeys: API.ApiKey[];
  webhooks: API.Webhook[];
}

let db: MockDatabase = {
  organizations: [],
  projects: [],
  phases: [],
  steps: [],
  files: [],
  drawings: [],
  documents: [],
  rfis: [],
  submittals: [],
  bomItems: [],
  deliveries: [],
  inventoryLots: [],
  issues: [],
  inspections: [],
  agents: [],
  agentRuns: [],
  apiKeys: [],
  webhooks: [],
};

const projectStatuses: API.ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'archived'];
const phaseStatuses: API.PhaseStatus[] = ['not_started', 'in_progress', 'blocked', 'done'];
const stepStatuses: API.StepStatus[] = ['todo', 'in_progress', 'review', 'done', 'blocked'];
const drawingDisciplines = ['A', 'S', 'M', 'E', 'P', 'C', 'L'];
const drawingStatuses: API.DrawingStatus[] = ['draft', 'under_review', 'approved', 'superseded'];
const documentTypes = ['Contract', 'Specification', 'Report', 'Certificate', 'Permit', 'Safety Plan'];
const documentStatuses: API.DocumentStatus[] = ['draft', 'under_review', 'approved', 'archived'];
const rfiStatuses: API.RFIStatus[] = ['open', 'answered', 'closed'];
const submittalTypes = ['Shop Drawing', 'Product Data', 'Sample', 'Test Report', 'Closeout'];
const submittalStatuses: API.SubmittalStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'resubmit'];
const priorities: API.IssuePriority[] = ['low', 'medium', 'high', 'critical'];
const issueStatuses: API.IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const inspectionTypes = ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Final'];
const inspectionStatuses: API.InspectionStatus[] = ['scheduled', 'in_progress', 'passed', 'failed', 'n/a'];
const agentTools = ['search_documents', 'query_database', 'send_notification', 'create_task', 'analyze_drawing'];

const generateOrganizations = (): API.Organization[] => {
  return [
    {
      id: 'org-1',
      name: 'VeriBuild Construction Inc.',
      createdAt: randomPastDate(365),
    },
    {
      id: 'org-2',
      name: 'Summit Builders LLC',
      createdAt: randomPastDate(365),
    },
    {
      id: 'org-3',
      name: 'GreenTech Development',
      createdAt: randomPastDate(365),
    },
  ];
};

const generateProjects = (orgId: string, count: number): API.Project[] => {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = randomPastDate(180);
    const status = randomElement(projectStatuses);
    const progress = status === 'completed' ? 100 : status === 'planning' ? randomInt(0, 20) : randomInt(20, 95);
    
    return {
      id: generateId('proj'),
      orgId,
      name: `${faker.company.catchPhrase()} ${faker.location.city()} Project`,
      description: faker.lorem.sentence(),
      status,
      location: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
      startDate: randomPastDate(120),
      endDate: randomFutureDate(200),
      budget: randomInt(1000000, 20000000),
      spent: randomInt(100000, 5000000),
      progress,
      createdAt,
      updatedAt: randomDate(createdAt, new Date()),
    };
  });
};

const generatePhases = (projectId: string): API.Phase[] => {
  const phaseNames = ['Pre-Construction', 'Foundation', 'Structure', 'Exterior', 'Interior', 'Finishes'];
  return phaseNames.map((name, index) => ({
    id: generateId('phase'),
    projectId,
    name,
    description: faker.lorem.sentence(),
    status: index === 0 ? 'done' : index === 1 ? 'in_progress' : 'not_started',
    order: index,
    progress: index === 0 ? 100 : index === 1 ? randomInt(40, 70) : 0,
    startDate: index === 0 ? randomPastDate(90) : undefined,
    endDate: index === 0 ? randomPastDate(60) : undefined,
    createdAt: randomPastDate(90),
    updatedAt: new Date(),
  }));
};

const generateSteps = (projectId: string, phaseId: string, count: number): API.Step[] => {
  return Array.from({ length: count }, () => {
    const checklistCount = randomInt(2, 6);
    return {
      id: generateId('step'),
      projectId,
      phaseId,
      name: faker.company.buzzPhrase(),
      description: faker.lorem.paragraph(),
      status: randomElement(stepStatuses),
      assignee: faker.person.fullName(),
      dueDate: Math.random() > 0.3 ? randomFutureDate(60) : undefined,
      checklist: Array.from({ length: checklistCount }, (_, i) => ({
        id: generateId('check'),
        text: faker.company.catchPhrase(),
        checked: Math.random() > 0.5,
      })),
      tags: randomElements(['safety', 'inspection', 'quality', 'urgent', 'review'], randomInt(0, 3)),
      createdAt: randomPastDate(60),
      updatedAt: new Date(),
    };
  });
};

const generateDrawings = (projectId: string, count: number): API.Drawing[] => {
  return Array.from({ length: count }, (_, i) => {
    const discipline = randomElement(drawingDisciplines);
    const number = `${discipline}-${String(i + 101).padStart(3, '0')}`;
    const versionCount = randomInt(1, 4);
    const currentVersion = versionCount;
    const revisions = ['A', 'B', 'C', 'D', 'E'];
    
    return {
      id: generateId('drawing'),
      projectId,
      number,
      title: faker.company.catchPhrase(),
      discipline: discipline === 'A' ? 'Architectural' : discipline === 'S' ? 'Structural' : discipline === 'M' ? 'Mechanical' : discipline === 'E' ? 'Electrical' : discipline === 'P' ? 'Plumbing' : discipline === 'C' ? 'Civil' : 'Landscape',
      status: randomElement(drawingStatuses),
      currentVersion,
      currentRevision: revisions[currentVersion - 1],
      versions: Array.from({ length: versionCount }, (_, v) => ({
        id: generateId('version'),
        version: v + 1,
        revision: revisions[v],
        fileId: generateId('file'),
        fileName: `${number}-${revisions[v]}.pdf`,
        uploadedBy: faker.person.fullName(),
        uploadedAt: randomPastDate(90 - v * 20),
        notes: v === versionCount - 1 ? faker.lorem.sentence() : undefined,
      })),
      createdAt: randomPastDate(90),
      updatedAt: new Date(),
    };
  });
};

const generateDocuments = (projectId: string, count: number): API.Document[] => {
  return Array.from({ length: count }, () => {
    const versionCount = randomInt(1, 3);
    return {
      id: generateId('doc'),
      projectId,
      title: faker.company.catchPhrase(),
      type: randomElement(documentTypes),
      status: randomElement(documentStatuses),
      currentVersion: versionCount,
      versions: Array.from({ length: versionCount }, (_, v) => ({
        id: generateId('version'),
        version: v + 1,
        fileId: generateId('file'),
        fileName: `${faker.system.fileName()}.pdf`,
        uploadedBy: faker.person.fullName(),
        uploadedAt: randomPastDate(90 - v * 30),
        notes: v === versionCount - 1 ? faker.lorem.sentence() : undefined,
      })),
      createdAt: randomPastDate(90),
      updatedAt: new Date(),
    };
  });
};

const generateRFIs = (projectId: string, count: number): API.RFI[] => {
  return Array.from({ length: count }, (_, i) => {
    const status = randomElement(rfiStatuses);
    const createdAt = randomPastDate(60);
    return {
      id: generateId('rfi'),
      projectId,
      number: `RFI-${String(i + 1).padStart(3, '0')}`,
      title: faker.company.catchPhrase(),
      question: faker.lorem.paragraph(),
      answer: status === 'answered' || status === 'closed' ? faker.lorem.paragraph() : undefined,
      status,
      askedBy: faker.person.fullName(),
      assignedTo: faker.person.fullName(),
      dueDate: randomFutureDate(30),
      createdAt,
      updatedAt: new Date(),
    };
  });
};

const generateSubmittals = (projectId: string, count: number): API.Submittal[] => {
  return Array.from({ length: count }, (_, i) => {
    const status = randomElement(submittalStatuses);
    const createdAt = randomPastDate(60);
    const itemCount = randomInt(3, 8);
    
    return {
      id: generateId('submittal'),
      projectId,
      number: `SUB-${String(i + 1).padStart(3, '0')}`,
      title: faker.company.catchPhrase(),
      specSection: '03 30 00',
      status,
      items: Array.from({ length: itemCount }, () => ({
        id: generateId('item'),
        submittalId: generateId('submittal'),
        description: faker.commerce.productName(),
        qty: randomInt(1, 500),
        unit: randomElement(['EA', 'SF', 'LF', 'CY']),
        manufacturer: faker.company.name(),
        model: faker.string.alphanumeric(8).toUpperCase(),
        status: randomElement(['pending', 'approved', 'rejected', 'n/a'] as API.SubmittalItemStatus[]),
        createdAt,
        updatedAt: new Date(),
      })),
      submittedBy: faker.person.fullName(),
      reviewerId: status === 'approved' || status === 'rejected' ? faker.person.fullName() : undefined,
      dueDate: randomFutureDate(45),
      createdAt,
      updatedAt: new Date(),
    };
  });
};

const generateBOM = (projectId: string, count: number): API.BOMItem[] => {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = randomPastDate(60);
    return {
      id: generateId('bom'),
      projectId,
      itemNumber: `ITEM-${String(i + 1).padStart(4, '0')}`,
      description: faker.commerce.productName(),
      specSection: Math.random() > 0.5 ? faker.string.numeric({ length: 2 }) + ' ' + faker.string.numeric({ length: 2 }) + ' ' + faker.string.numeric({ length: 2 }) : undefined,
      unit: randomElement(['EA', 'SF', 'LF', 'CY', 'TON', 'GAL', 'LB']),
      plannedQty: randomInt(10, 1000),
      createdAt,
      updatedAt: new Date(),
    };
  });
};

const generateDeliveries = (projectId: string, bomItems: API.BOMItem[], count: number): API.Delivery[] => {
  return Array.from({ length: count }, (_, i) => {
    const itemsInDelivery = randomElements(bomItems, randomInt(1, 5));
    const receivedAt = randomPastDate(60);
    const createdAt = randomPastDate(90);
    return {
      id: generateId('delivery'),
      projectId,
      vendor: faker.company.name(),
      packingListNumber: Math.random() > 0.3 ? `PKG-${faker.string.alphanumeric(8).toUpperCase()}` : undefined,
      receivedAt,
      receivedBy: faker.person.fullName(),
      notes: Math.random() > 0.6 ? faker.lorem.sentence() : undefined,
      createdAt,
      updatedAt: new Date(),
      items: itemsInDelivery.map((item) => ({
        id: generateId('delitem'),
        deliveryId: generateId('delivery'),
        bomItemId: item.id,
        itemNumber: item.itemNumber,
        description: item.description,
        qty: randomInt(1, 50),
        unit: item.unit,
        activity: Math.random() > 0.5 ? faker.commerce.department() : undefined,
        sourceFileId: undefined,
        createdAt: receivedAt,
        updatedAt: new Date(),
      })),
    };
  });
};

const generateInventoryLots = (projectId: string, bomItems: API.BOMItem[], count: number): API.InventoryLot[] => {
  const locations = ['NW Ramp', 'Zone A', 'Zone B', 'Zone C', 'South Yard', 'East Storage', 'Main Warehouse', 'default'];
  return Array.from({ length: count }, () => {
    const bomItem = randomElement(bomItems);
    const lastCountedAt = randomPastDate(30);
    const createdAt = randomPastDate(60);
    return {
      id: generateId('lot'),
      projectId,
      bomItemId: bomItem.id,
      location: randomElement(locations),
      qty: randomInt(5, 200),
      unit: bomItem.unit,
      lastCountedAt,
      createdAt,
      updatedAt: new Date(),
    };
  });
};

const generateIssues = (projectId: string, stepIds: string[], count: number): API.Issue[] => {
  return Array.from({ length: count }, () => {
    const status = randomElement(issueStatuses);
    const createdAt = randomPastDate(60);
    return {
      id: generateId('issue'),
      projectId,
      stepId: Math.random() > 0.3 ? randomElement(stepIds) : undefined,
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      status,
      priority: randomElement(priorities),
      assignedTo: Math.random() > 0.2 ? faker.person.fullName() : undefined,
      reportedBy: faker.person.fullName(),
      reportedAt: createdAt,
      resolvedAt: status === 'resolved' || status === 'closed' ? randomDate(createdAt, new Date()) : undefined,
      resolution: status === 'resolved' || status === 'closed' ? faker.lorem.sentence() : undefined,
      tags: randomElements(['safety', 'quality', 'design', 'coordination', 'schedule'], randomInt(0, 3)),
    };
  });
};

const generateInspections = (projectId: string, stepIds: string[], count: number): API.Inspection[] => {
  return Array.from({ length: count }, () => {
    const status = randomElement(inspectionStatuses);
    const scheduledDate = randomFutureDate(60);
    return {
      id: generateId('inspection'),
      projectId,
      stepId: Math.random() > 0.4 ? randomElement(stepIds) : undefined,
      type: randomElement(inspectionTypes),
      scheduledDate,
      inspector: Math.random() > 0.3 ? faker.person.fullName() : undefined,
      status,
      result: status === 'passed' || status === 'failed' ? faker.lorem.sentence() : undefined,
      notes: Math.random() > 0.5 ? faker.lorem.paragraph() : undefined,
      completedAt: status === 'passed' || status === 'failed' ? randomDate(scheduledDate, new Date()) : undefined,
    };
  });
};

const generateAgents = (projectId: string | undefined, count: number): API.Agent[] => {
  const agentNames = ['Document Analyzer', 'Schedule Optimizer', 'Quality Inspector', 'Budget Monitor'];
  return Array.from({ length: count }, (_, i) => ({
    id: generateId('agent'),
    projectId,
    name: agentNames[i % agentNames.length],
    description: faker.lorem.sentence(),
    status: randomElement(['active', 'paused', 'archived'] as API.AgentStatus[]),
    allowedTools: randomElements(agentTools, randomInt(2, 4)),
    createdAt: randomPastDate(90),
    updatedAt: new Date(),
  }));
};

const generateAgentRuns = (agentId: string, projectId: string | undefined, count: number): API.AgentRun[] => {
  return Array.from({ length: count }, () => {
    const status = randomElement(['running', 'completed', 'failed', 'cancelled'] as API.RunStatus[]);
    const startedAt = randomPastDate(30);
    const duration = status === 'completed' ? randomInt(1000, 60000) : status === 'failed' ? randomInt(500, 5000) : undefined;
    
    return {
      id: generateId('run'),
      agentId,
      projectId,
      status,
      input: faker.lorem.sentence(),
      output: status === 'completed' ? faker.lorem.paragraph() : undefined,
      startedAt,
      completedAt: status !== 'running' ? new Date(startedAt.getTime() + (duration || 0)) : undefined,
      duration,
      tokensUsed: status === 'completed' ? randomInt(100, 5000) : undefined,
      trace: status === 'completed' ? { steps: randomInt(3, 12), tools_used: randomElements(agentTools, randomInt(1, 3)) } : undefined,
    };
  });
};

const generateApiKeys = (orgId: string, count: number): API.ApiKey[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId('key'),
    orgId,
    name: `API Key ${i + 1}`,
    keyPrefix: `vb_${faker.string.alphanumeric(8)}`,
    createdAt: randomPastDate(180),
    lastUsedAt: Math.random() > 0.3 ? randomPastDate(7) : undefined,
    expiresAt: Math.random() > 0.5 ? randomFutureDate(365) : undefined,
  }));
};

const generateWebhooks = (orgId: string, count: number): API.Webhook[] => {
  const eventTypes = ['project.created', 'project.updated', 'step.completed', 'inspection.failed', 'rfi.answered'];
  return Array.from({ length: count }, () => ({
    id: generateId('webhook'),
    orgId,
    url: `https://${faker.internet.domainName()}/webhooks/${faker.string.alphanumeric(16)}`,
    events: randomElements(eventTypes, randomInt(1, 3)),
    secret: `whsec_${faker.string.alphanumeric(32)}`,
    active: Math.random() > 0.2,
    createdAt: randomPastDate(90),
    lastTriggeredAt: Math.random() > 0.4 ? randomPastDate(7) : undefined,
  }));
};

export const seedDatabase = () => {
  const orgs = generateOrganizations();
  const allProjects: API.Project[] = [];
  const allPhases: API.Phase[] = [];
  const allSteps: API.Step[] = [];
  const allDrawings: API.Drawing[] = [];
  const allDocuments: API.Document[] = [];
  const allRFIs: API.RFI[] = [];
  const allSubmittals: API.Submittal[] = [];
  const allBOMItems: API.BOMItem[] = [];
  const allDeliveries: API.Delivery[] = [];
  const allInventoryLots: API.InventoryLot[] = [];
  const allIssues: API.Issue[] = [];
  const allInspections: API.Inspection[] = [];
  const allAgents: API.Agent[] = [];
  const allAgentRuns: API.AgentRun[] = [];
  const allApiKeys: API.ApiKey[] = [];
  const allWebhooks: API.Webhook[] = [];

  orgs.forEach((org) => {
    const projects = generateProjects(org.id, randomInt(5, 8));
    allProjects.push(...projects);

    projects.forEach((project) => {
      const phases = generatePhases(project.id);
      allPhases.push(...phases);

      phases.forEach((phase) => {
        const stepCount = randomInt(8, 20);
        const steps = generateSteps(project.id, phase.id, stepCount);
        allSteps.push(...steps);
      });

      const stepIds = allSteps.filter((s) => s.projectId === project.id).map((s) => s.id);

      allDrawings.push(...generateDrawings(project.id, randomInt(30, 80)));
      allDocuments.push(...generateDocuments(project.id, randomInt(20, 50)));
      allRFIs.push(...generateRFIs(project.id, randomInt(10, 30)));
      allSubmittals.push(...generateSubmittals(project.id, randomInt(10, 30)));

      const bomItems = generateBOM(project.id, randomInt(100, 300));
      allBOMItems.push(...bomItems);
      allDeliveries.push(...generateDeliveries(project.id, bomItems, randomInt(15, 40)));
      allInventoryLots.push(...generateInventoryLots(project.id, bomItems, randomInt(50, 150)));

      allIssues.push(...generateIssues(project.id, stepIds, randomInt(10, 40)));
      allInspections.push(...generateInspections(project.id, stepIds, randomInt(8, 25)));

      const projectAgents = generateAgents(project.id, randomInt(1, 3));
      allAgents.push(...projectAgents);

      projectAgents.forEach((agent) => {
        allAgentRuns.push(...generateAgentRuns(agent.id, project.id, randomInt(5, 20)));
      });
    });

    allApiKeys.push(...generateApiKeys(org.id, randomInt(2, 5)));
    allWebhooks.push(...generateWebhooks(org.id, randomInt(1, 4)));
  });

  db = {
    organizations: orgs,
    projects: allProjects,
    phases: allPhases,
    steps: allSteps,
    files: [],
    drawings: allDrawings,
    documents: allDocuments,
    rfis: allRFIs,
    submittals: allSubmittals,
    bomItems: allBOMItems,
    deliveries: allDeliveries,
    inventoryLots: allInventoryLots,
    issues: allIssues,
    inspections: allInspections,
    agents: allAgents,
    agentRuns: allAgentRuns,
    apiKeys: allApiKeys,
    webhooks: allWebhooks,
  };
};

export const getDatabase = () => db;

export const resetDatabase = () => {
  seedDatabase();
};

export { generateId } from './seed';

seedDatabase();
