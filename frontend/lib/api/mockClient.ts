import { getDatabase, generateId } from '../mocks/db';
import { simulateLatency } from '../mocks/latency';
import { applySearch, applySort, applyDateRange, createPaginatedResponse, type FilterParams, type PaginatedResponse } from '../mocks/filters';
import type * as API from './types';

export const listProjects = async (orgId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Project>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let projects = db.projects.filter((p) => p.orgId === orgId);

    if (params.q) {
      projects = applySearch(projects, params.q, ['name', 'description', 'location']);
    }

    if (params.status) {
      projects = projects.filter((p) => p.status === params.status);
    }

    if (params.sortBy) {
      projects = applySort(projects, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(projects, params);
  });
};

export const getProject = async (id: string): Promise<API.Project> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const project = db.projects.find((p) => p.id === id);
    if (!project) throw new Error('Project not found');
    return project;
  });
};

export const createProject = async (orgId: string, data: Partial<API.Project>): Promise<API.Project> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const project: API.Project = {
      id: generateId('proj'),
      orgId,
      name: data.name || 'Untitled Project',
      description: data.description,
      status: data.status || 'planning',
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      spent: data.spent || 0,
      progress: data.progress || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.projects.push(project);
    return project;
  });
};

export const updateProject = async (id: string, data: Partial<API.Project>): Promise<API.Project> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');
    
    db.projects[index] = {
      ...db.projects[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.projects[index];
  });
};

export const archiveProject = async (id: string): Promise<void> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');
    db.projects[index].status = 'archived';
    db.projects[index].updatedAt = new Date();
  });
};

export const listPhases = async (projectId: string): Promise<API.Phase[]> => {
  return simulateLatency(() => {
    const db = getDatabase();
    return db.phases.filter((p) => p.projectId === projectId).sort((a, b) => a.order - b.order);
  });
};

export const createPhase = async (projectId: string, data: Partial<API.Phase>): Promise<API.Phase> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const existingPhases = db.phases.filter((p) => p.projectId === projectId);
    const maxOrder = existingPhases.length > 0 ? Math.max(...existingPhases.map((p) => p.order)) : -1;
    
    const phase: API.Phase = {
      id: generateId('phase'),
      projectId,
      name: data.name || 'Untitled Phase',
      description: data.description,
      status: data.status || 'not_started',
      order: data.order !== undefined ? data.order : maxOrder + 1,
      progress: data.progress || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.phases.push(phase);
    return phase;
  });
};

export const updatePhase = async (id: string, data: Partial<API.Phase>): Promise<API.Phase> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.phases.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Phase not found');
    
    db.phases[index] = {
      ...db.phases[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.phases[index];
  });
};

export const reorderPhases = async (projectId: string, phaseIds: string[]): Promise<void> => {
  return simulateLatency(() => {
    const db = getDatabase();
    phaseIds.forEach((phaseId, index) => {
      const phaseIndex = db.phases.findIndex((p) => p.id === phaseId && p.projectId === projectId);
      if (phaseIndex !== -1) {
        db.phases[phaseIndex].order = index;
        db.phases[phaseIndex].updatedAt = new Date();
      }
    });
  });
};

export const listSteps = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Step>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let steps = db.steps.filter((s) => s.projectId === projectId);

    if (params.phaseId) {
      steps = steps.filter((s) => s.phaseId === params.phaseId);
    }

    if (params.q) {
      steps = applySearch(steps, params.q, ['name', 'description', 'assignee']);
    }

    if (params.status) {
      steps = steps.filter((s) => s.status === params.status);
    }

    if (params.dateFrom || params.dateTo) {
      steps = applyDateRange(steps, 'dueDate', params.dateFrom, params.dateTo);
    }

    if (params.sortBy) {
      steps = applySort(steps, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(steps, params);
  });
};

export const getStep = async (id: string): Promise<API.Step> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const step = db.steps.find((s) => s.id === id);
    if (!step) throw new Error('Step not found');
    return step;
  });
};

export const createStep = async (projectId: string, phaseId: string, data: Partial<API.Step>): Promise<API.Step> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const step: API.Step = {
      id: generateId('step'),
      projectId,
      phaseId,
      name: data.name || 'Untitled Step',
      description: data.description,
      status: data.status || 'todo',
      assignee: data.assignee,
      dueDate: data.dueDate,
      checklist: data.checklist || [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.steps.push(step);
    return step;
  });
};

