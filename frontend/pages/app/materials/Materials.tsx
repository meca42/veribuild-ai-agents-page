import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Package, Truck, Warehouse, Plus, Search, Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type * as API from "@/lib/api/types";

export default function Materials() {
  const { id: projectId } = useParams<{ id: string }>();
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projectId || localStorage.getItem('selectedProjectId') || '';
  });

  const [activeTab, setActiveTab] = useState("bom");

  const [bomItems, setBomItems] = useState<API.BOMItem[]>([]);
  const [deliveries, setDeliveries] = useState<API.Delivery[]>([]);
  const [inventoryLots, setInventoryLots] = useState<API.InventoryLot[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isNewBOMModalOpen, setIsNewBOMModalOpen] = useState(false);
  const [isNewDeliveryModalOpen, setIsNewDeliveryModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<API.Delivery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    } else {
      const storedProjectId = localStorage.getItem('selectedProjectId');
      if (storedProjectId) {
        setSelectedProjectId(storedProjectId);
      }
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedProjectId) {
      loadData();
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    try {
      const [bomResult, deliveriesResult, inventoryResult] = await Promise.all([
        api.listBOMItems(selectedProjectId),
        api.listDeliveries(selectedProjectId),
        api.listInventoryLots(selectedProjectId),
      ]);
      
      setBomItems(bomResult.data);
      setDeliveries(deliveriesResult.data);
      setInventoryLots(inventoryResult.data);
    } catch (err: any) {
      console.error('Failed to load materials data:', err);
      addToast(err.message || 'Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBOMItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      itemNumber: formData.get('itemNumber') as string,
      description: formData.get('description') as string || undefined,
      specSection: formData.get('specSection') as string || undefined,
      unit: formData.get('unit') as string || undefined,
      plannedQty: parseFloat(formData.get('plannedQty') as string) || 0,
    };

    setIsSubmitting(true);
    try {
      const newItem = await api.createBOMItem(selectedProjectId, data);
      setBomItems(prev => [newItem, ...prev]);
      setIsNewBOMModalOpen(false);
      addToast('BOM item created', 'success');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Failed to create BOM item:', err);
      addToast(err.message || 'Failed to create BOM item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDelivery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      vendor: formData.get('vendor') as string || undefined,
      packingListNumber: formData.get('packingListNumber') as string || undefined,
      receivedAt: formData.get('receivedAt') ? new Date(formData.get('receivedAt') as string) : new Date(),
      notes: formData.get('notes') as string || undefined,
    };

    setIsSubmitting(true);
    try {
      const newDelivery = await api.createDelivery(selectedProjectId, data);
      setDeliveries(prev => [newDelivery, ...prev]);
      setSelectedDelivery(newDelivery);
      setIsNewDeliveryModalOpen(false);
      addToast('Delivery created', 'success');
    } catch (err: any) {
      console.error('Failed to create delivery:', err);
      addToast(err.message || 'Failed to create delivery', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDeliveryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDelivery) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      itemNumber: formData.get('itemNumber') as string,
      description: formData.get('description') as string || undefined,
      qty: parseFloat(formData.get('qty') as string),
      unit: formData.get('unit') as string || undefined,
      activity: formData.get('activity') as string || undefined,
      bomItemId: formData.get('bomItemId') as string || undefined,
    };

    try {
      await api.addDeliveryItem(selectedDelivery.id, data);
      await loadData();
      addToast('Delivery item added', 'success');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Failed to add delivery item:', err);
      addToast(err.message || 'Failed to add delivery item', 'error');
    }
  };

  const handleUpdateInventory = async (lotId: string, qty: number) => {
    try {
      await api.updateInventoryLot(lotId, { qty, lastCountedAt: new Date() });
      await loadData();
      addToast('Inventory updated', 'success');
    } catch (err: any) {
      console.error('Failed to update inventory:', err);
      addToast(err.message || 'Failed to update inventory', 'error');
    }
  };

  const filteredBOMItems = bomItems.filter((item) =>
    item.itemNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.packingListNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventoryLots = inventoryLots.filter((lot) => {
    const bomItem = bomItems.find((b) => b.id === lot.bomItemId);
    return (
      lot.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bomItem?.itemNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bomItem?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Bill of materials, deliveries, and inventory tracking"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              if (activeTab === "bom") setIsNewBOMModalOpen(true);
              if (activeTab === "deliveries") setIsNewDeliveryModalOpen(true);
            }}
          >
            <Plus size={20} />
            {activeTab === "bom" && "New BOM Item"}
            {activeTab === "deliveries" && "New Delivery"}
            {activeTab === "inventory" && "Adjust Inventory"}
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="bom">
              <Package size={16} className="mr-2" />
              BOM Items
            </TabsTrigger>
            <TabsTrigger value="deliveries">
              <Truck size={16} className="mr-2" />
              Deliveries
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Warehouse size={16} className="mr-2" />
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bom" className="mt-6">
            {filteredBOMItems.length > 0 ? (
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Item Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Spec Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Planned Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredBOMItems.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-neutral-900">{item.itemNumber}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{item.description || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{item.specSection || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{item.plannedQty}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{item.unit || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No BOM items"
                description="Create bill of materials items to track planned quantities."
                actionLabel="New BOM Item"
                onAction={() => setIsNewBOMModalOpen(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="deliveries" className="mt-6">
            {filteredDeliveries.length > 0 ? (
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Date Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Packing List #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Items Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-neutral-900">
                          {new Date(delivery.receivedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{delivery.vendor || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm font-mono text-neutral-600">
                          {delivery.packingListNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {delivery.items?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedDelivery(delivery)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Truck}
                title="No deliveries"
                description="Log material deliveries to track what arrives on site."
                actionLabel="New Delivery"
                onAction={() => setIsNewDeliveryModalOpen(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            {filteredInventoryLots.length > 0 ? (
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Item Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Last Counted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredInventoryLots.map((lot) => {
                      const bomItem = bomItems.find((b) => b.id === lot.bomItemId);
                      return (
                        <tr key={lot.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-neutral-900">
                            {bomItem?.itemNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">
                            {bomItem?.description || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">{lot.location || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-neutral-900">
                            {lot.qty} {lot.unit || ''}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {new Date(lot.lastCountedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Warehouse}
                title="No inventory lots"
                description="Inventory is automatically updated when delivery items are logged."
                actionLabel="Log Delivery"
                onAction={() => {
                  setActiveTab('deliveries');
                  setIsNewDeliveryModalOpen(true);
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Modal
        isOpen={isNewBOMModalOpen}
        onClose={() => setIsNewBOMModalOpen(false)}
        title="New BOM Item"
      >
        <form onSubmit={handleCreateBOMItem} className="space-y-4">
          <div>
            <label htmlFor="itemNumber" className="block text-sm font-medium text-neutral-700 mb-1">
              Item Number *
            </label>
            <Input
              id="itemNumber"
              name="itemNumber"
              type="text"
              required
              placeholder="e.g., ITEM-0001"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Item description"
            />
          </div>

          <div>
            <label htmlFor="specSection" className="block text-sm font-medium text-neutral-700 mb-1">
              Spec Section
            </label>
            <Input
              id="specSection"
              name="specSection"
              type="text"
              placeholder="e.g., 03 30 00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plannedQty" className="block text-sm font-medium text-neutral-700 mb-1">
                Planned Qty *
              </label>
              <Input
                id="plannedQty"
                name="plannedQty"
                type="number"
                step="0.001"
                required
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-neutral-700 mb-1">
                Unit
              </label>
              <Input
                id="unit"
                name="unit"
                type="text"
                placeholder="EA, SF, LF, etc."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewBOMModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isNewDeliveryModalOpen}
        onClose={() => setIsNewDeliveryModalOpen(false)}
        title="New Delivery"
      >
        <form onSubmit={handleCreateDelivery} className="space-y-4">
          <div>
            <label htmlFor="vendor" className="block text-sm font-medium text-neutral-700 mb-1">
              Vendor
            </label>
            <Input
              id="vendor"
              name="vendor"
              type="text"
              placeholder="Vendor name"
            />
          </div>

          <div>
            <label htmlFor="packingListNumber" className="block text-sm font-medium text-neutral-700 mb-1">
              Packing List Number
            </label>
            <Input
              id="packingListNumber"
              name="packingListNumber"
              type="text"
              placeholder="Packing list or tracking number"
            />
          </div>

          <div>
            <label htmlFor="receivedAt" className="block text-sm font-medium text-neutral-700 mb-1">
              Received Date
            </label>
            <Input
              id="receivedAt"
              name="receivedAt"
              type="date"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewDeliveryModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Delivery'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={selectedDelivery !== null}
        onClose={() => setSelectedDelivery(null)}
        title={`Delivery - ${selectedDelivery?.packingListNumber || 'Details'}`}
        size="xl"
      >
        {selectedDelivery && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delivery Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Vendor:</span>{' '}
                  <span className="text-neutral-900">{selectedDelivery.vendor || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Received:</span>{' '}
                  <span className="text-neutral-900">
                    {new Date(selectedDelivery.receivedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-600">Notes:</span>{' '}
                  <span className="text-neutral-900">{selectedDelivery.notes || 'None'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-3">Items</h4>
              {selectedDelivery.items && selectedDelivery.items.length > 0 ? (
                <div className="border border-neutral-200 rounded-lg overflow-hidden mb-4">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Item #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Activity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {selectedDelivery.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm font-mono text-neutral-900">{item.itemNumber}</td>
                          <td className="px-4 py-2 text-sm text-neutral-600">{item.description || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-neutral-900">
                            {item.qty} {item.unit || ''}
                          </td>
                          <td className="px-4 py-2 text-sm text-neutral-600">{item.activity || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-neutral-500 mb-4">No items added yet</p>
              )}

              <form onSubmit={handleAddDeliveryItem} className="bg-neutral-50 p-4 rounded-lg space-y-3">
                <h5 className="text-sm font-medium text-neutral-700">Add Item to Delivery</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      name="itemNumber"
                      type="text"
                      placeholder="Item Number *"
                      required
                    />
                  </div>
                  <div>
                    <select
                      name="bomItemId"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Link to BOM Item (optional)</option>
                      {bomItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.itemNumber} - {item.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      name="description"
                      type="text"
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <Input
                      name="qty"
                      type="number"
                      step="0.001"
                      placeholder="Quantity *"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="unit"
                      type="text"
                      placeholder="Unit (EA, SF, etc.)"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      name="activity"
                      type="text"
                      placeholder="Activity"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" size="sm">
                    <Plus size={16} />
                    Add Item
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
