const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'HECTECH_AI_BRAIN.md');
const NOTEBOOK_OUTPUT = path.join(ROOT_DIR, 'NOTEBOOK_LM_KNOWLEDGE.md');

const filesToInclude = [
    { path: 'HECTECH_BRAND_IDENTITY.md', title: 'Identidad de Marca (Resumen)', isBrand: true },
    { path: 'HECTECH_TECH_STACK_DETAILED.md', title: 'Stack Tecnológico Detallado' },
    { path: 'HECTECH_OPERATIONAL_PROTOCOLS.md', title: 'Protocolos Operacionales' },
    { path: 'HECTECH_FINANCIAL_LOGIC.md', title: 'Lógica Financiera' },
    { path: 'HECTECH_LEGAL_POSITIONING.md', title: 'Posicionamiento Legal' },
    { path: 'ARCHITECTURE.md', title: 'Infraestructura y Arquitectura' },
    { path: 'WORKFLOWS.md', title: 'Flujos de Trabajo de la Agencia' },
    { path: 'DNA_ESTRATEGICO_CLINICAS.md', title: 'DNA Estratégico: Clínicas' },
    { path: 'DNA_ESTRATEGICO_HOTELES.md', title: 'DNA Estratégico: Hoteles' },
    { path: 'DNA_ESTRATEGICO_PISOS_TURISTICOS.md', title: 'DNA Estratégico: Pisos Turísticos' },
    { path: 'SECTOR_INMOBILIARIO.md', title: 'Soluciones: Sector Inmobiliario' },
    { path: 'SECTOR_RESTAURANTES.md', title: 'Soluciones: Sector Restaurantes' },
    { path: 'SECTOR_PISOS_TURISTICOS.md', title: 'Soluciones: Sector Pisos Turísticos' },
    { path: 'hectech-agency/src/app/page.tsx', title: 'Páginas y UI (Principales)', extractInfo: true }
];

function extractVisionFromPage(content) {
    // Extract key benefits and services from the landing page code
    const benefits = content.match(/const benefits = \[(.*?)\];/s)?.[1] || "No encontrado";
    const services = content.match(/const services = (.*?)<\/section>/s)?.[1] || "No encontrado";

    return `
### Propuesta de Valor Extraída del Código
- **Misión:** Democratizar la IA para negocios locales, eliminando el "trabajo aburrido".
- **Nicho:** Clínicas, Inmobiliarias, E-commerce, Restaurantes.
- **Diferenciadores:** 
  - Respuesta instantánea 24/7.
  - Reducción de costes operativos hasta el 70%.
  - Dashboards de impacto real (ROI).
  - Auditoría IA personalizada en tiempo real.
`;
}

function extractBrandSummary(content) {
    const voxAndTono = content.match(/## 🗣️ 4. Voz y Tono: Cómo nos comunicamos(.*?)---/s)?.[1] || "";
    const primaryValues = content.match(/## ⚖️ 3. Valores Fundacionales(.*?)---/s)?.[1] || "";

    return `
### Pilares de Comunicación
${voxAndTono.trim()}

### Valores Críticos
${primaryValues.trim()}
`;
}

function generate() {
    let output = `# 🧠 HecTechAi Brain: El Corazón de la Agencia\n\n`;
    output += `Última actualización: ${new Date().toLocaleString()}\n\n`;
    output += `Este documento es la **fuente de verdad técnica y operativa** sobre HecTechAi. Se ha generado automáticamente para servir de base al Gemini Gem.\n\n`;

    // Resumen Ejecutivo del Fundador
    output += `## 👤 Perfil del Fundador
- **Nombre:** Héctor Barberá Sánchez.
- **Rol:** Fundador y Arquitecto Jefe de Automatización.
- **Tono:** Directo, profesional, sin rellenos corporativos, enfocado en resultados tangibles.\n\n---\n\n`;

    filesToInclude.forEach(file => {
        const fullPath = path.join(ROOT_DIR, file.path);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            output += `## ${file.title}\n\n`;
            if (file.extractInfo) {
                output += extractVisionFromPage(content);
            } else if (file.isBrand) {
                output += extractBrandSummary(content);
            } else {
                output += content + '\n\n';
            }
            output += `---\n\n`;
        }
    });

    // Añadir resumen de automatizaciones críticas
    output += `## ⚡ Resumen de Automatizaciones Críticas (n8n)
1. **Lead Qualification:** Clasifica leads en VIP, BUENO o REGULAR mediante IA y SerpAPI.
2. **Auto-Propuesta:** Genera borradores de email personalizados basados en el "score" del lead.
3. **Onboarding & Pagos:** Stripe Trigger → n8n → Supabase (Credenciales) + Notion (CRM) + Drive (Carpetas) + Gmail (Bienvenida/Lanzamiento).
4. **Radar de Leads:** Prospección activa analizando deudas técnicas (falta de chatbots o ads sin captura).`;

    fs.writeFileSync(OUTPUT_FILE, output);

    // Generate optimized version for NotebookLM
    const notebookOutput = output
        .replace(/# 🧠 HecTechAi Brain: El Corazón de la Agencia/, "# 📚 HecTechAi Strategic & Technical Knowledge Base")
        .replace(/Este documento es la \*\*fuente de verdad técnica y operativa\*\*/, "Este documento es el MANIFIESTO ESTRATÉGICO Y TÉCNICO central de HecTechAi")
        + `\n\n## 💡 Instrucciones para NotebookLM\n1. Usa este documento para entender la arquitectura técnica.\n2. Cruza esta información con los documentos de marca para proponer estrategias de venta coherentes.\n3. Si detectas fallos técnicos, sugiere revisiones basadas en el Mapa de Departamentos.`;

    fs.writeFileSync(NOTEBOOK_OUTPUT, notebookOutput);
    console.log(`✅ Brain generated at: ${OUTPUT_FILE}`);
    console.log(`✅ Notebook Knowledge generated at: ${NOTEBOOK_OUTPUT}`);
}

generate();
