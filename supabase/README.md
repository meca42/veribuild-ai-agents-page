# Supabase Database Migrations

This directory contains SQL migration files for setting up the VeriBuild database schema.

## How to Apply Migrations

### Option 1: Via Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Open each migration file in order and execute:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_project_entities.sql`

### Option 2: Via Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

This will automatically apply all migrations in the `supabase/migrations/` directory.

## Migration Files

### 001_initial_schema.sql
Creates the core authentication and organization tables:
- `users` - User profiles (extends auth.users)
- `orgs` - Organizations
- `org_members` - Organization memberships with roles
- `org_invites` - Organization invitations
- `projects` - Project base table
- RLS policies for multi-tenant data isolation
- Helper functions for permission checks

### 002_project_entities.sql
Creates all project-related entities:
- `phases` - Project phases
- `steps` - Project steps/tasks
- `drawings` - Drawing management
- `documents` - Document management
- `rfis` - Request for Information
- `submittals` - Submittal tracking
- `issues` - Issue tracking
- `inspections` - Inspection scheduling
- RLS policies for all tables

## Database Schema

### Core Tables

**users**
- Extends Supabase auth.users
- Stores user profile information
- 1:1 relationship with auth.users

**orgs**
- Organization/company records
- Each user can belong to multiple orgs

**org_members**
- Links users to organizations
- Defines role: owner, admin, manager, member, viewer
- Unique constraint on (org_id, user_id)

**projects**
- Belongs to an organization (org_id)
- RLS ensures users only see projects from their orgs

### Row Level Security (RLS)

All tables have RLS enabled. Key concepts:

1. **User Organizations**: `auth.user_orgs()` returns org IDs the current user belongs to
2. **Membership Check**: `auth.is_org_member(org_id)` checks if user is a member
3. **Role Check**: `auth.has_org_role(org_id, role)` checks if user has required role level

### Role Hierarchy

1. **owner** - Full control, can delete org
2. **admin** - Manage members, settings, all projects
3. **manager** - Create/edit projects, manage project data
4. **member** - Edit assigned tasks, add data
5. **viewer** - Read-only access

## Environment Variables

Make sure your `.env.local` file contains:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For server-side operations (if needed):
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Setup

After applying migrations:

1. Sign up a new user via your app
2. User should be auto-redirected to create an organization
3. Organization should appear in the database
4. User should become the owner of that organization
5. Projects should be scoped to that organization

## Troubleshooting

**Error: relation "auth.users" does not exist**
- Make sure you're running migrations in a Supabase project, not a plain PostgreSQL database

**Error: permission denied for table**
- Check that RLS policies are enabled and correctly configured
- Verify you're authenticated when making requests

**Error: function auth.uid() does not exist**
- This function is provided by Supabase Auth
- Make sure you're using the Supabase PostgreSQL extensions

## References

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
