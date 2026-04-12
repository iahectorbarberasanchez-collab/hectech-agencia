const fs = require('fs');
const path = require('path');

const leadsPath = path.resolve('hectech-agency/data/leads_simulation_db.json');
const emailDraftPath = path.resolve('hectech-agency/data/outreach_draft_utopia.md');
const logPath = path.resolve('hectech-agency/data/campaign_logs.txt');

// Load Data
const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
const emailTemplate = fs.readFileSync(emailDraftPath, 'utf8');

async function runCampaign() {
    console.log('🚀 Launching Outreach Campaign: "24h Response Pain Point"...');

    // Filter Target
    const target = leads.find(l => l.name === 'Utopia Villas');

    if (!target) {
        console.error('❌ Target Utopia Villas not found in DB.');
        return;
    }

    if (target.status !== 'PROSPECT') {
        console.log(`⚠️ Target ${target.name} already contacted (Status: ${target.status})`);
        return;
    }

    console.log(`🎯 Target Identified: ${target.name} (${target.email})`);
    console.log(`💡 Opportunity: ${target.opportunity}`);

    // Simulate "Personalization" (Simple replacement if needed, but draft is already specific)
    const personalizedEmail = emailTemplate.replace('Utopia Villas', target.name);

    // Simulate Sending
    console.log('📧 Sending Email via SMTP Relay (Simulated)...');
    await new Promise(r => setTimeout(r, 1500)); // Latency sim

    // Log Success
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] SENT to ${target.email} | Subject: "24h para responder..." | Status: 200 OK\n`;
    fs.appendFileSync(logPath, logEntry);

    // Update DB
    target.status = 'CONTACTED';
    target.last_contact_at = timestamp;
    fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));

    console.log('✅ Email Sent Successfully.');
    console.log('📝 CRM Updated: Status set to CONTACTED.');
    console.log(`📂 Log saved to ${logPath}`);
}

runCampaign();
