-- Create automations table
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  trigger_type text not null check (trigger_type in ('news_sources', 'web_search')),
  trigger_config jsonb,
  objective text,
  category text not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  end_after_runs int,
  generations_per_run int default 5 not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for automations
alter table public.automations enable row level security;

-- Policy for automations
create policy "Users can manage automations"
  on public.automations
  for all
  using (
    auth.uid() = automations.created_by
    OR
    automations.client_id IN (
      select client_id
      from public.client_members
      where user_id = auth.uid()
    )
    OR
    automations.client_id IN (
      select id
      from public.clients
      where created_by = auth.uid()
    )
  );


-- Create automation_runs table
create table if not exists public.automation_runs (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references public.automations(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  started_at timestamptz default now() not null,
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'failed')),
  items_generated int default 0,
  error_message text,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Enable RLS for runs
alter table public.automation_runs enable row level security;

-- Policy for runs
  create policy "Users can view automation runs for their clients"
  on public.automation_runs
  for all
  using (
    auth.uid() = automation_runs.created_by -- criador da automation
    OR
    automation_runs.client_id IN (         -- membro do client
      select client_id
      from public.client_members
      where user_id = auth.uid()
    )
    OR
    automation_runs.client_id IN (         -- criador do client
      select id
      from public.clients
      where created_by = auth.uid()
    )
  );


-- Indexes for performance
create index if not exists idx_automations_client_id on public.automations(client_id);
create index if not exists idx_automation_runs_client_id on public.automation_runs(client_id);
create index if not exists idx_automation_runs_automation_id on public.automation_runs(automation_id);

grant select, insert, update, delete on public.automations to authenticated;
grant select, insert, update, delete on public.automation_runs to authenticated;