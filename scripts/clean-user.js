
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanSlate() {
    console.log('Cleaning up hectorbarberasanchez@gmail.com...');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === 'hectorbarberasanchez@gmail.com');

    if (user) {
        // Force delete profile first
        await supabase.from('profiles').delete().eq('id', user.id);
        // Delete user
        await supabase.auth.admin.deleteUser(user.id);
        console.log('Deleted user and profile.');
    } else {
        console.log('User not found.');
    }
}

cleanSlate();
