-- Seed script for demo data
-- Run this in Supabase SQL Editor after authenticating as a user

-- This script creates demo data for the currently authenticated user's first organization
-- Replace the user_id and org_id values or run after logging in

DO $$
DECLARE
  demo_user_id UUID;
  demo_org_id UUID;
  demo_project_id UUID;
  phase1_id UUID;
  phase2_id UUID;
  phase3_id UUID;
  phase4_id UUID;
  step_id UUID;
BEGIN
  -- Get the current user's ID
  demo_user_id := auth.uid();
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user. Please log in first.';
  END IF;

  -- Get the user's first organization
  SELECT org_id INTO demo_org_id
  FROM org_members
  WHERE user_id = demo_user_id
  LIMIT 1;

  IF demo_org_id IS NULL THEN
    RAISE EXCEPTION 'User has no organizations. Please create an organization first.';
  END IF;

  RAISE NOTICE 'Creating demo data for user % in org %', demo_user_id, demo_org_id;

  -- Create a demo project
  INSERT INTO projects (org_id, name, description, status, location, budget, progress)
  VALUES (
    demo_org_id,
    'Demo Site A',
    'Sample construction project with phases, steps, and checkitems',
    'active',
    'Downtown Construction Zone',
    5000000,
    35
  )
  RETURNING id INTO demo_project_id;

  RAISE NOTICE 'Created project: %', demo_project_id;

  -- Create 4 phases
  INSERT INTO phases (project_id, name, description, status, sequence, progress)
  VALUES 
    (demo_project_id, 'Planning & Permitting', 'Initial planning and permit acquisition', 'done', 0, 100),
    (demo_project_id, 'Foundation & Structure', 'Foundation work and structural framing', 'in_progress', 1, 65),
    (demo_project_id, 'MEP Installation', 'Mechanical, Electrical, and Plumbing systems', 'not_started', 2, 0),
    (demo_project_id, 'Finishing & Closeout', 'Interior finishing and project closeout', 'not_started', 3, 0)
  RETURNING id INTO phase1_id;

  SELECT id INTO phase2_id FROM phases WHERE project_id = demo_project_id AND sequence = 1;
  SELECT id INTO phase3_id FROM phases WHERE project_id = demo_project_id AND sequence = 2;
  SELECT id INTO phase4_id FROM phases WHERE project_id = demo_project_id AND sequence = 3;

  RAISE NOTICE 'Created 4 phases';

  -- Create steps for Phase 1 (Planning & Permitting) - All done
  INSERT INTO steps (phase_id, title, description, status, priority, order_index)
  VALUES 
    (phase1_id, 'Submit permit application', 'File all required permits with city', 'done', 'high', 0),
    (phase1_id, 'Site survey and measurements', 'Complete topographical survey', 'done', 'medium', 1),
    (phase1_id, 'Finalize architectural plans', 'Review and approve final drawings', 'done', 'high', 2);

  -- Create steps for Phase 2 (Foundation & Structure) - Mixed statuses
  INSERT INTO steps (phase_id, title, description, status, priority, order_index, assignee_id)
  VALUES 
    (phase2_id, 'Excavation and grading', 'Prepare site and excavate for foundation', 'done', 'high', 0, demo_user_id),
    (phase2_id, 'Pour foundation concrete', 'Foundation slab and footings', 'done', 'critical', 1, demo_user_id),
    (phase2_id, 'Install steel framing', 'Erect structural steel framework', 'in_progress', 'high', 2, demo_user_id)
  RETURNING id INTO step_id;

  -- Add checkitems to current in-progress step
  INSERT INTO step_checkitems (step_id, label, is_done, order_index)
  VALUES 
    (step_id, 'Inspect steel delivery', true, 0),
    (step_id, 'Set up crane and rigging', true, 1),
    (step_id, 'Install first floor beams', true, 2),
    (step_id, 'Install second floor beams', false, 3),
    (step_id, 'Final welding and connections', false, 4);

  INSERT INTO steps (phase_id, title, description, status, priority, order_index, assignee_id)
  VALUES 
    (phase2_id, 'Frame exterior walls', 'Install wall framing and sheathing', 'todo', 'medium', 3, demo_user_id),
    (phase2_id, 'Install roof structure', 'Roof trusses and decking', 'todo', 'medium', 4, NULL);

  -- Create steps for Phase 3 (MEP Installation)
  INSERT INTO steps (phase_id, title, description, status, priority, order_index)
  VALUES 
    (phase3_id, 'Rough-in plumbing', 'Install water supply and drain lines', 'todo', 'medium', 0),
    (phase3_id, 'Rough-in electrical', 'Pull wiring and install boxes', 'todo', 'medium', 1),
    (phase3_id, 'HVAC ductwork installation', 'Install heating and cooling ducts', 'todo', 'medium', 2);

  -- Create steps for Phase 4 (Finishing & Closeout)
  INSERT INTO steps (phase_id, title, description, status, priority, order_index)
  VALUES 
    (phase4_id, 'Drywall and painting', 'Hang, tape, and paint drywall', 'todo', 'low', 0),
    (phase4_id, 'Final inspections', 'Schedule and pass all final inspections', 'todo', 'critical', 1);

  RAISE NOTICE 'Created 12 steps with check items';
  RAISE NOTICE 'Demo data creation complete!';
  RAISE NOTICE 'Project ID: %', demo_project_id;

END $$;