export const updateStep = async (id: string, data: Partial<API.Step>): Promise<API.Step> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.steps.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Step not found');
    
    db.steps[index] = {
      ...db.steps[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.steps[index];
  });
};

export const toggleCheckItem = async (stepId: string, checkItemId: string): Promise<API.Step> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.steps.findIndex((s) => s.id === stepId);
    if (index === -1) throw new Error('Step not found');
    
    const checklistIndex = db.steps[index].checklist.findIndex((c) => c.id === checkItemId);
    if (checklistIndex !== -1) {
      db.steps[index].checklist[checklistIndex].checked = !db.steps[index].checklist[checklistIndex].checked;
      db.steps[index].updatedAt = new Date();
    }
    return db.steps[index];
  });
};

export const listFiles = async (orgId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.File>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let files = db.files.filter((f) => f.orgId === orgId);

    if (params.projectId) {
      files = files.filter((f) => f.projectId === params.projectId);
    }

    if (params.q) {
      files = applySearch(files, params.q, ['name', 'type']);
    }

    if (params.sortBy) {
      files = applySort(files, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(files, params);
  });
};

export const getFile = async (id: string): Promise<API.File> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const file = db.files.find((f) => f.id === id);
    if (!file) throw new Error('File not found');
    return file;
  });
};

export const uploadFiles = async (orgId: string, projectId: string | undefined, files: Array<{ name: string; size: number; type: string }>): Promise<API.File[]> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const uploadedFiles = files.map((file) => ({
      id: generateId('file'),
      orgId,
      projectId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: `/files/${generateId('upload')}`,
      status: 'ready' as API.FileStatus,
      uploadedBy: 'Current User',
      uploadedAt: new Date(),
      tags: [],
    }));
    db.files.push(...uploadedFiles);
    return uploadedFiles;
  });
};

export const listDrawings = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Drawing>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let drawings = db.drawings.filter((d) => d.projectId === projectId);

    if (params.q) {
      drawings = applySearch(drawings, params.q, ['number', 'title', 'discipline']);
    }

    if (params.status) {
      drawings = drawings.filter((d) => d.status === params.status);
    }

    if (params.discipline) {
      drawings = drawings.filter((d) => d.discipline === params.discipline);
    }

    if (params.sortBy) {
      drawings = applySort(drawings, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(drawings, params);
  });
};

export const getDrawing = async (id: string): Promise<API.Drawing> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const drawing = db.drawings.find((d) => d.id === id);
    if (!drawing) throw new Error('Drawing not found');
    return drawing;
  });
};

export const createDrawing = async (projectId: string, data: Partial<API.Drawing>): Promise<API.Drawing> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const drawing: API.Drawing = {
      id: generateId('drawing'),
      projectId,
      number: data.number || `DWG-${Date.now()}`,
      title: data.title || 'Untitled Drawing',
      discipline: data.discipline || 'General',
      status: data.status || 'draft',
      currentVersion: 1,
      currentRevision: 'A',
      versions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.drawings.push(drawing);
    return drawing;
  });
};

export const addDrawingVersion = async (drawingId: string, fileId: string, fileName: string, notes?: string): Promise<API.Drawing> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.drawings.findIndex((d) => d.id === drawingId);
    if (index === -1) throw new Error('Drawing not found');
    
    const newVersion = db.drawings[index].currentVersion + 1;
    const revisions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const newRevision = revisions[newVersion - 1] || 'Z';
    
    const version: API.DrawingVersion = {
      id: generateId('version'),
      version: newVersion,
      revision: newRevision,
      fileId,
      fileName,
      uploadedBy: 'Current User',
      uploadedAt: new Date(),
      notes,
    };
    
    db.drawings[index].versions.push(version);
    db.drawings[index].currentVersion = newVersion;
    db.drawings[index].currentRevision = newRevision;
    db.drawings[index].updatedAt = new Date();
    
    return db.drawings[index];
  });
};

