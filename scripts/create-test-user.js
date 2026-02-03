const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function createTestUser() {
    try {
        // Load env vars manually
        const envPath = path.resolve(__dirname, '../.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('.env.local file not found at:', envPath);
            process.exit(1);
        }

        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envFile.split('\n').forEach(line => {
            const index = line.indexOf('=');
            if (index !== -1) {
                const key = line.substring(0, index).trim();
                let value = line.substring(index + 1).trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                envVars[key] = value;
            }
        });

        const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
        const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase credentials in .env.local');
            console.log('Found keys:', Object.keys(envVars));
            process.exit(1);
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const email = 'test@hectech.ai';
        const password = 'Password123!';

        console.log(`Checking if user ${email} exists...`);

        // Check if user exists (client-side listUsers is cleaner than handling error on create)
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('Error listing users:', listError);
            return; // Don't exit, might be just permission, try create directly? No, service role has permission.
        }

        const existingUser = listData.users.find(u => u.email === email);

        let userId;

        if (existingUser) {
            console.log('User already exists:', existingUser.id);
            userId = existingUser.id;
        } else {
            console.log('Creating new user...');
            const { data: createData, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: 'Test User' }
            });

            if (createError) {
                console.error('Error creating user:', createError);
                return;
            }
            console.log('User created successfully:', createData.user.id);
            userId = createData.user.id;
        }

        // Upsert profile to ensure it has 'building' status
        console.log('Updating profile status to "building"...');
        const profilePayload = {
            id: userId,
            // email field removed as it likely doesn't exist in profiles table
            status: 'building'
        };

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profilePayload, { onConflict: 'id' });

        if (profileError) {
            console.error('Error updating profile:', profileError);
        } else {
            console.log('Profile updated successfully.');
            console.log('------------------------------------------------');
            console.log('CREDENTIALS FOR TESTING:');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log('------------------------------------------------');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

createTestUser();
