# Supabase Live CRUD Setup Guide

## Overview
This guide walks through enabling live CRUD for Projects → Phases → Steps (with checklists) and Files using Supabase.

## Prerequisites
- Supabase project created
- Environment variables configured in `.env.local`:
  ```bash
  VITE_SUPABASE_URL=https://lalmleaetmmqsyzvvdzi.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  VITE_USE_MOCK_API=false
  ```

## Step 1: Apply Database Migrations

Run these migrations in Supabase Dashboard → SQL Editor in order:

### 1. Core Schema (if not already applied)
```sql
-- Run: supabase/migrations/001_initial_schema.sql
-- Creates: users, orgs, org_members, projects, RLS policies
```

### 2. Project Entities (if not already applied)
```sql
-- Run: supabase/migrations/002_project_entities.sql  
-- Creates: Additional project-related tables
```

### 3. Core Workflow Tables (NEW)
```sql
-- Run: supabase/migrations/003_core_workflow.sql
-- Creates:
--   - phases (linked to projects)
--   - steps (linked to phases)
--   - step_checkitems (linked to steps)
--   - files (with org_id and project_id)
-- Includes: RLS policies, indexes, helper functions
```

### 4. Storage Buckets (NEW)
```sql
-- Run: supabase/migrations/004_storage_buckets.sql
-- Creates buckets: drawings, documents, receipts, artifacts
-- Includes: RLS policies for org-based access control
```

## Step 2: Seed Demo Data (Optional)

To create sample data for testing:

1. Log in to your app with a user account
2. Create an organization if you haven't already
3. In Supabase Dashboard → SQL Editor, run:
   ```sql
   -- Run: supabase/seeds/001_demo_project.sql
   -- Creates: 1 project, 4 phases, ~12 steps with mixed statuses
   ```

This creates:
- **Project**: "Demo Site A" (active, 35% complete)
- **Phase 1**: Planning & Permitting (done, 100%)
- **Phase 2**: Foundation & Structure (in_progress, 65%)
  - Includes a step with 5 check items (3 done, 2 pending)
- **Phase 3**: MEP Installation (not_started, 0%)
- **Phase 4**: Finishing & Closeout (not_started, 0%)

## Step 3: Enable Supabase Mode

Update `.env.local`:
```bash
VITE_USE_MOCK_API=false
```

The app will automatically use Supabase instead of mock data.

## Step 4: Test the Workflow

### ✅ Acceptance Checklist

1. **Projects CRUD**
   - [ ] Navigate to `/projects` - see live data
   - [ ] Create a new project
   - [ ] Edit project details
   - [ ] Archive a project
   - [ ] Verify changes persist on refresh

2. **Phases Management**
   - [ ] Navigate to `/projects/:id/phases`
   - [ ] See phases listed in sequence order
   - [ ] Create a new phase
   - [ ] Drag to reorder phases (sequence persists)
   - [ ] Update phase status and progress

3. **Steps Management**
   - [ ] Navigate to `/projects/:id/steps`
   - [ ] Filter by phase, status, search
   - [ ] Create a new step
   - [ ] Edit step details (title, description, assignee, due date)
   - [ ] Toggle checklist items
   - [ ] Verify checklist state persists

4. **Files Upload**
   - [ ] Navigate to `/files`
   - [ ] Upload a file
   - [ ] File appears in list with correct metadata
   - [ ] File is accessible via signed URL
   - [ ] Files are scoped to organization

5. **RLS Verification**
   - [ ] Create a second user account
   - [ ] Second user creates their own org
   - [ ] Second user cannot see first user's projects/data
   - [ ] Invite second user to first user's org
   - [ ] Second user can now see shared org data

## Database Schema

### Tables Created

**phases**
- Links to `projects.id` via `project_id`
- Ordered by `sequence` field
- Statuses: not_started, in_progress, blocked, done
- Tracks planned vs actual dates

**steps**
- Links to `phases.id` via `phase_id`
- Ordered by `order_index` field
- Statuses: todo, in_progress, review, done, blocked
- Supports assignee_id and priority
- Stores tags in `meta` JSONB field

