# Supabase Authentication Setup Guide

## Overview

VeriBuild now uses Supabase for authentication and org-based multi-tenancy with Row Level Security (RLS).

## Environment Setup

1. Create a `.env.local` file (use `.env.local.example` as template):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
USE_MOCK_API=true
```

2. Get credentials from Supabase Dashboard:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → anon/public key
   - Service Role Key: Settings → API → service_role key (keep secret!)

## Database Migrations

Apply the SQL migrations in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and run `supabase/migrations/001_initial_schema.sql`
3. Copy and run `supabase/migrations/002_project_entities.sql`

These migrations create:
- User profiles table (linked to auth.users)
- Organizations and org memberships
- Organization invitations
- Projects and all project-related entities
- RLS policies for data isolation
- Helper functions for permission checks

## Authentication Flows

### Email + Password
- **Sign up**: `/signup` - Creates account, sends verification email
- **Login**: `/login` - Requires verified email
- **Password Reset**: `/forgot-password` → `/reset-password`

### Google OAuth
- Click "Continue with Google" on login/signup pages
- Automatically creates user profile on first login
- Callback handled at `/auth/callback`

### Email Verification
**Important**: Users must verify their email before accessing the app. Supabase sends verification emails automatically.

## Organization Management

### First-Time User Flow
1. Sign up → verify email → login
2. Redirected to `/onboarding/create-org`
3. Create first organization (becomes owner)
4. Redirected to `/projects`

### Multi-Org Users
- If user has multiple orgs: `/onboarding/select-org`
- Current org saved in localStorage
- Switch orgs via UserMenu (top-right)

### Creating Organizations
```typescript
// In CreateOrg.tsx
const { data: org } = await supabase
  .from('orgs')
  .insert({ name: orgName })
  .select()
  .single();

// Add creator as owner
await supabase
  .from('org_members')
  .insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner'
  });
```

## Row Level Security (RLS)

### How It Works
- Every table with `org_id` is protected by RLS
- Users can only access data from orgs they're members of
- Helper functions check membership and roles:
  - `auth.user_orgs()` - Returns org IDs user belongs to
  - `auth.is_org_member(org_id)` - Check membership
  - `auth.has_org_role(org_id, role)` - Check role level

### Role Hierarchy
1. **owner** - Full control, can delete org
2. **admin** - Manage members, settings, all projects
3. **manager** - Create/edit projects, manage project data
4. **member** - Edit assigned tasks, add data
5. **viewer** - Read-only access

### Example Policies
```sql
-- Projects: Users see only their org's projects
CREATE POLICY "Users can view projects in their orgs"
  ON projects FOR SELECT
  USING (org_id IN (SELECT auth.user_orgs()));

-- Projects: Manager+ can create projects
CREATE POLICY "Org members (manager+) can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.has_org_role(org_id, 'manager'));
```

## Protected Routes

All app routes under `/projects`, `/files`, etc. are protected by `<ProtectedRoute>`:

```typescript
<Route element={
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
}>
  {/* All protected routes */}
</Route>
```

Protection checks:
1. ✅ User is authenticated
2. ✅ User belongs to at least one org
3. ✅ User has selected a current org

If any check fails → redirect to appropriate flow.

## Invitation System

### Inviting Members
```typescript
// Generate secure token
const token = crypto.randomUUID();

// Create invitation (admins only)
await supabase
  .from('org_invites')
  .insert({
    org_id: currentOrgId,
    email: inviteEmail,
    role: selectedRole,
    token,
    invited_by: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

// Send email (implement email service)
console.log(`Invite URL: ${window.location.origin}/accept-invite?token=${token}`);
```

### Accepting Invitations
1. User receives email with link: `/accept-invite?token=xxx`
2. Page validates token and checks expiry
3. If user logged in: add to org_members
4. If user not logged in: redirect to login with return URL

## Auth Context

Access auth state anywhere with `useAuth()`:

```typescript
const {
  user,              // Supabase User object
  userProfile,       // { name, avatar_url }
  isAuthenticated,   // boolean
  isLoading,         // boolean
  currentOrgId,      // string | null
  currentOrgRole,    // 'owner' | 'admin' | etc.
  organizations,     // Array of orgs user belongs to
  setCurrentOrgId,   // Switch active org
  login,             // Email/password login
  loginWithGoogle,   // Google OAuth
  logout,            // Sign out
  signup,            // Create account
  refreshOrgs,       // Reload org memberships
} = useAuth();
```

## Switching Between Mock and Real Auth

Set `USE_MOCK_API=false` in `.env.local` to use real Supabase backend instead of mocks.

The app is designed so hooks and API calls work with both:
- Mock mode: Uses in-memory data from `lib/mocks/db.ts`
- Real mode: Uses Supabase with RLS enforcement

## Testing

### Seed Data Script
Run the seed script to create test organizations and users:

```sql
-- See supabase/seeds/001_test_data.sql
-- Creates:
-- - "VeriBuild Demo Co." org
-- - pm@demo.com (password: Demo123!, role: admin)
-- - viewer@demo.com (password: Demo123!, role: viewer)
```

### Manual Testing Checklist
- [ ] Sign up with email → verify email
- [ ] Login with verified account
- [ ] Create first organization
- [ ] Access `/projects` → see empty state
- [ ] Try accessing `/projects` while logged out → redirect to /login
- [ ] Sign up second user → invite to same org
- [ ] Accept invitation
- [ ] Both users see same projects (RLS working)
- [ ] Viewer cannot create projects (role enforcement)
- [ ] Google OAuth signup/login
- [ ] Org switcher with multiple orgs

## Troubleshooting

### "User not found" after signup
- Check email verification status in Supabase Dashboard → Authentication → Users
- Resend verification email if needed

### RLS preventing access to data
- Check user has org_members row: `SELECT * FROM org_members WHERE user_id = 'xxx'`
- Verify org_id matches: `SELECT * FROM projects WHERE org_id = 'xxx'`
- Test RLS function: `SELECT auth.user_orgs()`

### OAuth callback not working
- Verify redirect URLs in Supabase Dashboard → Authentication → URL Configuration
- Add: `http://localhost:5173/auth/callback` and production URL

### Session not persisting
- Check browser cookies enabled
- Verify Supabase URL/keys are correct
- Check browser console for auth errors

## Security Best Practices

1. **Never expose service role key** - Only use in secure server environments
2. **Always use RLS** - Every table with sensitive data must have RLS enabled
3. **Validate roles server-side** - Don't trust client-side role checks
4. **Expire invitations** - Set reasonable expiry times
5. **Use email verification** - Prevent spam accounts
6. **Rate limit invitations** - Prevent abuse

## Next Steps

1. Implement email sending service (SendGrid, AWS SES, etc.)
2. Add password reset flow UI
3. Add email change verification
4. Implement invitation email templates
5. Add audit logging for sensitive actions
6. Set up Supabase Edge Functions for server-side logic
7. Configure Supabase Storage for file uploads
8. Add 2FA support
9. Implement account deletion flow
10. Add org transfer ownership feature
