
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProfiles() {
    console.log('Checking profiles table...');
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) console.error(error);
    else console.table(data);

    console.log('Checking auth users...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error(authError);
    else console.table(users.map(u => ({ id: u.id, email: u.email })));
}

checkProfiles();
