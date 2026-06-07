create extension if not exists pgcrypto;

create table if not exists public.property_listing_drafts (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  title text not null,
  location text not null,
  description text not null,
  total_value numeric not null,
  expected_monthly_income numeric not null,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready_to_mint', 'minted', 'failed')),
  draft_access_token_hash text not null,
  metadata_uri text,
  property_contract_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_3d_jobs (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.property_listing_drafts(id) on delete cascade,
  wallet_address text not null,
  status text not null default 'queued' check (status in ('queued', 'uploading_world_labs_media', 'waiting_world_labs', 'finalizing', 'succeeded', 'failed', 'cancelled')),
  worldlabs_operation_id text,
  worldlabs_world_id text,
  world_marble_url text,
  thumbnail_url text,
  pano_url text,
  spz_urls jsonb not null default '{}'::jsonb,
  collider_mesh_url text,
  input_image_paths text[] not null default '{}',
  mirrored_asset_refs jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (draft_id)
);

alter table public.property_listing_drafts enable row level security;
alter table public.property_3d_jobs enable row level security;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_property_listing_drafts_updated_at on public.property_listing_drafts;
create trigger set_property_listing_drafts_updated_at
before update on public.property_listing_drafts
for each row execute function public.set_updated_at();

drop trigger if exists set_property_3d_jobs_updated_at on public.property_3d_jobs;
create trigger set_property_3d_jobs_updated_at
before update on public.property_3d_jobs
for each row execute function public.set_updated_at();

-- The app accesses these tables through Next.js API routes using SUPABASE_SERVICE_ROLE_KEY.
