-- ============================================================
-- 1. Tables
-- ============================================================

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  nom_entreprise text not null,
  siret text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.salaries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  nom text not null,
  prenom text not null,
  date_naissance text not null,
  salaire_brut_mensuel numeric not null,
  type_contrat text not null,
  poste text not null
);

create table public.pdf_generations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  simulation_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.pdf_config (
  id integer primary key default 1 check (id = 1),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'pending' check (role in ('pending', 'admin')),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. Indexes
-- ============================================================

create index idx_salaries_submission on public.salaries(submission_id);
create index idx_pdf_generations_submission on public.pdf_generations(submission_id);

-- ============================================================
-- 3. Auto-update updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

create trigger trg_pdf_config_updated_at
  before update on public.pdf_config
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. Auto-create profile on auth.users insert
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 5. Seed default pdf_config
-- ============================================================

insert into public.pdf_config (id, config) values (1, '{
  "ajustement_salaire": 150,
  "participation_employeur": 0,
  "prevention_ergonomique": 2735,
  "commission_rate": 0.10,
  "forfait_demarrage": 990,
  "base_scenario_amount": 7300,
  "tuteur_monthly": 230,
  "charge_rate_standard": 1.27,
  "charge_rate_optimized": 1.19,
  "cost_thresholds": [50000, 100000, 200000, 400000, 700000, 1200000],
  "economy_thresholds": [150000, 100000, 70000, 50000, 35000, 20000],
  "age_min_100": 16,
  "age_max_100": 29
}'::jsonb);

-- ============================================================
-- 6. Row Level Security
-- ============================================================

alter table public.submissions enable row level security;
alter table public.salaries enable row level security;
alter table public.pdf_generations enable row level security;
alter table public.pdf_config enable row level security;
alter table public.profiles enable row level security;

-- Helper: check if current user is an approved admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and approved = true and role = 'admin'
  );
$$ language sql security definer stable;

-- submissions: admins full CRUD, service role bypasses RLS
create policy "admins_submissions_select" on public.submissions for select to authenticated using (public.is_admin());
create policy "admins_submissions_insert" on public.submissions for insert to authenticated with check (true);
create policy "admins_submissions_update" on public.submissions for update to authenticated using (public.is_admin());
create policy "admins_submissions_delete" on public.submissions for delete to authenticated using (public.is_admin());

-- salaries
create policy "admins_salaries_select" on public.salaries for select to authenticated using (public.is_admin());
create policy "admins_salaries_insert" on public.salaries for insert to authenticated with check (true);
create policy "admins_salaries_update" on public.salaries for update to authenticated using (public.is_admin());
create policy "admins_salaries_delete" on public.salaries for delete to authenticated using (public.is_admin());

-- pdf_generations
create policy "admins_pdf_gen_select" on public.pdf_generations for select to authenticated using (public.is_admin());
create policy "admins_pdf_gen_insert" on public.pdf_generations for insert to authenticated with check (true);

-- pdf_config: anyone can read (needed by submit route via service role), only admins write
create policy "anyone_pdf_config_select" on public.pdf_config for select using (true);
create policy "admins_pdf_config_update" on public.pdf_config for update to authenticated using (public.is_admin());

-- profiles: users read own, admins read/update all
create policy "own_profile_select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admins_profiles_select" on public.profiles for select to authenticated using (public.is_admin());
create policy "admins_profiles_update" on public.profiles for update to authenticated using (public.is_admin());

-- ============================================================
-- 7. Storage bucket
-- ============================================================

insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', false);

create policy "admins_pdfs_select" on storage.objects for select to authenticated using (bucket_id = 'pdfs' and public.is_admin());
create policy "service_pdfs_insert" on storage.objects for insert with check (bucket_id = 'pdfs');
