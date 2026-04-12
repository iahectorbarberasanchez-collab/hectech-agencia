const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), 'hectech-agency/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createOnboardingUser() {
    console.log('🚧 Creating Test User with ONBOARDING status...');

    // Check if exists first to avoid duplicates
    const check = await supabase
        .from('automation_metrics')
        .select('*')
        .eq('client_id', 'TEST_ONBOARDING')
        .single();

    if (check.data) {
        console.log('⚠️ User TEST_ONBOARDING already exists. Updating status to ONBOARDING...');
        await supabase
            .from('automation_metrics')
            .update({ status: 'ONBOARDING', password: 'test' })
            .eq('client_id', 'TEST_ONBOARDING');
    } else {
        const { error } = await supabase
            .from('automation_metrics')
            .insert([{
                client_id: 'TEST_ONBOARDING',
                client_email: 'test_onboarding@hectech.ai',
                client_name: 'Cliente Construcción',
                password: 'test',
                status: 'ONBOARDING',
                metric_type: 'setup',
                value: 0
            }]);

        if (error) console.error('❌ Error:', error.message);
    }

    console.log('✅ User Ready: TEST_ONBOARDING / test');
}

createOnboardingUser();
