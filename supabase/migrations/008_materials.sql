-- =====================================================
-- Materials Management: BOM, Deliveries, and Inventory
-- =====================================================

-- BOM Items (Bill of Materials)
CREATE TABLE IF NOT EXISTS bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_number TEXT NOT NULL,
  description TEXT,
  spec_section TEXT,
  unit TEXT,
  planned_qty NUMERIC(18,3) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, item_number)
);

CREATE INDEX idx_bom_items_project ON bom_items(project_id, item_number);

-- Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vendor TEXT,
  packing_list_number TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  received_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliveries_project_date ON deliveries(project_id, received_at);

-- Delivery Items
CREATE TABLE IF NOT EXISTS delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  bom_item_id UUID REFERENCES bom_items(id) ON DELETE SET NULL,
  item_number TEXT,
  description TEXT,
  qty NUMERIC(18,3) NOT NULL,
  unit TEXT,
  activity TEXT,
  source_file_id UUID REFERENCES files(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_items_delivery ON delivery_items(delivery_id);

-- Inventory Lots
CREATE TABLE IF NOT EXISTS inventory_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  bom_item_id UUID REFERENCES bom_items(id) ON DELETE SET NULL,
  location TEXT,
  qty NUMERIC(18,3) NOT NULL DEFAULT 0,
  unit TEXT,
  last_counted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_lots_project_item ON inventory_lots(project_id, bom_item_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bom_items_updated_at BEFORE UPDATE ON bom_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_items_updated_at BEFORE UPDATE ON delivery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_lots_updated_at BEFORE UPDATE ON inventory_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security Policies
-- =====================================================

ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;

-- BOM Items Policies (commented out for testing - enable when RLS is ready)
-- SELECT: user must be member of org that owns the project
-- CREATE POLICY bom_items_select ON bom_items FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = bom_items.project_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- INSERT/UPDATE: user must be owner|admin|manager of org
-- CREATE POLICY bom_items_insert ON bom_items FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = bom_items.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- CREATE POLICY bom_items_update ON bom_items FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = bom_items.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- DELETE: user must be owner|admin
-- CREATE POLICY bom_items_delete ON bom_items FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = bom_items.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );

-- Deliveries Policies (same pattern)
-- CREATE POLICY deliveries_select ON deliveries FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = deliveries.project_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY deliveries_insert ON deliveries FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = deliveries.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- CREATE POLICY deliveries_update ON deliveries FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = deliveries.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- CREATE POLICY deliveries_delete ON deliveries FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = deliveries.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );

-- Delivery Items Policies
-- CREATE POLICY delivery_items_select ON delivery_items FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM deliveries d
--       JOIN projects p ON p.id = d.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE d.id = delivery_items.delivery_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY delivery_items_insert ON delivery_items FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM deliveries d
--       JOIN projects p ON p.id = d.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE d.id = delivery_items.delivery_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- CREATE POLICY delivery_items_update ON delivery_items FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM deliveries d
--       JOIN projects p ON p.id = d.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE d.id = delivery_items.delivery_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- CREATE POLICY delivery_items_delete ON delivery_items FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM deliveries d
--       JOIN projects p ON p.id = d.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE d.id = delivery_items.delivery_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );

-- Inventory Lots Policies
-- CREATE POLICY inventory_lots_select ON inventory_lots FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inventory_lots.project_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY inventory_lots_insert ON inventory_lots FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inventory_lots.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- CREATE POLICY inventory_lots_update ON inventory_lots FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inventory_lots.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager')
--     )
--   );

-- CREATE POLICY inventory_lots_delete ON inventory_lots FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inventory_lots.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );
