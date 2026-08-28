create table if not exists public.mdrrmo_records (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);
-- The Vercel server uses the service-role key; do not expose that key in index.html.