**step_checkitems**
- Links to `steps.id` via `step_id`
- Tracks completion with `is_done`, `done_by`, `done_at`
- Ordered by `order_index`

**files**
- Scoped by `org_id` (explicit) and `project_id` (optional)
- References Supabase Storage via `bucket` and `path`
- Stores metadata: mime_type, size_bytes, sha256
- Tracks uploader and upload timestamp

### Storage Buckets

- **drawings** - Construction drawings and blueprints
- **documents** - Project documents and contracts
- **receipts** - Financial receipts and invoices
- **artifacts** - Build artifacts and deliverables

All buckets enforce org-based RLS:
- Path format: `{org_id}/{project_id}/{filename}`
- Only org members can read/write
- Only org admins can delete

## RLS Security Model

All tables use Row Level Security with these policies:

**SELECT** - Users can view rows if:
- Row's `org_id` is in `auth.user_orgs()`, OR
- Row's parent (via JOIN) org_id is in user's orgs

**INSERT** - Allowed if:
- User has role `manager` or higher in the org

**UPDATE** - Allowed if:
- User has role `member` or higher in the org

**DELETE** - Allowed if:
- User has role `admin` or higher in the org

## Helper Functions

**get_org_from_phase(phase_id)** - Returns org_id via JOIN to projects

**get_org_from_step(step_id)** - Returns org_id via JOIN to phases → projects

**auth.user_orgs()** - Returns UUIDs of orgs user belongs to

**auth.has_org_role(org_id, role)** - Checks if user has required role level

## Troubleshooting

### "No rows returned" errors
- Check RLS policies are correctly applied
- Verify user has org membership: `SELECT * FROM org_members WHERE user_id = auth.uid()`
- Check org_id matches: `SELECT org_id FROM projects WHERE id = ?`

### File upload fails
- Verify storage buckets exist
- Check RLS policies on `storage.objects`
- Ensure path format: `{org_id}/{project_id?}/{filename}`

### Phase/Step queries slow
- Run `ANALYZE` on tables
- Verify indexes exist: `\d phases`, `\d steps`
- Check query uses indexes: `EXPLAIN ANALYZE SELECT ...`

### Checklist items not showing
- Verify JOIN in query includes `step_checkitems`
- Check `mapStep()` function processes checkitems array
- Ensure RLS allows reading checkitems

## Development vs Production

### Development
- Use seed script to create sample data
- Enable detailed SQL logging in Supabase Dashboard
- Use `VITE_USE_MOCK_API=true` for offline development

### Production
- Apply all migrations in order
- Set `VITE_USE_MOCK_API=false`
- Monitor RLS performance with Supabase Analytics
- Set up database backups
- Configure storage retention policies

## API Reference

All CRUD operations available via `import { api } from '@/lib/api'`:

### Projects
- `api.listProjects(orgId, params)` - Paginated list
- `api.getProject(id)` - Single project
- `api.createProject(orgId, data)` - Create
- `api.updateProject(id, data)` - Update
- `api.archiveProject(id)` - Archive

### Phases
- `api.listPhases(projectId)` - All phases for project
- `api.createPhase(projectId, data)` - Create phase
- `api.updatePhase(id, data)` - Update phase
- `api.reorderPhases(projectId, phaseIds)` - Reorder

### Steps
- `api.listSteps(projectId, params)` - Paginated with filters
- `api.getStep(id)` - Single step with checkitems
- `api.createStep(projectId, phaseId, data)` - Create
- `api.updateStep(id, data)` - Update
- `api.toggleCheckItem(stepId, checkItemId)` - Toggle checklist

### Files
- `api.listFiles(orgId, params)` - Paginated list
- `api.getFile(id)` - Single file metadata
- `api.uploadFiles(orgId, projectId, files)` - Upload to Storage

## Next Steps

1. Implement remaining entities (Drawings, Documents, RFIs, etc.)
2. Add real-time subscriptions for collaborative editing
3. Implement file versioning
4. Add audit logging for sensitive operations
5. Set up automated backups
6. Configure monitoring and alerting
