const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), 'hectech-agency/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function logOutreach() {
    console.log('📝 Updating CRM Status for Utopia Villas...');

    const { data, error } = await supabase
        .from('leads')
        .update({ status: 'CONTACTED', message: 'Outreach Sent: "24h Response Pain Point" (Simulation Logged)' })
        .eq('name', 'Utopia Villas')
        .select();

    if (error) {
        console.error('❌ Error updating status:', error.message);
    } else {
        console.log('✅ Status updated to CONTACTED in Real DB.');
        console.log(data);
    }
}

logOutreach();
