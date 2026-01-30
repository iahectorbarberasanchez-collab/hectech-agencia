const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(process.cwd(), 'hectech-agency/.env.local') });

const token = process.env.SUPABASE_ACCESS_TOKEN;
// Extract project ref from URL: https://yafprrydilhktdxduotq.supabase.co -> yafprrydilhktdxduotq
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl.split('//')[1].split('.')[0];

if (!token || !projectRef) {
    console.error('Missing token or project ref');
    process.exit(1);
}

const sql = `
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  phone text,
  message text,
  status text default 'PROSPECT',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leads enable row level security;

-- Drop policy if exists to avoid error on retry
drop policy if exists "Enable all for service role" on public.leads;

create policy "Enable all for service role"
on public.leads
for all
to service_role
using (true)
with check (true);
`;

async function runQuery() {
    console.log(`Executing SQL on project ${projectRef}...`);

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const text = await response.text();
        console.error('Error executing query:', response.status, text);
    } else {
        const data = await response.json();
        console.log('Success!', data);
    }
}

runQuery();
