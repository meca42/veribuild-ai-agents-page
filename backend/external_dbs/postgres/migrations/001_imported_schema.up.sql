CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE TYPE public.project_status AS ENUM (
    'planning',
    'active',
    'on_hold',
    'completed',
    'archived'
);
CREATE FUNCTION public.has_any_role(org uuid, roles text[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select exists (select 1 from public.org_members
                 where org_id = org and user_id = auth.uid()
                   and role::text = any (roles));
$$;
CREATE FUNCTION public.has_role(org uuid, roles text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select exists (
    select 1 from public.org_members
    where org_id = org and user_id = auth.uid()
      and role = any (roles)
  );
$$;
CREATE FUNCTION public.is_org_member(org uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select exists (select 1 from public.org_members
                 where org_id = org and user_id = auth.uid());
$$;
CREATE FUNCTION public.user_orgs() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select org_id from public.org_members where user_id = auth.uid();
$$;
CREATE TABLE public.org_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT org_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'manager'::text, 'member'::text, 'viewer'::text])))
);
CREATE TABLE public.orgs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    status public.project_status DEFAULT 'planning'::public.project_status NOT NULL,
    location text,
    start_date date,
    end_date date,
    budget numeric(15,2),
    spent numeric(15,2) DEFAULT 0,
    progress integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT projects_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);
CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now()
);