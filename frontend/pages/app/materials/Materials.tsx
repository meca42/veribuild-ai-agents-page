import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useMaterials, useDeliveries } from "@/lib/mocks/materials";

const statusColors = {
  ordered: "bg-blue-100 text-blue-800",
  "in-transit": "bg-yellow-100 text-yellow-800",
  received: "bg-green-100 text-green-800",
  installed: "bg-gray-100 text-gray-800",
};

const conditionColors = {
  good: "bg-green-100 text-green-800",
  damaged: "bg-red-100 text-red-800",
  missing: "bg-gray-100 text-gray-800",
};

export default function Materials() {
  const { data: materials, isLoading: materialsLoading } = useMaterials();
  const { data: deliveries, isLoading: deliveriesLoading } = useDeliveries();
  const [activeTab, setActiveTab] = useState("bom");

  if (materialsLoading || deliveriesLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-[var(--vb-neutral-600)]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Bill of materials, deliveries, and inventory tracking"
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Plus size={20} className="mr-2" />
            {activeTab === "bom" && "Add Material"}
            {activeTab === "deliveries" && "Log Delivery"}
            {activeTab === "inventory" && "Update Inventory"}
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="bom" className="mt-6">
            {materials && materials.length > 0 ? (
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Material
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {materials.map((material) => (
                      <tr key={material.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                          {material.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-neutral-600">
                          {material.partNumber || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900">
                          {material.quantity.toLocaleString()} {material.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {material.location || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={statusColors[material.status]}>
                            {material.status.replace("-", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No materials found"
                description="Add materials to your bill of materials to track quantities and deliveries."
                actionLabel="Add Material"
                onAction={() => {}}
              />
            )}
          </TabsContent>

          <TabsContent value="deliveries" className="mt-6">
            {deliveries && deliveries.length > 0 ? (
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="bg-white rounded-lg border border-neutral-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {delivery.deliveryNumber}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          Delivered on {new Date(delivery.deliveredAt).toLocaleDateString()} by{" "}
                          {delivery.receivedBy}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {delivery.items.map((item, idx) => {
                        const material = materials?.find((m) => m.id === item.materialId);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-t border-neutral-100"
                          >
                            <div className="flex-1">
                              <span className="text-sm font-medium text-neutral-900">
                                {material?.name || "Unknown Material"}
                              </span>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="text-sm text-neutral-600">
                                {item.quantity.toLocaleString()} {material?.unit}
                              </span>
                              <Badge className={conditionColors[item.condition]}>
                                {item.condition}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {delivery.notes && (
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <p className="text-sm text-neutral-600">{delivery.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No deliveries logged"
                description="Log material deliveries to track what's been received on site."
                actionLabel="Log Delivery"
                onAction={() => {}}
              />
            )}
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            {materials && materials.length > 0 ? (
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Material
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        On Hand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {materials
                      .filter((m) => m.status === "received" || m.status === "installed")
                      .map((material) => (
                        <tr key={material.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                            {material.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">
                            {material.quantity.toLocaleString()} {material.unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {material.location || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={statusColors[material.status]}>
                              {material.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No inventory on hand"
                description="Materials will appear here once they've been received on site."
                actionLabel="Log Delivery"
                onAction={() => setActiveTab("deliveries")}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
