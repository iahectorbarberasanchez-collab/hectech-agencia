const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Env Vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim().replace(/"/g, '');
    }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Missing Supabase Credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function simulateClientFlow() {
    const TEST_EMAIL = 'cliente_simulado@hectech.ai';
    const TEST_ID = 'SIM_001';

    console.log(`\n🤖 SIMULANDO PASO 4 (n8n --> Supabase)...`);
    console.log(`Intentando crear cliente: ${TEST_EMAIL}`);

    // Clean previous run
    await supabase.from('automation_metrics').delete().eq('client_email', TEST_EMAIL);

    // Insert new client (Minimal fields to test schema)
    const { data: insertedData, error } = await supabase
        .from('automation_metrics')
        .insert([{
            client_id: TEST_ID,
            client_email: TEST_EMAIL,
            metric_type: 'TEST_PROFILE', // Required by DB constraint
            client_name: 'Cliente Simulado',
            status: 'ONBOARDING',
            total_actions: 0,
            total_time_saved: 0,
            drive_folder_url: 'https://drive.google.com/drive/u/0/folders/placeholder'
        }])
        .select();

    if (error) {
        console.error('❌ Error creating client in Supabase:', error);
        console.log('💡 Hint: Does the table "automation_metrics" exist?');
        return;
    }

    console.log('✅ Cliente creado en Supabase correctamente.');
    console.log('📊 Estructura de la tabla detectada (columnas devueltas):');
    if (insertedData && insertedData.length > 0) {
        console.log(Object.keys(insertedData[0]));
    }
    console.log('   (Esto confirma que si n8n envía los datos, Supabase los guardará)');

    console.log(`\n🤖 SIMULANDO PASO 5 (Cliente --> Dashboard Request)...`);
    console.log(`Simulando que el cliente pide su contraseña...`);

    // Verify we can find it
    const { data: foundClient, error: findError } = await supabase
        .from('automation_metrics')
        .select('*')
        .eq('client_email', TEST_EMAIL)
        .single();

    if (findError || !foundClient) {
        console.error('❌ No se pudo encontrar el cliente recién creado.');
        return;
    }

    // Generate Password
    const newPassword = 'TEST_123_PASSWORD';
    const { error: updateError } = await supabase
        .from('automation_metrics')
        .update({ password: newPassword })
        .eq('client_email', TEST_EMAIL);

    if (updateError) {
        console.error('❌ Error generando contraseña:', updateError);
        return;
    }

    console.log('✅ Contraseña generada y guardada.');
    console.log('🎉 SIMULACIÓN EXITOSA');
    console.log('------------------------------------------------');
    console.log('Puedes probar a entrar en el Dashboard tu mismo:');
    console.log(`URL: http://localhost:3000/dashboard`);
    console.log(`User: ${TEST_EMAIL}`);
    console.log(`Pass: ${newPassword}`);
    console.log('------------------------------------------------');
}

simulateClientFlow();
