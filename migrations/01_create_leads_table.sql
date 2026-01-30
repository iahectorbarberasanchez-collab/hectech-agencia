-- Create leads table
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  phone text,
  message text,
  status text default 'PROSPECT',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leads enable row level security;

-- Policy: Allow Service Role (Server Actions / n8n) full access
create policy "Enable all for service role"
on public.leads
for all
to service_role
using (true)
with check (true);

-- Policy: Allow public to INSERT (for Client Forms if needed, otherwise restrict)
-- For now, assuming server-side only insertion for security.
