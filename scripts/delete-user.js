
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteUser(email) {
    console.log(`Searching for user: ${email}...`);

    // 1. Get User ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found.');
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 2. Delete from Profiles (Client-side table)
    // Usually Cascade delete handles this, but let's be safe
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

    if (profileError) console.error('Error deleting profile:', profileError);
    else console.log('Profile deleted.');

    // 3. Delete from Auth (Admin)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
        console.error('Error deleting auth user:', deleteError);
    } else {
        console.log(`User ${email} successfully deleted.`);
    }
}

deleteUser('hectorbarberasanchez@gmail.com');
