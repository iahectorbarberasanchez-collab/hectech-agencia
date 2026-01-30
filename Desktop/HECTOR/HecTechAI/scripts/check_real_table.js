const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), 'hectech-agency/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('🔍 Checking if table "leads" exists in REAL DB...');
    // Try to select 1 row. If table doesn't exist, it throws error.
    const { data, error } = await supabase.from('leads').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Table NOT FOUND or Error:', error.message);
        console.log('👉 Please run "migrations/01_create_leads_table.sql" in your Supabase Dashboard > SQL Editor.');
    } else {
        console.log('✅ Table "leads" FOUND in Real DB.');
        console.log('READY for Real Data Insertion.');
    }
}

checkTable();
