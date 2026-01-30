const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), 'hectech-agency/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const leads = [
    {
        name: 'Utopia Villas',
        email: 'info@utopia-villas.com',
        phone: '+34 699 56 15 48',
        message: 'PROSPECT: 24h response time pain point. Opportunity: AI Concierge.',
        status: 'PROSPECT'
    },
    {
        name: 'Sitges Group',
        email: 'reservas@sitgesgroup.com',
        phone: '+34 608 24 76 78',
        message: 'PROSPECT: Manual Check-in. Opportunity: WhatsApp Automation.',
        status: 'PROSPECT'
    },
    {
        name: 'Hello Homes Sitges',
        email: 'info@hellohomessitges.com',
        phone: '+34 93.120.58.89',
        message: 'PROSPECT: Expensive 24/7 Phone Support. Opportunity: AI Voice Agent.',
        status: 'PROSPECT'
    },
    {
        name: 'Stay Sitges',
        email: 'mail@staysitges.com',
        phone: 'N/A',
        message: 'PROSPECT: Low conversion web. Opportunity: Lead Magnet Bot.',
        status: 'PROSPECT'
    },
    {
        name: 'Sitges Hills Villas',
        email: 'info@sitgeshillsvillas.com',
        phone: '+34 93 047 4266',
        message: 'PROSPECT: Manual Content. Opportunity: SEO AI Generator.',
        status: 'PROSPECT'
    },
    {
        name: 'Blau Sitges',
        email: 'info@blausitges.com',
        phone: '+34 667 418 365',
        message: 'PROSPECT: Static FAQ. Opportunity: Interactive Assistant.',
        status: 'PROSPECT'
    }
];

async function insertResults() {
    console.log('🚀 Inserting Real Prospects into Supabase...');

    const { data, error } = await supabase
        .from('leads')
        .insert(leads)
        .select();

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log(`✅ Success! ${data.length} leads inserted.`);
        console.table(data.map(l => ({ id: l.id, name: l.name })));
    }
}

insertResults();
