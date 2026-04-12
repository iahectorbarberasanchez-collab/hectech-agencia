const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const REALITY_FILE = path.join(ROOT_DIR, 'HECTECH_REALITY_OPS.md');
const VISION_FILE = path.join(ROOT_DIR, 'HECTECH_STRATEGIC_VISION.md');

// 1. REALITY: Based on the Verified Backup Files provided by User
// Location: n8n/backups/2026-01-28T16-09-36
const activeWorkflows = [
    {
        name: "Client Onboarding & Stripe Payments (CORE)",
        file: "hectechai___client_onboarding__stripe_payment_.json",
        description: "Flujo CRÍTICO. Gestiona cobros (Inicial/Final) y despliegue (Supabase/Notion/Drive)."
    },
    {
        name: "Formulario Web a Borrador Gmail",
        file: "formulario_web_a_borrador_gmail_antigravity_funciona.json",
        description: "Captación de leads desde la web. Investiga con SerpAPI y redacta borrador."
    },
    {
        name: "Radar de Leads 2.0",
        file: "hectechai___radar_de_leads_2_0__growth__antigravity_funciona.json",
        description: "Scraper de Redes Sociales. Busca deuda técnica en prospectos (Chatbots/Ads)."
    },
    {
        name: "Buscador de Clientes (Maps)",
        file: "hectechai___buscador_de_posibles_clientes_antigravity_funciona.json",
        description: "Prospección local vía Google Maps + Scraping de emails."
    },
    {
        name: "Generador de Borradores de Venta",
        file: "hectechai___generador_de_borradores_de_venta_antigravity_funciona.json",
        description: "Redacción de copys de venta personalizados."
    },
    {
        name: "Crear Proyectos de Clientes (Legacy)",
        file: "crear_proyectos_de_clientes_antigravity_funciona.json",
        description: "Antiguo onboarding manual (Notion -> Drive)."
    },
    {
        name: "Central de Errores",
        file: "hectechai___central_de_errores__email___telegram__antigravity_funciona.json",
        description: "Monitorización de fallos en n8n."
    }
];

// Strategic Files for VISION
const strategyFiles = [
    { path: 'HECTECH_BRAND_IDENTITY.md', title: 'Identidad de Marca' },
    { path: 'HECTECH_FINANCIAL_LOGIC.md', title: 'Política Financiera (Precios)' },
    { path: 'HECTECH_LEGAL_POSITIONING.md', title: 'Legal & RGPD' },
    { path: 'HECTECH_OPERATIONAL_PROTOCOLS.md', title: 'Protocolos de Calidad y Soporte' },
    { path: 'DNA_ESTRATEGICO_CLINICAS.md', title: 'Estrategia: Clínicas' },
    { path: 'DNA_ESTRATEGICO_HOTELES.md', title: 'Estrategia: Hoteles' },
    { path: 'DNA_ESTRATEGICO_PISOS_TURISTICOS.md', title: 'Estrategia: Pisos Turísticos' },
    { path: 'SECTOR_INMOBILIARIO.md', title: 'Sector Inmobiliario' },
    { path: 'SECTOR_RESTAURANTES.md', title: 'Sector Restaurantes' }
];

function generateReality() {
    let output = `# 🛠️ HecTechAi OPS: La Realidad Operativa\n\n`;
    output += `Última actualización: ${new Date().toLocaleString()}\n\n`;
    output += `> ⚠️ **INSTRUCCIÓN SUPREMA PARA EL GEM:** Este documento contiene SÓLO lo que existe, funciona y está desplegado. Si te preguntan "qué puedo hacer ahora mismo", responde basándote en esta lista.\n\n`;

    output += `## 🤖 Workflows Activos (Verificados en Backup)\n`;
    output += `Estos son los 7 procesos de n8n que tienes instalados actualmente:\n\n`;

    activeWorkflows.forEach(wf => {
        output += `### ✅ ${wf.name}\n`;
        output += `- **Archivo:** \`${wf.file}\`\n`;
        output += `- **Función:** ${wf.description}\n\n`;
    });

    output += `## 🏗️ Stack Tecnológico (Infraestructura)\n`;
    output += `- **Frontend:** Next.js (Vercel)\n`;
    output += `- **Backend Logic:** n8n (VPS Hetzner)\n`;
    output += `- **Database:** Supabase (Auth, Leads, Metrics)\n`;
    output += `- **Pagos:** Stripe (Checkout + Webhooks)\n\n`;

    // Include detailed tech stack if exists
    const techStackPath = path.join(ROOT_DIR, 'HECTECH_TECH_STACK_DETAILED.md');
    if (fs.existsSync(techStackPath)) {
        output += fs.readFileSync(techStackPath, 'utf8');
    }

    fs.writeFileSync(REALITY_FILE, output);
    console.log(`✅ Reality generated: ${REALITY_FILE}`);
}

function generateVision() {
    let output = `# 🧠 HecTechAi VISION: Estrategia y Ventas\n\n`;
    output += `Última actualización: ${new Date().toLocaleString()}\n\n`;
    output += `> ⚠️ **INSTRUCCIÓN PARA EL GEM:** Este documento es tu fuente de inspiración para **Vender, Redactar y Planificar**. Contiene ideas, avatares de cliente y guiones. NO confundas estas ideas con software ya instalado (a menos que esté también en OPS).\n\n`;

    strategyFiles.forEach(file => {
        const fullPath = path.join(ROOT_DIR, file.path);
        if (fs.existsSync(fullPath)) {
            output += `## ${file.title}\n\n`;
            output += fs.readFileSync(fullPath, 'utf8') + '\n\n---\n\n';
        }
    });

    fs.writeFileSync(VISION_FILE, output);
    console.log(`✅ Vision generated: ${VISION_FILE}`);
}

generateReality();
generateVision();
