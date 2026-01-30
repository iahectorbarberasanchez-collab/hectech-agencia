const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), 'hectech-agency/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDashboardTable() {
    console.log('🔍 Checking "automation_metrics" table...');

    // Check if table exists by selecting 1 row
    const { data, error } = await supabase.from('automation_metrics').select('*').limit(1);

    if (error) {
        console.error('❌ Table check failed:', error.message);
        if (error.code === '42P01') {
            console.log('👉 Table does not exist (42P01).');
        }
    } else {
        console.log('✅ Table "automation_metrics" FOUND.');
        console.log('Sample Data:', data);
    }
}

checkDashboardTable();
