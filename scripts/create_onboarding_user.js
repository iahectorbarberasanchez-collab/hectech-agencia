
const { createClient } = require('@supabase/supabase-js');

// Using credentials from list_tables.js for consistency
const supabaseUrl = 'https://yafprrydilhktdxduotq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZnBycnlkaWxoa3RkeGR1b3RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ2NjIyNywiZXhwIjoyMDgzMDQyMjI3fQ.zbetrLmYdKj7Y4tEK3kKpnbN3soEPhf8Inlt6FF7ga8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createOnboardingUser() {
    const userEmail = 'test@onboarding.com';
    const userPassword = 'password123';

    console.log(`Creating user: ${userEmail} ...`);

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
        .from('automation_metrics')
        .select('*')
        .eq('client_email', userEmail)
        .single();

    if (existingUser) {
        console.log('User already exists. Updating status to ONBOARDING...');
        const { error: updateError } = await supabase
            .from('automation_metrics')
            .update({
                status: 'ONBOARDING',
                client_name: 'Test Onboarding User',
                drive_folder_url: 'https://drive.google.com/drive/u/0/my-drive', // Dummy URL
                password: userPassword
            })
            .eq('client_email', userEmail);

        if (updateError) {
            console.error('Error updating user:', updateError);
        } else {
            console.log('User updated successfully!');
            console.log('------------------------------------------------');
            console.log('LOGIN CREDENTIALS:');
            console.log(`Email: ${userEmail}`);
            console.log(`Password: ${userPassword}`);
            console.log('------------------------------------------------');
        }
    } else {
        console.log('User does not exist. Creating new user...');
        const { error: insertError } = await supabase
            .from('automation_metrics')
            .insert([{
                client_name: 'Test Onboarding User',
                client_email: userEmail,
                password: userPassword,
                status: 'ONBOARDING',
                drive_folder_url: 'https://drive.google.com/drive/u/0/my-drive',
                total_actions: 0,
                total_time_saved: 0
            }]);

        if (insertError) {
            console.error('Error creating user:', insertError);
        } else {
            console.log('User created successfully!');
            console.log('------------------------------------------------');
            console.log('LOGIN CREDENTIALS:');
            console.log(`Email: ${userEmail}`);
            console.log(`Password: ${userPassword}`);
            console.log('------------------------------------------------');
        }
    }
}

createOnboardingUser();
