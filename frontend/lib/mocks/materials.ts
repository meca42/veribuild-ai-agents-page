import { Material, Delivery } from "../types";

export const mockMaterials: Material[] = [
  {
    id: "m1",
    name: "Insulated Metal Wall Panels",
    partNumber: "IMP-26GA-R19",
    quantity: 4500,
    unit: "SF",
    location: "Zone A - North Wall",
    status: "installed",
    projectId: "1",
    createdAt: "2025-08-01T10:00:00Z",
  },
  {
    id: "m2",
    name: "TPO Roofing Membrane - 60 mil",
    partNumber: "TPO-60-WHITE",
    quantity: 12000,
    unit: "SF",
    location: "Staging Area B",
    status: "received",
    projectId: "1",
    createdAt: "2025-09-15T14:00:00Z",
  },
  {
    id: "m3",
    name: "Curtain Wall Glazing - Low-E",
    partNumber: "CW-LOWE-1IN",
    quantity: 850,
    unit: "SF",
    location: "Warehouse",
    status: "in-transit",
    projectId: "1",
    createdAt: "2025-09-25T09:00:00Z",
  },
  {
    id: "m4",
    name: "Structural Steel W12x26",
    partNumber: "STL-W12X26",
    quantity: 2400,
    unit: "LF",
    status: "ordered",
    projectId: "1",
    createdAt: "2025-10-01T11:00:00Z",
  },
];

export const mockDeliveries: Delivery[] = [
  {
    id: "del1",
    deliveryNumber: "DEL-2025-089",
    items: [
      { materialId: "m1", quantity: 2000, condition: "good" },
    ],
    deliveredAt: "2025-09-01T08:30:00Z",
    receivedBy: "Mike Johnson",
    projectId: "1",
    notes: "First shipment of wall panels. All in good condition.",
  },
  {
    id: "del2",
    deliveryNumber: "DEL-2025-103",
    items: [
      { materialId: "m2", quantity: 12000, condition: "good" },
    ],
    deliveredAt: "2025-09-20T10:15:00Z",
    receivedBy: "Sarah Chen",
    projectId: "1",
    notes: "Roofing membrane rolls delivered. Stored in covered area.",
  },
  {
    id: "del3",
    deliveryNumber: "DEL-2025-115",
    items: [
      { materialId: "m1", quantity: 2500, condition: "good" },
    ],
    deliveredAt: "2025-09-28T14:00:00Z",
    receivedBy: "Tom Rodriguez",
    projectId: "1",
  },
];

export function useMaterials() {
  return {
    data: mockMaterials,
    isLoading: false,
    error: null,
  };
}

export function useDeliveries() {
  return {
    data: mockDeliveries,
    isLoading: false,
    error: null,
  };
}
