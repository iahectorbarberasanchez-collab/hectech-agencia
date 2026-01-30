
const { createClient } = require('@supabase/supabase-js');

// Hardcoded keys for testing to rule out env var issues in this script
const supabaseUrl = 'https://yafprrydilhktdxduotq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZnBycnlkaWxoa3RkeGR1b3RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ2NjIyNywiZXhwIjoyMDgzMDQyMjI3fQ.zbetrLmYdKj7Y4tEK3kKpnbN3soEPhf8Inlt6FF7ga8'; // Service Role Key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    const clientId = 'test@onboarding.com';
    const password = 'password123';

    console.log(`Testing login for: ${clientId} with password: ${password}`);

    const { data, error } = await supabase
        .from('automation_metrics')
        .select('*')
        .or(`client_id.eq.${clientId},client_email.eq.${clientId}`)
        .eq('password', password)
        .single();

    if (error) {
        console.error('Login FAILED. Error:', error);
    } else if (!data) {
        console.error('Login FAILED. No data returned.');
    } else {
        console.log('Login SUCCESS!');
        console.log('User found:', data.client_name);
        console.log('Status:', data.status);
    }
}

testLogin();
