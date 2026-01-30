
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yafprrydilhktdxduotq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZnBycnlkaWxoa3RkeGR1b3RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ2NjIyNywiZXhwIjoyMDgzMDQyMjI3fQ.zbetrLmYdKj7Y4tEK3kKpnbN3soEPhf8Inlt6FF7ga8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking columns for automation_metrics...");

    // We can't query information_schema easily with js client sometimes due to permissions, 
    // but we can try to inspect an empty select result or error.

    const { data, error } = await supabase
        .from('automation_metrics')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Sample Row Keys/Types:', Object.keys(data[0]));
            // Try to deduce type of client_id
            console.log('client_id value:', data[0].client_id);
            console.log('client_id type:', typeof data[0].client_id);
        } else {
            console.log('Table is empty, cannot infer types from data. Attempting to insert dummy to check constraints? No, unsafe.');
        }
    }
}

checkSchema();