export const listDocuments = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Document>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let documents = db.documents.filter((d) => d.projectId === projectId);

    if (params.q) {
      documents = applySearch(documents, params.q, ['title', 'type']);
    }

    if (params.status) {
      documents = documents.filter((d) => d.status === params.status);
    }

    if (params.type) {
      documents = documents.filter((d) => d.type === params.type);
    }

    if (params.sortBy) {
      documents = applySort(documents, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(documents, params);
  });
};

export const getDocument = async (id: string): Promise<API.Document> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const document = db.documents.find((d) => d.id === id);
    if (!document) throw new Error('Document not found');
    return document;
  });
};

export const createDocument = async (projectId: string, data: Partial<API.Document>): Promise<API.Document> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const document: API.Document = {
      id: generateId('doc'),
      projectId,
      title: data.title || 'Untitled Document',
      type: data.type || 'General',
      status: data.status || 'draft',
      currentVersion: 1,
      versions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.documents.push(document);
    return document;
  });
};

export const addDocumentVersion = async (documentId: string, fileId: string, fileName: string, notes?: string): Promise<API.Document> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.documents.findIndex((d) => d.id === documentId);
    if (index === -1) throw new Error('Document not found');
    
    const newVersion = db.documents[index].currentVersion + 1;
    
    const version: API.DocumentVersion = {
      id: generateId('version'),
      version: newVersion,
      fileId,
      fileName,
      uploadedBy: 'Current User',
      uploadedAt: new Date(),
      notes,
    };
    
    db.documents[index].versions.push(version);
    db.documents[index].currentVersion = newVersion;
    db.documents[index].updatedAt = new Date();
    
    return db.documents[index];
  });
};

export const listRFIs = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.RFI>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let rfis = db.rfis.filter((r) => r.projectId === projectId);

    if (params.q) {
      rfis = applySearch(rfis, params.q, ['number', 'title', 'question']);
    }

    if (params.status) {
      rfis = rfis.filter((r) => r.status === params.status);
    }

    if (params.sortBy) {
      rfis = applySort(rfis, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(rfis, params);
  });
};

export const getRFI = async (id: string): Promise<API.RFI> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const rfi = db.rfis.find((r) => r.id === id);
    if (!rfi) throw new Error('RFI not found');
    return rfi;
  });
};

export const createRFI = async (projectId: string, data: Partial<API.RFI>): Promise<API.RFI> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const existingRFIs = db.rfis.filter((r) => r.projectId === projectId);
    const nextNumber = existingRFIs.length + 1;
    
    const rfi: API.RFI = {
      id: generateId('rfi'),
      projectId,
      number: data.number || `RFI-${String(nextNumber).padStart(3, '0')}`,
      title: data.title || 'Untitled RFI',
      question: data.question || '',
      answer: data.answer,
      status: data.status || 'open',
      askedBy: data.askedBy,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.rfis.push(rfi);
    return rfi;
  });
};

export const updateRFI = async (id: string, data: Partial<API.RFI>): Promise<API.RFI> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.rfis.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('RFI not found');
    
    db.rfis[index] = {
      ...db.rfis[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.rfis[index];
  });
};

export const listSubmittals = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Submittal>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let submittals = db.submittals.filter((s) => s.projectId === projectId);

    if (params.q) {
      submittals = applySearch(submittals, params.q, ['number', 'title', 'specSection']);
    }

    if (params.status) {
      submittals = submittals.filter((s) => s.status === params.status);
    }

    if (params.sortBy) {
      submittals = applySort(submittals, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(submittals, params);
  });
};

export const getSubmittal = async (id: string): Promise<API.Submittal> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const submittal = db.submittals.find((s) => s.id === id);
    if (!submittal) throw new Error('Submittal not found');
    return submittal;
  });
};

export const createSubmittal = async (projectId: string, data: Partial<API.Submittal>): Promise<API.Submittal> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const existingSubmittals = db.submittals.filter((s) => s.projectId === projectId);
    const nextNumber = existingSubmittals.length + 1;
    
    const submittal: API.Submittal = {
      id: generateId('submittal'),
      projectId,
      number: `SUB-${String(nextNumber).padStart(3, '0')}`,
      title: data.title || 'Untitled Submittal',
      specSection: data.specSection,
      status: data.status || 'draft',
      items: data.items || [],
      submittedBy: data.submittedBy || 'Current User',
      reviewerId: data.reviewerId,
      dueDate: data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.submittals.push(submittal);
    return submittal;
  });
};

