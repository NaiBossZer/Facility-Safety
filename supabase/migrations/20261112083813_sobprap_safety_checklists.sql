-- Sobprap FM safety checklist and corrective action tracking.
create table if not exists public.safety_checklist_inspections (
  id uuid primary key default gen_random_uuid(),
  scope_key text not null check (scope_key in ('project','building_1','building_2','building_3','building_4','building_5','building_6')),
  scope_name text not null,
  form_code text not null check (form_code in ('FM_0000','FM_1000','FM_2000','FM_3000','FM_4000','FM_5000','FM_6000')),
  inspected_on date not null default current_date,
  inspector_id uuid not null references auth.users(id) on delete restrict,
  inspector_name text not null,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  general_note text not null default '',
  evidence_paths text[] not null default '{}'::text[],
  status text not null default 'submitted' check (status in ('submitted','reviewed','closed')),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists safety_checklist_inspections_scope_date_idx on public.safety_checklist_inspections (scope_key, inspected_on desc);
create index if not exists safety_checklist_inspections_created_by_idx on public.safety_checklist_inspections (created_by, created_at desc);

create table if not exists public.safety_checklist_actions (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.safety_checklist_inspections(id) on delete cascade,
  item_key text not null,
  item_label text not null,
  location text not null default '',
  issue text not null,
  priority text not null default 'normal' check (priority in ('urgent','high','normal')),
  status text not null default 'pending' check (status in ('pending','in_progress','resolved')),
  assigned_to text not null default '',
  due_date date,
  resolution_note text not null default '',
  resolved_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inspection_id, item_key)
);
create index if not exists safety_checklist_actions_status_idx on public.safety_checklist_actions (status, priority, due_date);
create index if not exists safety_checklist_actions_inspection_idx on public.safety_checklist_actions (inspection_id);

alter table public.safety_checklist_inspections enable row level security;
alter table public.safety_checklist_actions enable row level security;
grant select, insert, update, delete on public.safety_checklist_inspections to authenticated;
grant select, insert, update, delete on public.safety_checklist_actions to authenticated;

create policy safety_checklist_inspections_select on public.safety_checklist_inspections for select to authenticated
  using (public.is_manager() or created_by = (select auth.uid()));
create policy safety_checklist_inspections_insert on public.safety_checklist_inspections for insert to authenticated
  with check (
    inspector_id = (select auth.uid()) and created_by = (select auth.uid())
    and (public.is_manager() or exists (select 1 from public.staff_profiles sp where sp.user_id = (select auth.uid()) and sp.active = true))
  );
create policy safety_checklist_inspections_update on public.safety_checklist_inspections for update to authenticated
  using (public.is_manager() or created_by = (select auth.uid()))
  with check (public.is_manager() or created_by = (select auth.uid()));
create policy safety_checklist_inspections_delete on public.safety_checklist_inspections for delete to authenticated
  using (public.is_manager());

create policy safety_checklist_actions_select on public.safety_checklist_actions for select to authenticated
  using (
    public.is_manager() or created_by = (select auth.uid())
    or exists (select 1 from public.safety_checklist_inspections i where i.id = inspection_id and i.created_by = (select auth.uid()))
  );
create policy safety_checklist_actions_insert on public.safety_checklist_actions for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from public.safety_checklist_inspections i where i.id = inspection_id and (i.created_by = (select auth.uid()) or public.is_manager()))
  );
create policy safety_checklist_actions_update on public.safety_checklist_actions for update to authenticated
  using (public.is_manager() or exists (select 1 from public.safety_checklist_inspections i where i.id = inspection_id and i.created_by = (select auth.uid())))
  with check (public.is_manager() or exists (select 1 from public.safety_checklist_inspections i where i.id = inspection_id and i.created_by = (select auth.uid())));
create policy safety_checklist_actions_delete on public.safety_checklist_actions for delete to authenticated
  using (public.is_manager());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('safety-checklist-evidence', 'safety-checklist-evidence', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy safety_checklist_evidence_read on storage.objects for select to authenticated
  using (bucket_id = 'safety-checklist-evidence' and (public.is_manager() or (storage.foldername(name))[1] = (select auth.uid())::text));
create policy safety_checklist_evidence_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'safety-checklist-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.staff_profiles sp where sp.user_id = (select auth.uid()) and sp.active = true)
  );
create policy safety_checklist_evidence_update on storage.objects for update to authenticated
  using (bucket_id = 'safety-checklist-evidence' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_manager()))
  with check (bucket_id = 'safety-checklist-evidence' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_manager()));
create policy safety_checklist_evidence_delete on storage.objects for delete to authenticated
  using (bucket_id = 'safety-checklist-evidence' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_manager()));
