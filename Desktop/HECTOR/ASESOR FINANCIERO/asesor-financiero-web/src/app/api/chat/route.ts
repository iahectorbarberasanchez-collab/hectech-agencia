import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// El TEMP_USER_ID ha sido removido forzando el uso del userId dinámico de la sesión.
import { FISCAL_DATA_ES } from '@/lib/fiscal-data-es';
import { getMarketData } from '@/lib/market-data';
import { runOptimization } from '@/lib/tax-calculator';

// Permitimos respuestas de hasta 30 segundos
export const maxDuration = 30;

const SYSTEM_PROMPT = `
Eres el Asesor Financiero Premium, diseñado para ofrecer la más alta calidad en asesoramiento patrimonial, económico y de trading. Tu conocimiento es enciclopédico y tu tono es altamente profesional, directo, analítico y persuasivo, propio del mejor gestor de fondos o analista macroeconómico.

Tus áreas de máximo "expertise" incluyen:
1. **Salud Financiera Personal:** Presupuestos, análisis de flujo de caja, tasa de ahorro (regla 50/30/20, regla del 4%), creación de fondos de emergencia estructurados y erradicación implacable de deuda tóxica (>6% TAE).
2. **Inversión Estratégica (Filosofía de Grandes Maestros):** Dominas el corto, medio y largo plazo. 
   - **Warren Buffett & Charlie Munger:** Buscas empresas con "Moats" (fosos defensivos) claros, excelente equipo gestor, ROE alto y baja deuda. Aplicas el concepto de "Margin of Safety" (Margen de Seguridad) y Latticework of Mental Models.
   - **Peter Lynch:** Buscas crecimiento a un precio razonable (GARP), entiendes el ratio PEG y valoras lo que el usuario conoce ("Invest in what you know").
   - **Ray Dalio:** Entiendes la paridad de riesgo y los ciclos económicos (Deleveraging).
3. **Trading Avanzado:** Eres un maestro en la gestión de riesgo (Risk/Reward, Position Sizing, Drawdown), psicología del trading y mecánica de mercados (liquidez, order flow).
4. **Análisis Técnico:** Lees la acción del precio de forma experta. Dominas soportes, resistencias, medias móviles, osciladores (RSI, MACD), retrocesos de Fibonacci, volumen, y estructuras de Wyckoff. Eres capaz de identificar niveles críticos para entradas/salidas.
5. **Análisis Fundamental:** Destripas balances corporativos, cuentas de resultados y flujos de caja. Entiendes a la perfección métricas como PER, Forward P/E, PEG, RoE, FCF yield, márgenes operativos y ventajas competitivas cruzadas (Moats).
6. **Geopolítica y Macroeconomía:** Tienes el radar puesto en el mundo. Entiendes al instante cómo una decisión de tipos de interés (FED/BCE), datos de IPC/NFP o tensiones bélicas afectan a la renta fija, renta variable, materias primas (Oro/Petróleo) y divisas. Además, sabes decirle al usuario exactamente cómo reposicionar o proteger su cartera ante esos eventos.
7. **Fiscalidad en España (Campaña 2026 / Ejercicio 2025):** Tienes acceso a los datos fiscales actualizados para la presente campaña de la Renta. Utilízalos para asesorar sobre optimización fiscal, cálculo de IRPF (incluyendo el nuevo tramo del ahorro al 30%), cuotas de autónomos definitivas de 2025 e IVA vigente. Siempre sé preciso con las cifras.

**Datos Fiscales de Referencia (España - Ejercicio 2025):**
${JSON.stringify(FISCAL_DATA_ES, null, 2)}

**Tus Reglas de Interacción:**
- Si un cliente te pide acciones con potencial, utiliza este esquema de JUSTIFICACIÓN OBLIGATORIO:
  1. **Tesis de Inversion:** Por qué este activo ahora (Macro + Sector).
  2. **Análisis de Calidad (Buffett/Munger):** ¿Tiene moat? ¿Cómo son sus márgenes y su ROIC?
  3. **Valoración (Lynch/Value):** ¿Está barata por fundamentales? (P/E, EV/EBITDA vs historial).
  4. **Cuadro Técnico:** Niveles clave de entrada (Soportes) y Stop Loss sugerido.
  5. **Riesgos:** Qué puede invalidar la tesis.
- Si un cliente te da sus ingresos y gastos, actúa como planificador financiero: dale una auditoría severa pero constructiva y define su Tasa de Ahorro y plan de ruta hacia su independencia financiera.
- Ante preguntas sobre impuestos en España, utiliza los datos de referencia proporcionados para dar cifras exactas.
- Ante preguntas macroeconómicas o geopolíticas, usa el pensamiento de segundo y tercer nivel ("second-order thinking"). Explica el suceso, pero céntrate en cómo impacta al dinero y qué activos se benefician o perjudican.
- Ante dudas sobre un activo (acción, cripto, índice), ofrece una visión híbrida: valoración fundamental (está caro o barato) + cuadro técnico (niveles clave de compra o venta).
- Expresa tus convicciones de forma asertiva usando datos numéricos, porcentajes históricos y marcos probabilísticos. Sé contundente sin dejar de incluir un breve 'disclaimer' indicando que toda inversión conlleva riesgos. Nunca des respuestas excesivamente genéricas o cautelosas.
- **Gestión de Documentos:** Si el usuario sube un Excel o PDF, analízalo a fondo. Una vez que confirmes que has leído los datos "a la perfección" y los has analizado, ofrécele al usuario guardarlos en su perfil permanentemente usando el tool \`save_financial_document\`. No lo hagas sin su consentimiento.
- **Datos de Mercado en Tiempo Real:** Tienes acceso a la herramienta \`get_market_data\`. Úsala SIEMPRE que el usuario pregunte por el precio actual de un activo, ticker o cripto, o cuando necesites actualizar los precios de una cartera analizada desde un documento para dar un análisis veraz y actual. No inventes precios; usa la herramienta.
- **Optimización Fiscal:** Si el usuario pregunta por impuestos, cómo pagar menos, o quieres darle un valor añadido tras analizar sus ingresos, usa \`calculate_tax_optimization\`. Esto generará una comparativa visual potente entre su estado actual y uno optimizado (usando planes de pensiones o compensación de pérdidas).
`.trim();
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { messages, userId, financialData, financialSummary, documentText } = await req.json();

    if (!userId) {
      console.error("No userId provided in chat request");
      return new Response("Unauthorized: No userId provided", { status: 401 });
    }

    const [
      { data: profile },
      { data: portfolio },
      { data: incomeHistory },
      { data: transactions },
    ] = await Promise.all([
      supabase
        .from('user_financial_profile')
        .select('occupation,monthly_income_range,monthly_income_exact,financial_goal,knowledge_level,risk_tolerance,other_notes')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_portfolio')
        .select('asset_name,asset_type,value_eur,target_percent')
        .eq('user_id', userId),
      supabase
        .from('user_income_history')
        .select('month,year,amount,source,description')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(6),
      supabase
        .from('user_transactions')
        .select('date,description,type,amount,category')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(20)
    ]);

    // Si existen datos financieros del dashboard (Excel subido), le damos contexto extra a la IA
    const contextualMessages = [...messages];
    
    if (profile) {
      const memoryPrompt = `
MEMORIA DEL USUARIO (Lo que sabes de él):
- Ocupación: ${profile.occupation || 'No especificada'}
- Rango de Ingresos: ${profile.monthly_income_range || 'No especificado'}
- Último Ingreso Exacto: ${profile.monthly_income_exact ? `${profile.monthly_income_exact}€` : 'No especificado'}
- Objetivo: ${profile.financial_goal || 'No especificado'}
- Conocimiento: ${profile.knowledge_level || 'No especificado'}
- Riesgo: ${profile.risk_tolerance || 'No especificado'}
- Notas extra: ${profile.other_notes || 'Ninguna'}

Utiliza esta memoria para que tus respuestas sean coherentes con su situación actual.
      `.trim();

      contextualMessages.unshift({
        role: "system",
        content: memoryPrompt
      });
    }

    if (incomeHistory && incomeHistory.length > 0) {
      const historyPrompt = `
HISTORIAL DE INGRESOS (Nóminas/Sueldos):
${incomeHistory.map((h: any) => `- ${h.month}/${h.year}: ${h.amount}€ (${h.source}${h.description ? ` - ${h.description}` : ''})`).join('\n')}
      `.trim();

      contextualMessages.unshift({
        role: "system",
        content: historyPrompt
      });
    }

    if (transactions && transactions.length > 0) {
      const transPrompt = `
TRANSACCIONES RECIENTES (Manuales):
${transactions.map((t: any) => `- [${t.date}] ${t.description}: ${t.type === 'income' ? '+' : '-'}${t.amount}€ (Categoría: ${t.category})`).join('\n')}

Utiliza esta lista de transacciones manuales para analizar el flujo de caja, gastos recurrentes y balance neto.
      `.trim();

      contextualMessages.unshift({
        role: "system",
        content: transPrompt
      });
    }

    if (portfolio && portfolio.length > 0) {
      const totalValue = portfolio.reduce((sum: number, a: any) => sum + a.value_eur, 0);
      const portfolioPrompt = `
CARTERA ACTUAL DEL USUARIO:
${portfolio.map((a: any) => `- ${a.asset_name} (${a.asset_type}): ${a.value_eur}€ (${((a.value_eur/totalValue)*100).toFixed(1)}%). Objetivo: ${a.target_percent || 'No definido'}%`).join('\n')}
Valor Total: ${totalValue}€

Instrucciones de Rebalanceo:
1. Si el usuario pregunta por su cartera, analiza las desviaciones (Drift) entre la asignación actual y la objetivo.
2. Calcula exactamente cuánto debe comprar o vender de cada activo para volver al objetivo.
3. Si no hay objetivos definidos, sugiere una distribución basada en su perfil de riesgo (${profile?.risk_tolerance || 'moderado'}).
4. Sé extremadamente preciso con las cantidades en euros.
      `.trim();

      contextualMessages.unshift({
        role: "system",
        content: portfolioPrompt
      });
    }

    if (financialData && Object.keys(financialData).length > 0) {
      // PRE-CALCULATED TOTALS (from all summary tables)
      const dataSheets = financialData as Record<string, any>;
      
      const summarySections = Object.entries(dataSheets).flatMap(([sheetName, sheet]) => {
        return (sheet.tables || [])
          .filter((t: any) => t.type === 'summary')
          .map((table: any) => {
            const headers = table.columns;
            const mdTable = [
              `| ${headers.join(' | ')} |`,
              `| ${headers.map(() => '---').join(' | ')} |`,
              ...table.data.map((row: any) => `| ${headers.map((h: any) => row[h] ?? '').join(' | ')} |`)
            ].join('\n');
            return `#### TABLA DE RESUMEN: ${table.name} (en ${sheetName})\nMap de columnas: ${JSON.stringify(table.columnMap || {})}\n${mdTable}`;
          });
      }).join('\n\n');

      // DETAILED DATA (Sample of rows from detailed tables)
      const detailedSections = Object.entries(dataSheets).flatMap(([sheetName, sheet]) => {
        return (sheet.tables || [])
          .filter((t: any) => t.type !== 'summary')
          .map((table: any) => {
            const headers = table.columns;
            const rowLimit = 15;
            const displayRows = table.data.slice(0, rowLimit);
            
            const mdTable = [
              `| ${headers.join(' | ')} |`,
              `| ${headers.map(() => '---').join(' | ')} |`,
              ...displayRows.map((row: any) => `| ${headers.map((h: any) => row[h] ?? '').join(' | ')} |`)
            ].join('\n');

            return `### DETALLE: ${table.name} (en ${sheetName})\nMap de columnas: ${JSON.stringify(table.columnMap || {})}\n${mdTable}${table.data.length > rowLimit ? `\n*(Se muestran solo las primeras ${rowLimit} de ${table.data.length} filas)*` : ""}`;
          });
      }).join("\n\n");

      const dataPrompt = `
DATOS FINANCIEROS DEL USUARIO (RESUMEN ESTRUCTURADO):
Esta sección contiene tablas de resumen encontradas en el documento e identificadas automáticamente:
${summarySections || "*(No se encontraron tablas de resumen específicas)*"}

DETALLE DE OPERACIONES (MUESTRA):
${detailedSections}

INSTRUCCIONES DE ANÁLISIS FINANCIERO DE PRECISIÓN (PORTFOLIO):
1. **Mapeo de Columnas:** Cada tabla incluye un "Map de columnas". Úsalo para identificar qué columna del Excel corresponde a:
   - \`asset_name\`: El nombre o ticker del activo.
   - \`quantity\`: La cantidad total de unidades/acciones.
   - \`avg_price\`: El Precio Medio de Compra (PMC).
   - \`total_invested\`: El capital total depositado en ese activo.
2. **Cálculos en Tiempo Real:** Ignora el "Precio Actual" o "Valor Actual" que pueda venir en el Excel si tienes información de mercado más reciente. Calcula tú mismo:
   - **Valor Actual** = \`quantity\` * [Precio de mercado actual que tú conozcas]
   - **Beneficio Bruto (€)** = **Valor Actual** - \`total_invested\`
   - **Rentabilidad (%)** = (**Beneficio Bruto** / \`total_invested\`) * 100
3. **Ponderación (Weights):** Calcula el peso de cada activo respecto al Valor Total de la cartera que calcules.
4. **Resumen de Cartera:** Si el usuario pregunta por su cartera, genera una tabla limpia con estas columnas calculadas por ti.
5. **Prioridad de Resumen:** Usa las "TABLA DE RESUMEN" para totales generales.
6. **Relación entre Tablas:** Cruza datos de detalle con resúmenes si es necesario para mayor precisión.
      `.trim();

      contextualMessages.unshift({
        role: "system",
        content: dataPrompt
      });
    }



    if (documentText) {
      const documentPrompt = `
DOCUMENTO EXTRAÍDO (POSIBLE NÓMINA):
Aquí tienes el texto extraído de un documento (PDF) subido por el usuario:
---
${documentText.substring(0, 5000)}
---

INSTRUCCIONES PARA NÓMINAS:
1. Analiza si este documento es una nómina española. Busca términos como "Líquido a percibir", "Total devengado", "Periodo de liquidación", "Deducciones", "IRPF", "Seguridad Social".
2. Si es una nómina, identifica el MES y AÑO (ej: Marzo 2026) y la CUANTÍA COBRADA (Líquido a percibir).
3. Informa al usuario: "He detectado tu nómina de [Mes] de [Año] por un importe neto de [Cantidad]€".
4. Pregúntale si quieres que la registre en su historial de ingresos. Si acepta (o si parece implícito), usa el tool 'record_income_history'.
5. Si ves discrepancias o datos incompletos, pide aclaración.
      `.trim();

      contextualMessages.unshift({
        role: "system",
        content: documentPrompt
      });
    }

    const result = await streamText({
      model: googleProvider('gemini-2.0-flash'),
      system: SYSTEM_PROMPT,
      messages: contextualMessages,
      tools: {
        update_user_memory: {
          description: 'Actualiza la información financiera permanente del usuario (empleo, ingresos, objetivos, etc.) en su memoria.',
          inputSchema: z.object({
            occupation: z.string().optional().describe('El puesto de trabajo o profesión del usuario'),
            monthly_income_range: z.string().optional().describe('El rango de ingresos (ej: 2000-3000€)'),
            monthly_income_exact: z.number().optional().describe('La cantidad exacta de ingresos mensuales'),
            financial_goal: z.string().optional().describe('El objetivo financiero principal'),
            other_notes: z.string().optional().describe('Cualquier otra información relevante mencionada por el usuario'),
          }),
          execute: async (args: any) => {
            const { error } = await supabase
              .from('user_financial_profile')
              .upsert({ user_id: userId, ...args, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
            return error ? { success: false, error: error.message } : { success: true, updatedFields: Object.keys(args) };
          },
        },
        record_income_history: {
          description: 'Registra un ingreso específico (nómina, bonus, extras) en el historial del usuario vinculándolo a un mes y año.',
          inputSchema: z.object({
            amount: z.number().describe('Importe neto del ingreso'),
            month: z.number().min(1).max(12).describe('Mes del ingreso (1-12)'),
            year: z.number().describe('Año del ingreso (ej: 2026)'),
            description: z.string().optional().describe('Descripción breve (ej: Nómina regular, Bonus transporte)'),
            source: z.string().optional().describe('Origen del ingreso (default: payslip)'),
          }),
          execute: async (args: any) => {
            const { error } = await supabase
              .from('user_income_history')
              .insert({ user_id: userId, ...args });
            
            // También actualizamos el ingreso exacto en el perfil principal si es el más reciente
            if (!error) {
              await supabase
                .from('user_financial_profile')
                .update({ monthly_income_exact: args.amount, updated_at: new Date().toISOString() })
                .eq('user_id', userId);
            }

            return error ? { success: false, error: error.message } : { success: true, ...args };
          },
        },
        update_portfolio_target: {
          description: 'Actualiza el porcentaje objetivo de un activo en la cartera del usuario.',
          inputSchema: z.object({
            asset_name: z.string().describe('Nombre exacto del activo'),
            target_percent: z.number().describe('Nuevo porcentaje objetivo (0-100)'),
          }),
          execute: async ({ asset_name, target_percent }: any) => {
            const { error } = await supabase
              .from('user_portfolio')
              .update({ target_percent })
              .eq('user_id', userId)
              .eq('asset_name', asset_name);
            return error ? { success: false, error: error.message } : { success: true, asset_name, target_percent };
          },
        },
        record_transaction: {
          description: 'Registra un nuevo ingreso o gasto manual en el sistema.',
          inputSchema: z.object({
            description: z.string().describe('Descripción breve del movimiento'),
            amount: z.number().describe('Importe del movimiento'),
            type: z.enum(['income', 'expense']).describe('Tipo de movimiento'),
            category: z.string().describe('Categoría (ej: Vivienda, Ocio, Salario, Otros)'),
            date: z.string().optional().describe('Fecha en formato YYYY-MM-DD (default: hoy)'),
          }),
          execute: async (args: any) => {
            const { error } = await supabase
              .from('user_transactions')
              .insert({ 
                ...args, 
                user_id: userId,
                date: args.date || new Date().toISOString().split('T')[0]
              });
            return error ? { success: false, error: error.message } : { success: true, ...args };
          },
        },
        save_financial_document: {
          description: 'Guarda el documento financiero actual (Excel/PDF) en el perfil del usuario para futuras sesiones. Úsalo solo cuando el usuario lo pida o cuando hayas analizado los datos correctamente y el usuario acepte guardarlos.',
          inputSchema: z.object({
            is_verified: z.boolean().describe('Si el documento ha sido verificado como correcto por el asesor'),
          }),
          execute: async ({ is_verified }: any) => {
            if (!financialSummary) return { success: false, error: 'No hay documento cargado para guardar.' };
            
            const payload = {
              user_id: userId,
              file_name: financialSummary.fileName,
              file_type: financialSummary.fileType,
              data: financialSummary.fileType === 'pdf' ? documentText : financialData,
              summary: financialSummary,
              is_verified: is_verified,
              updated_at: new Date().toISOString()
            };

            const { error } = await supabase
              .from('user_financial_documents')
              .upsert(payload, { onConflict: 'user_id' });

            return error 
              ? { success: false, error: error.message } 
              : { success: true, message: `Documento '${financialSummary.fileName}' guardado correctamente en tu perfil.` };
          },
        },
        get_market_data: {
          description: 'Obtiene precios y datos de mercado en tiempo real para uno o varios activos (acciones, ETFs, cripto, índices).',
          inputSchema: z.object({
            symbols: z.array(z.string()).describe('Lista de tickers o símbolos a consultar (ej: ["AAPL", "BTC", "SAN.MC"])'),
          }),
          execute: async ({ symbols }: { symbols: string[] }) => {
            console.log(`Fetching market data for: ${symbols.join(', ')}`);
            const data = await getMarketData(symbols);
            return data.length > 0 ? { success: true, data } : { success: false, error: 'No se pudieron encontrar los datos para esos símbolos.' };
          },
        },
        show_portfolio_distribution: {
          description: 'Muestra un gráfico visual de la distribución actual de la cartera del usuario.',
          inputSchema: z.object({
             // No requiere parámetros ya que toma los datos de la sesión/contexto
          }),
          execute: async () => {
            // El componente cliente ya tiene acceso a la cartera o la IA puede devolverla estructurada aquí
            return { success: true, data: portfolio };
          },
        },
        calculate_tax_optimization: {
          description: 'Calcula el impacto fiscal (IRPF y Ahorro) y propone estrategias de optimización para el sistema español (2025).',
          inputSchema: z.object({
            income: z.number().describe('Ingresos brutos anuales estimados.'),
            gains: z.number().optional().describe('Ganancias patrimoniales obtenidas (ventas con beneficio).'),
            losses: z.number().optional().describe('Pérdidas patrimoniales obtenidas (ventas con pérdida).'),
          }),
          execute: async ({ income, gains = 0, losses = 0 }: { income: number, gains?: number, losses?: number }) => {
            const data = runOptimization(income, gains, losses);
            return { success: true, data };
          },
        },
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error in chat AI route:", error);
    
    let availableModels = "Could not list models";
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');
      // This is a guess at the API, might need to be adjusted
      // But we can just try to return a better error
    } catch (e) {}

    return new Response(JSON.stringify({ 
      error: "Error procesando la solicitud a la IA", 
      details: error.message,
      availableModels,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