export const updateSubmittal = async (id: string, data: Partial<API.Submittal>): Promise<API.Submittal> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.submittals.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Submittal not found');
    
    db.submittals[index] = {
      ...db.submittals[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.submittals[index];
  });
};

export const addRFIAttachment = async (rfiId: string, file: File): Promise<API.RFI> => {
  return simulateLatency(async () => {
    const db = getDatabase();
    const index = db.rfis.findIndex((r) => r.id === rfiId);
    if (index === -1) throw new Error('RFI not found');
    
    return db.rfis[index];
  });
};

export const addSubmittalItem = async (submittalId: string, data: Partial<API.SubmittalItem>): Promise<API.SubmittalItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.submittals.findIndex((s) => s.id === submittalId);
    if (index === -1) throw new Error('Submittal not found');
    
    const item: API.SubmittalItem = {
      id: generateId('item'),
      submittalId,
      description: data.description || '',
      qty: data.qty,
      unit: data.unit,
      manufacturer: data.manufacturer,
      model: data.model,
      status: data.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (!db.submittals[index].items) {
      db.submittals[index].items = [];
    }
    db.submittals[index].items!.push(item);
    db.submittals[index].updatedAt = new Date();
    
    return item;
  });
};

export const updateSubmittalItem = async (itemId: string, data: Partial<API.SubmittalItem>): Promise<API.SubmittalItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    
    for (const submittal of db.submittals) {
      if (submittal.items) {
        const itemIndex = submittal.items.findIndex((i) => i.id === itemId);
        if (itemIndex !== -1) {
          submittal.items[itemIndex] = {
            ...submittal.items[itemIndex],
            ...data,
            updatedAt: new Date(),
          };
          submittal.updatedAt = new Date();
          return submittal.items[itemIndex];
        }
      }
    }
    
    throw new Error('Submittal item not found');
  });
};

export const addSubmittalAttachment = async (submittalId: string, file: File): Promise<API.Submittal> => {
  return simulateLatency(async () => {
    const db = getDatabase();
    const index = db.submittals.findIndex((s) => s.id === submittalId);
    if (index === -1) throw new Error('Submittal not found');
    
    return db.submittals[index];
  });
};

export const listBOMItems = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.BOMItem>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let items = db.bomItems.filter((b) => b.projectId === projectId);

    if (params.q) {
      items = applySearch(items, params.q, ['itemNumber', 'description', 'specSection']);
    }

    if (params.sortBy) {
      items = applySort(items, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(items, params);
  });
};

export const getBOMItem = async (id: string): Promise<API.BOMItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const item = db.bomItems.find((b) => b.id === id);
    if (!item) throw new Error('BOM item not found');
    return item;
  });
};

export const createBOMItem = async (projectId: string, data: Partial<API.BOMItem>): Promise<API.BOMItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const item: API.BOMItem = {
      id: generateId('bom'),
      projectId,
      itemNumber: data.itemNumber || `ITEM-${db.bomItems.length + 1}`,
      description: data.description,
      specSection: data.specSection,
      unit: data.unit,
      plannedQty: data.plannedQty || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.bomItems.push(item);
    return item;
  });
};

export const updateBOMItem = async (id: string, data: Partial<API.BOMItem>): Promise<API.BOMItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.bomItems.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('BOM item not found');
    
    db.bomItems[index] = {
      ...db.bomItems[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.bomItems[index];
  });
};

export const listDeliveries = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Delivery>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let deliveries = db.deliveries.filter((d) => d.projectId === projectId);

    if (params.q) {
      deliveries = applySearch(deliveries, params.q, ['packingListNumber', 'vendor']);
    }

    if (params.sortBy) {
      deliveries = applySort(deliveries, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(deliveries, params);
  });
};

export const getDelivery = async (id: string): Promise<API.Delivery> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const delivery = db.deliveries.find((d) => d.id === id);
    if (!delivery) throw new Error('Delivery not found');
    return delivery;
  });
};

export const createDelivery = async (projectId: string, data: Partial<API.Delivery>): Promise<API.Delivery> => {
  return simulateLatency(() => {
    const db = getDatabase();
    
    const delivery: API.Delivery = {
      id: generateId('delivery'),
      projectId,
      vendor: data.vendor,
      packingListNumber: data.packingListNumber,
      receivedAt: data.receivedAt || new Date(),
      receivedBy: data.receivedBy || 'Current User',
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };
    db.deliveries.push(delivery);
    return delivery;
  });
};

