-- Temporarily disable RLS for materials tables during testing
-- Re-enable when authentication and user_orgs are properly set up

ALTER TABLE bom_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots DISABLE ROW LEVEL SECURITY;
