-- Index FK columns used by the Sobprap safety checklist policies and relations.
create index if not exists safety_checklist_inspections_inspector_id_idx on public.safety_checklist_inspections (inspector_id);
create index if not exists safety_checklist_inspections_updated_by_idx on public.safety_checklist_inspections (updated_by);
create index if not exists safety_checklist_actions_created_by_idx on public.safety_checklist_actions (created_by);
create index if not exists safety_checklist_actions_updated_by_idx on public.safety_checklist_actions (updated_by);