export const addDeliveryItem = async (
  deliveryId: string,
  data: {
    itemNumber: string;
    description?: string;
    qty: number;
    unit?: string;
    activity?: string;
    bomItemId?: string;
    sourceFile?: File;
  }
): Promise<API.DeliveryItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const deliveryIndex = db.deliveries.findIndex((d) => d.id === deliveryId);
    if (deliveryIndex === -1) throw new Error('Delivery not found');

    const item: API.DeliveryItem = {
      id: generateId('delitem'),
      deliveryId,
      bomItemId: data.bomItemId,
      itemNumber: data.itemNumber,
      description: data.description,
      qty: data.qty,
      unit: data.unit,
      activity: data.activity,
      sourceFileId: data.sourceFile ? generateId('file') : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!db.deliveries[deliveryIndex].items) {
      db.deliveries[deliveryIndex].items = [];
    }
    db.deliveries[deliveryIndex].items!.push(item);

    if (data.bomItemId) {
      const lotIndex = db.inventoryLots.findIndex(
        (l) => l.bomItemId === data.bomItemId && l.location === 'default'
      );

      if (lotIndex !== -1) {
        db.inventoryLots[lotIndex].qty += data.qty;
        db.inventoryLots[lotIndex].lastCountedAt = new Date();
      } else {
        const bomItem = db.bomItems.find((b) => b.id === data.bomItemId);
        if (bomItem) {
          db.inventoryLots.push({
            id: generateId('lot'),
            projectId: bomItem.projectId,
            bomItemId: data.bomItemId,
            location: 'default',
            qty: data.qty,
            unit: data.unit,
            lastCountedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    return item;
  });
};

export const listInventoryLots = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.InventoryLot>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let lots = db.inventoryLots.filter((l) => l.projectId === projectId);

    if (params.location) {
      lots = lots.filter((l) => l.location === params.location);
    }

    if (params.bomItemId) {
      lots = lots.filter((l) => l.bomItemId === params.bomItemId);
    }

    if (params.q) {
      lots = applySearch(lots, params.q, ['location']);
    }

    if (params.sortBy) {
      lots = applySort(lots, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(lots, params);
  });
};

export const getInventoryLot = async (id: string): Promise<API.InventoryLot> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const lot = db.inventoryLots.find((l) => l.id === id);
    if (!lot) throw new Error('Inventory lot not found');
    return lot;
  });
};

export const updateInventoryLot = async (id: string, data: { qty?: number; lastCountedAt?: Date }): Promise<API.InventoryLot> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.inventoryLots.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Inventory lot not found');
    
    if (data.qty !== undefined) db.inventoryLots[index].qty = data.qty;
    if (data.lastCountedAt !== undefined) db.inventoryLots[index].lastCountedAt = data.lastCountedAt;
    db.inventoryLots[index].updatedAt = new Date();
    
    return db.inventoryLots[index];
  });
};

export const listIssues = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Issue>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let issues = db.issues.filter((i) => i.projectId === projectId);

    if (params.q) {
      issues = applySearch(issues, params.q, ['title', 'description']);
    }

    if (params.status) {
      issues = issues.filter((i) => i.status === params.status);
    }

    if (params.type) {
      issues = issues.filter((i) => i.type === params.type);
    }

    if (params.priority) {
      issues = issues.filter((i) => i.priority === params.priority);
    }

    if (params.stepId) {
      issues = issues.filter((i) => i.stepId === params.stepId);
    }

    if (params.sortBy) {
      issues = applySort(issues, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(issues, params);
  });
};

export const getIssue = async (id: string): Promise<API.Issue> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const issue = db.issues.find((i) => i.id === id);
    if (!issue) throw new Error('Issue not found');
    return issue;
  });
};

export const createIssue = async (projectId: string, data: Partial<API.Issue>): Promise<API.Issue> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const issue: API.Issue = {
      id: generateId('issue'),
      projectId,
      stepId: data.stepId,
      title: data.title || 'Untitled Issue',
      description: data.description,
      type: data.type || 'other',
      status: data.status || 'open',
      priority: data.priority || 3,
      dueDate: data.dueDate,
      assigneeId: data.assigneeId,
      createdBy: data.createdBy || 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
    };
    db.issues.push(issue);
    return issue;
  });
};

