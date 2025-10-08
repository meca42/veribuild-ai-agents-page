-- Indexes for filtering & sorting agent runs
create index if not exists idx_agent_runs_project on agent_runs(project_id);
create index if not exists idx_agent_runs_agent on agent_runs(agent_id);
create index if not exists idx_agent_runs_status on agent_runs(status);
create index if not exists idx_agent_runs_started_at on agent_runs(started_at desc);

-- Lightweight view for quick listing
create or replace view agent_runs_list as
select
  r.id,
  r.project_id,
  r.agent_id,
  r.status,
  r.input,
  left(coalesce(r.result_summary, ''), 200) as result_preview,
  r.started_at,
  r.finished_at
from agent_runs r;
