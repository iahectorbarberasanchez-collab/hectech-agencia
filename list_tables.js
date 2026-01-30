
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yafprrydilhktdxduotq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZnBycnlkaWxoa3RkeGR1b3RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ2NjIyNywiZXhwIjoyMDgzMDQyMjI3fQ.zbetrLmYdKj7Y4tEK3kKpnbN3soEPhf8Inlt6FF7ga8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_schema, table_name')
        .eq('table_schema', 'public'); // Check public schema first

    if (error) {
        // information_schema access might be restricted even for service_role in some setups? 
        // Usually service_role enables bypass RLS but information_schema is special.
        // However, let's try.
        console.error('Error listing tables:', error);

        // Fallback: List ALL tables via RPC if available or just try to select from known tables?
        // Let's try to query pg_catalog tables via RPC if this fails, but first try direct select.
    } else {
        console.log('Tables in public schema:');
        console.table(data);
    }

    // Also check if there are other schemas with similar tables
    const { data: allTables, error: allError } = await supabase
        .from('information_schema.tables')
        .select('table_schema, table_name')
        .neq('table_schema', 'pg_catalog')
        .neq('table_schema', 'information_schema');

    if (!allError) {
        console.log('\nAll tables in user schemas:');
        console.table(allTables);
    } else {
        console.error('Error listing all tables:', allError);
    }
}

listTables();