export const updateIssue = async (id: string, data: Partial<API.Issue>): Promise<API.Issue> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.issues.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Issue not found');
    
    db.issues[index] = {
      ...db.issues[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.issues[index];
  });
};

export const addIssueAttachment = async (issueId: string, file: File): Promise<API.Issue> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.issues.findIndex((i) => i.id === issueId);
    if (index === -1) throw new Error('Issue not found');
    
    const attachment: API.IssueAttachment = {
      id: generateId('attachment'),
      issueId,
      fileId: generateId('file'),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      createdAt: new Date(),
    };
    
    if (!db.issues[index].attachments) {
      db.issues[index].attachments = [];
    }
    db.issues[index].attachments!.push(attachment);
    db.issues[index].updatedAt = new Date();
    
    return db.issues[index];
  });
};

export const listInspections = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Inspection>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let inspections = db.inspections.filter((i) => i.projectId === projectId);

    if (params.q) {
      inspections = applySearch(inspections, params.q, ['name']);
    }

    if (params.status) {
      inspections = inspections.filter((i) => i.status === params.status);
    }

    if (params.sortBy) {
      inspections = applySort(inspections, params.sortBy, params.sortDir || 'asc');
    }

    return createPaginatedResponse(inspections, params);
  });
};

export const getInspection = async (id: string): Promise<API.Inspection> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const inspection = db.inspections.find((i) => i.id === id);
    if (!inspection) throw new Error('Inspection not found');
    return inspection;
  });
};

export const createInspection = async (projectId: string, data: Partial<API.Inspection>): Promise<API.Inspection> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const inspection: API.Inspection = {
      id: generateId('inspection'),
      projectId,
      name: data.name || 'Untitled Inspection',
      status: data.status || 'scheduled',
      scheduledAt: data.scheduledAt,
      performedAt: data.performedAt,
      performedBy: data.performedBy,
      meta: data.meta || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };
    db.inspections.push(inspection);
    return inspection;
  });
};

export const updateInspection = async (id: string, data: Partial<API.Inspection>): Promise<API.Inspection> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.inspections.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Inspection not found');
    
    db.inspections[index] = {
      ...db.inspections[index],
      ...data,
      updatedAt: new Date(),
    };
    return db.inspections[index];
  });
};

export const addInspectionItem = async (
  inspectionId: string,
  data: { label: string; orderIndex?: number }
): Promise<API.InspectionItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.inspections.findIndex((i) => i.id === inspectionId);
    if (index === -1) throw new Error('Inspection not found');

    const item: API.InspectionItem = {
      id: generateId('item'),
      inspectionId,
      label: data.label,
      result: 'n/a',
      notes: undefined,
      orderIndex: data.orderIndex || 0,
    };

    if (!db.inspections[index].items) {
      db.inspections[index].items = [];
    }
    db.inspections[index].items!.push(item);
    db.inspections[index].updatedAt = new Date();

    return item;
  });
};

export const updateInspectionItem = async (
  itemId: string,
  data: { result?: API.InspectionItemResult; notes?: string }
): Promise<API.InspectionItem> => {
  return simulateLatency(() => {
    const db = getDatabase();
    
    for (const inspection of db.inspections) {
      if (!inspection.items) continue;
      
      const itemIndex = inspection.items.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        if (data.result !== undefined) inspection.items[itemIndex].result = data.result;
        if (data.notes !== undefined) inspection.items[itemIndex].notes = data.notes;
        inspection.updatedAt = new Date();
        return inspection.items[itemIndex];
      }
    }
    
    throw new Error('Inspection item not found');
  });
};

// Tools
export const listTools = async (orgId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Tool>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let tools = db.tools.filter((t) => t.orgId === orgId);

    if (params.q) {
      tools = applySearch(tools, params.q, ['name', 'description']);
    }

    return createPaginatedResponse(tools, params);
  });
};

