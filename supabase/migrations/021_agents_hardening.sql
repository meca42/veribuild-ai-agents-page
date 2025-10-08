-- Agent config table
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  model text not null default 'gpt-4o-mini',
  temperature numeric(3,2) not null default 0.2,
  max_steps int not null default 6,
  cost_cap_usd numeric(10,2) not null default 5.00,
  allowed_tools text[] not null default array['search_drawings','query_inventory','create_rfi'],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_agents_org on public.agents(org_id);

-- API keys vault (per org)
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  provider text not null,
  name text not null,
  secret text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_api_keys_org on public.api_keys(org_id);

-- Add metrics columns to agent_runs (if not already added)
do $$ begin
  alter table public.agent_runs add column if not exists usage_prompt_tokens integer;
  alter table public.agent_runs add column if not exists usage_completion_tokens integer;
  alter table public.agent_runs add column if not exists usage_total_tokens integer;
  alter table public.agent_runs add column if not exists usage_cost_usd numeric(10,6);
  alter table public.agent_runs add column if not exists error text;
  alter table public.agent_runs add column if not exists created_by uuid references public.users(id) on delete set null;
  alter table public.agent_runs add column if not exists result_summary text;
exception when duplicate_column then null;
end $$;

-- Audit table for security/observability
create table if not exists public.agent_audit (
  id bigserial primary key,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  event text not null,
  meta jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_agent_audit_run on public.agent_audit(run_id);
create index if not exists idx_agent_audit_created on public.agent_audit(created_at desc);

-- Enable RLS
alter table public.agents enable row level security;
alter table public.api_keys enable row level security;
alter table public.agent_audit enable row level security;

-- RLS policies for agents
drop policy if exists "Members view agents" on public.agents;
create policy "Members view agents"
  on public.agents for select
  using (
    org_id in (
      select org_id from public.org_members where user_id = auth.uid()
    )
  );

drop policy if exists "Managers manage agents" on public.agents;
create policy "Managers manage agents"
  on public.agents for all
  using (
    org_id in (
      select org_id from public.org_members 
      where user_id = auth.uid() 
        and role in ('owner', 'admin', 'manager')
    )
  );

-- RLS policies for api_keys
drop policy if exists "Managers manage api keys" on public.api_keys;
create policy "Managers manage api keys"
  on public.api_keys for all
  using (
    org_id in (
      select org_id from public.org_members 
      where user_id = auth.uid() 
        and role in ('owner', 'admin', 'manager')
    )
  );

-- RLS policies for agent_audit
drop policy if exists "Members view audit" on public.agent_audit;
create policy "Members view audit"
  on public.agent_audit for select
  using (
    run_id in (
      select ar.id from public.agent_runs ar
      join public.projects p on p.id = ar.project_id
      where p.org_id in (
        select org_id from public.org_members where user_id = auth.uid()
      )
    )
  );

-- Add updated_at trigger for agents
create or replace function public.update_agents_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists agents_updated_at on public.agents;
create trigger agents_updated_at
  before update on public.agents
  for each row
  execute function public.update_agents_updated_at();
