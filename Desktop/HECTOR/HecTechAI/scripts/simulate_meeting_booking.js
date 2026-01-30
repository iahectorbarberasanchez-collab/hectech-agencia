const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), 'hectech-agency/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function bookMeeting() {
    console.log('📅 Booking Demo Meeting with Utopia Villas...');

    // Simulate positive reply time lapse
    const meetingDate = new Date();
    meetingDate.setDate(meetingDate.getDate() + 1);
    meetingDate.setHours(11, 0, 0, 0);

    const { data, error } = await supabase
        .from('leads')
        .update({
            status: 'MEETING_BOOKED',
            message: `Last Interaction: Positive Reply. Demo scheduled for ${meetingDate.toISOString()}`
        })
        .eq('name', 'Utopia Villas')
        .select();

    if (error) {
        console.error('❌ Error updating status:', error.message);
    } else {
        console.log('✅ Status updated to MEETING_BOOKED in Real DB.');
        console.log(`📌 Meeting time: ${meetingDate.toLocaleString()}`);
        console.table(data);
    }
}

bookMeeting();