export const createTool = async (orgId: string, data: Partial<API.Tool>): Promise<API.Tool> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const tool: API.Tool = {
      id: generateId('tool'),
      orgId,
      name: data.name || 'Untitled Tool',
      version: data.version || '1.0.0',
      description: data.description,
      inputSchema: data.inputSchema || {},
      outputSchema: data.outputSchema,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
    };
    db.tools.push(tool);
    return tool;
  });
};

export const updateTool = async (toolId: string, data: Partial<API.Tool>): Promise<API.Tool> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.tools.findIndex((t) => t.id === toolId);
    if (index === -1) throw new Error('Tool not found');
    
    db.tools[index] = {
      ...db.tools[index],
      ...data,
    };
    return db.tools[index];
  });
};

// Agents
export const listAgents = async (params: { 
  orgId: string; 
  projectId?: string; 
  q?: string; 
  page?: number; 
  pageSize?: number 
}): Promise<PaginatedResponse<API.Agent>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let agents = db.agents.filter((a) => a.orgId === params.orgId);

    if (params.projectId) {
      agents = agents.filter((a) => a.projectId === params.projectId);
    }

    if (params.q) {
      agents = applySearch(agents, params.q, ['name', 'systemPrompt']);
    }

    return createPaginatedResponse(agents, { 
      page: params.page, 
      pageSize: params.pageSize 
    });
  });
};

export const getAgent = async (agentId: string): Promise<API.Agent> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const agent = db.agents.find((a) => a.id === agentId);
    if (!agent) throw new Error('Agent not found');
    return agent;
  });
};

export const createAgent = async (orgId: string, data: { 
  projectId?: string; 
  name: string; 
  model: string; 
  systemPrompt?: string; 
  temperature?: number; 
  toolPolicy?: API.ToolPolicy; 
  maxSteps?: number;
  toolIds?: string[];
}): Promise<API.Agent> => {
  return simulateLatency(() => {
    const db = getDatabase();
    
    const tools = data.toolIds 
      ? db.tools.filter((t) => data.toolIds!.includes(t.id))
      : [];

    const agent: API.Agent = {
      id: generateId('agent'),
      orgId,
      projectId: data.projectId,
      name: data.name,
      model: data.model,
      systemPrompt: data.systemPrompt,
      temperature: data.temperature || 0.2,
      toolPolicy: data.toolPolicy || 'balanced',
      maxSteps: data.maxSteps || 16,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      tools,
      toolCount: tools.length,
    };
    db.agents.push(agent);
    return agent;
  });
};

export const updateAgent = async (agentId: string, data: Partial<API.Agent> & { toolIds?: string[] }): Promise<API.Agent> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.agents.findIndex((a) => a.id === agentId);
    if (index === -1) throw new Error('Agent not found');
    
    let tools = db.agents[index].tools;
    if (data.toolIds) {
      tools = db.tools.filter((t) => data.toolIds!.includes(t.id));
    }

    db.agents[index] = {
      ...db.agents[index],
      ...data,
      tools,
      toolCount: tools?.length || 0,
      updatedAt: new Date(),
    };
    return db.agents[index];
  });
};

// Agent Runs
export const listAgentRuns = async (params: { 
  orgId: string;
  agentId?: string; 
  projectId?: string; 
  status?: API.AgentRunStatus;
  page?: number; 
  pageSize?: number;
}): Promise<PaginatedResponse<API.AgentRun>> => {
  return simulateLatency(() => {
    const db = getDatabase();
    let runs = db.agentRuns;

    // Filter by org through agent
    runs = runs.filter((r) => {
      const agent = db.agents.find((a) => a.id === r.agentId);
      return agent && agent.orgId === params.orgId;
    });

    if (params.agentId) {
      runs = runs.filter((r) => r.agentId === params.agentId);
    }

    if (params.projectId) {
      runs = runs.filter((r) => r.projectId === params.projectId);
    }

    if (params.status) {
      runs = runs.filter((r) => r.status === params.status);
    }

    return createPaginatedResponse(runs, {
      page: params.page,
      pageSize: params.pageSize,
    });
  });
};

export const getAgentRun = async (runId: string): Promise<API.AgentRun> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const run = db.agentRuns.find((r) => r.id === runId);
    if (!run) throw new Error('Run not found');
    return run;
  });
};

export const startAgentRun = async (agentId: string, input: string, projectId?: string): Promise<API.AgentRun> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const agent = db.agents.find((a) => a.id === agentId);
    
    const run: API.AgentRun = {
      id: generateId('run'),
      agentId,
      projectId,
      startedBy: 'Current User',
      trigger: 'ui',
      input,
      status: 'running',
      startedAt: new Date(),
      createdAt: new Date(),
      agentName: agent?.name,
      messages: [
        {
          id: generateId('msg'),
          runId: generateId('run'),
          role: 'user',
          content: input,
          seq: 0,
          createdAt: new Date(),
        },
      ],
      toolCalls: [],
    };
    db.agentRuns.push(run);
    
    // Simulate async completion
    setTimeout(() => {
      const index = db.agentRuns.findIndex((r) => r.id === run.id);
      if (index !== -1) {
        db.agentRuns[index].status = 'succeeded';
        db.agentRuns[index].finishedAt = new Date();
        db.agentRuns[index].latencyMs = 3000;
        db.agentRuns[index].resultSummary = 'Agent task completed successfully';
        db.agentRuns[index].messages?.push({
          id: generateId('msg'),
          runId: run.id,
          role: 'assistant',
          content: 'Task completed successfully',
          seq: 1,
          createdAt: new Date(),
        });
      }
    }, 3000);
    
    return run;
  });
};

export const cancelAgentRun = async (runId: string): Promise<API.AgentRun> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.agentRuns.findIndex((r) => r.id === runId);
    if (index === -1) throw new Error('Run not found');
    
    if (db.agentRuns[index].status === 'running') {
      db.agentRuns[index].status = 'cancelled';
      db.agentRuns[index].finishedAt = new Date();
    }
    
    return db.agentRuns[index];
  });
};

export const listApiKeys = async (orgId: string): Promise<API.ApiKey[]> => {
  return simulateLatency(() => {
    const db = getDatabase();
    return db.apiKeys.filter((k) => k.orgId === orgId);
  });
};

export const createApiKey = async (orgId: string, name: string): Promise<API.ApiKey> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const apiKey: API.ApiKey = {
      id: generateId('key'),
      orgId,
      name,
      keyPrefix: `vb_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date(),
      lastUsedAt: undefined,
      expiresAt: undefined,
    };
    db.apiKeys.push(apiKey);
    return apiKey;
  });
};

export const deleteApiKey = async (id: string): Promise<void> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.apiKeys.findIndex((k) => k.id === id);
    if (index === -1) throw new Error('API Key not found');
    db.apiKeys.splice(index, 1);
  });
};

export const listWebhooks = async (orgId: string): Promise<API.Webhook[]> => {
  return simulateLatency(() => {
    const db = getDatabase();
    return db.webhooks.filter((w) => w.orgId === orgId);
  });
};

export const createWebhook = async (orgId: string, data: Partial<API.Webhook>): Promise<API.Webhook> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const webhook: API.Webhook = {
      id: generateId('webhook'),
      orgId,
      url: data.url || '',
      events: data.events || [],
      secret: `whsec_${Math.random().toString(36).slice(2, 34)}`,
      active: data.active !== undefined ? data.active : true,
      createdAt: new Date(),
      lastTriggeredAt: undefined,
    };
    db.webhooks.push(webhook);
    return webhook;
  });
};

export const updateWebhook = async (id: string, data: Partial<API.Webhook>): Promise<API.Webhook> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.webhooks.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('Webhook not found');
    
    db.webhooks[index] = {
      ...db.webhooks[index],
      ...data,
    };
    return db.webhooks[index];
  });
};

export const deleteWebhook = async (id: string): Promise<void> => {
  return simulateLatency(() => {
    const db = getDatabase();
    const index = db.webhooks.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('Webhook not found');
    db.webhooks.splice(index, 1);
  });
};

// File signed URL helpers (mock)
export const getFileSignedUrl = async (fileId: string, expiresIn: number = 3600): Promise<string> => {
  return simulateLatency(() => {
    // In mock mode, return a placeholder URL
    return `https://mock-storage.example.com/files/${fileId}?expires=${expiresIn}`;
  });
};

export const getDrawingVersionFileUrl = async (versionId: string, expiresIn: number = 3600): Promise<string> => {
  return simulateLatency(() => {
    // In mock mode, return a sample PDF URL for testing
    return `https://pdfobject.com/pdf/sample.pdf`;
  });
};
