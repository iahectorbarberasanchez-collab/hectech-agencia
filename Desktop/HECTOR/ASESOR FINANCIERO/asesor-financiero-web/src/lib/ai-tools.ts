import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';
import { getMarketData } from './market-data';
import { getMacroMarketData, formatMacroForAI } from './macro-data';
import { MACRO_SNAPSHOT, getMacroSummaryText } from './macro-snapshot';
import { runOptimization } from './tax-calculator';
import { extractAssetsFromSummary } from './asset-extractor';

/**
 * Definición de todas las Tools del Asesor Financiero.
 * Extraídas de api/chat/route.ts para facilitar mantenimiento.
 *
 * @param supabase - Cliente de Supabase autenticado (server-side)
 * @param userId - ID del usuario autenticado
 * @param financialData - Datos del documento financiero activo (Excel parseado)
 * @param financialSummary - Resumen del documento financiero activo
 * @param documentText - Texto extraído del PDF activo
 * @param portfolio - Datos de la cartera del usuario
 */
export function buildAITools(params: {
  supabase: SupabaseClient;
  userId: string;
  financialData: Record<string, unknown> | null;
  financialSummary: Record<string, unknown> | null;
  documentText: string | null;
  portfolio: Record<string, unknown>[] | null;
}) {
  const { supabase, userId, financialData, financialSummary, documentText, portfolio } = params;

  return {
    update_user_memory: {
      description: 'Actualiza la información financiera permanente del usuario (empleo, ingresos, objetivos, etc.) en su memoria.',
      inputSchema: z.object({
        occupation: z.string().optional().describe('El puesto de trabajo o profesión del usuario'),
        monthly_income_range: z.string().optional().describe('El rango de ingresos (ej: 2000-3000€)'),
        monthly_income_exact: z.number().optional().describe('La cantidad exacta de ingresos mensuales'),
        monthly_expenses: z.number().optional().describe('Gastos mensuales habituales'),
        savings_rate: z.number().optional().describe('Porcentaje de ahorro mensual sobre ingresos (0-100)'),
        financial_goal: z.string().optional().describe('El objetivo financiero principal'),
        risk_tolerance: z.enum(['low', 'medium', 'high']).optional().describe('Tolerancia al riesgo: low, medium o high'),
        investment_experience: z.enum(['none', 'basic', 'intermediate', 'advanced']).optional().describe('Experiencia previa en inversiones'),
        preferred_assets: z.array(z.string()).optional().describe('Tipos de activos preferidos (ej: acciones, ETFs, cripto)'),
        retirement_age: z.number().optional().describe('Edad deseada de jubilación'),
        other_notes: z.string().optional().describe('Cualquier otra información relevante mencionada por el usuario'),
      }),
      execute: async (args: Record<string, unknown>) => {
        const { error } = await supabase
          .from('user_financial_profile')
          .upsert(
            { 
              user_id: userId, 
              ...args, 
              updated_at: new Date().toISOString() 
            }, 
            { onConflict: 'user_id' }
          );
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
      execute: async (args: Record<string, unknown>) => {
        const { error } = await supabase
          .from('user_income_history')
          .insert({ user_id: userId, ...args });

        if (!error) {
          await supabase
            .from('user_financial_profile')
            .upsert({ 
              user_id: userId,
              monthly_income_exact: args.amount, 
              updated_at: new Date().toISOString() 
            }, { onConflict: 'user_id' });
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
      execute: async ({ asset_name, target_percent }: { asset_name: string; target_percent: number }) => {
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
      execute: async (args: Record<string, unknown>) => {
        const { error } = await supabase
          .from('user_transactions')
          .insert({
            ...args,
            user_id: userId,
            date: args.date || new Date().toISOString().split('T')[0],
          });
        return error ? { success: false, error: error.message } : { success: true, ...args };
      },
    },

    save_financial_document: {
      description:
        'Guarda el documento financiero actual (Excel/PDF) en el perfil del usuario para futuras sesiones. Úsalo solo cuando el usuario lo pida o cuando hayas analizado los datos correctamente y el usuario acepte guardarlos.',
      inputSchema: z.object({
        is_verified: z.boolean().describe('Si el documento ha sido verificado como correcto por el asesor'),
      }),
      execute: async ({ is_verified }: { is_verified: boolean }) => {
        if (!financialSummary) return { success: false, error: 'No hay documento cargado para guardar.' };

        const payload = {
          user_id: userId,
          file_name: (financialSummary as Record<string, unknown>).fileName,
          file_type: (financialSummary as Record<string, unknown>).fileType,
          data: (financialSummary as Record<string, unknown>).fileType === 'pdf' ? documentText : financialData,
          summary: financialSummary,
          is_verified,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('user_financial_documents')
          .upsert(payload, { onConflict: 'user_id' });

        return error
          ? { success: false, error: error.message }
          : { success: true, message: `Documento '${(financialSummary as Record<string, unknown>).fileName}' guardado correctamente en tu perfil.` };
      },
    },

    save_extracted_assets_to_portfolio: {
      description: 'Extrae y guarda (o actualiza) automáticamente las posiciones y activos detectados en el documento financiero actual (Excel) en la cartera ("mis inversiones") del usuario.',
      inputSchema: z.object({
        is_verified: z.boolean().describe('Confirma que has analizado y verificado que el documento contiene activos de cartera.'),
      }),
      execute: async ({ is_verified }: { is_verified: boolean }) => {
        if (!financialSummary) return { success: false, error: 'No hay documento cargado para extraer activos.' };

        const extracted = extractAssetsFromSummary(financialSummary as any);
        if (!extracted || extracted.length === 0) {
          return { success: false, error: 'No se encontraron activos o posiciones para guardar en el documento.' };
        }
        
        try {
          const { error: deleteError } = await supabase
            .from('user_portfolio')
            .delete()
            .eq('user_id', userId);

          if (deleteError) throw deleteError;

          const payload = extracted.map(a => ({
            ...a,
            user_id: userId,
            updated_at: new Date().toISOString(),
          }));

          const { data, error } = await supabase
            .from('user_portfolio')
            .insert(payload)
            .select();

          if (error) throw error;
          return { 
            success: true, 
            message: `Se han guardado/sincronizado ${data?.length || extracted.length} posiciones en tu cartera ('mis inversiones') correctamente.` 
          };
        } catch (err: any) {
          return { success: false, error: err.message || 'Error al guardar en la base de datos.' };
        }
      },
    },

    get_market_data: {
      description:
        'Obtiene precios y datos de mercado en tiempo real para uno o varios activos (acciones, ETFs, cripto, índices).',
      inputSchema: z.object({
        symbols: z
          .array(z.string())
          .describe('Lista de tickers o símbolos a consultar (ej: ["AAPL", "BTC", "SAN.MC"])'),
      }),
      execute: async ({ symbols }: { symbols: string[] }) => {
        console.log(`Fetching market data for: ${symbols.join(', ')}`);
        const data = await getMarketData(symbols);
        return data.length > 0
          ? { success: true, data }
          : { success: false, error: 'No se pudieron encontrar los datos para esos símbolos.' };
      },
    },

    show_portfolio_distribution: {
      description: 'Muestra un gráfico visual de la distribución actual de la cartera del usuario.',
      inputSchema: z.object({}),
      execute: async () => {
        return { success: true, data: portfolio };
      },
    },

    calculate_tax_optimization: {
      description:
        'Calcula el impacto fiscal (IRPF y Ahorro) y propone estrategias de optimización para el sistema español (2025).',
      inputSchema: z.object({
        income: z.number().describe('Ingresos brutos anuales estimados.'),
        gains: z.number().optional().describe('Ganancias patrimoniales obtenidas (ventas con beneficio).'),
        losses: z.number().optional().describe('Pérdidas patrimoniales obtenidas (ventas con pérdida).'),
      }),
      execute: async ({ income, gains = 0, losses = 0 }: { income: number; gains?: number; losses?: number }) => {
        const data = runOptimization(income, gains, losses);
        return { success: true, data };
      },
    },

    get_macro_context: {
      description:
        'Obtiene el contexto macroeconómico completo y actualizado: datos de mercado en tiempo real (VIX, yields, índices, FX, commodities) + indicadores económicos estáticos (Fed rate, CPI, PCE, BCE, Euribor, PIB, desempleo). Úsalo cuando el usuario pregunte sobre macro, entorno de mercado, economía global, tipos de interés, inflación, o cuando quieras contextualizar tus análisis con el entorno actual.',
      inputSchema: z.object({
        focus: z
          .enum(['full', 'market', 'economic', 'spain', 'us', 'europe'])
          .optional()
          .describe('Qué parte del contexto macro mostrar: full (todo), market (solo datos de mercado en vivo), economic (solo indicadores económicos), spain (España específico), us (EEUU), europe (Europa)'),
      }),
      execute: async ({ focus = 'full' }: { focus?: 'full' | 'market' | 'economic' | 'spain' | 'us' | 'europe' }) => {
        try {
          const liveData = await getMacroMarketData();
          const liveText = formatMacroForAI(liveData);

          let economicText = '';
          if (focus === 'full' || focus === 'economic') {
            economicText = getMacroSummaryText();
          } else if (focus === 'spain') {
            const s = MACRO_SNAPSHOT.spain;
            economicText = `=== ESPAÑA ===\n${Object.values(s).map(i => `• ${i.label}: ${i.value} — ${i.note}`).join('\n')}`;
          } else if (focus === 'us') {
            const s = MACRO_SNAPSHOT.us;
            economicText = `=== EEUU ===\n${Object.values(s).map(i => `• ${i.label}: ${i.value} — ${i.note}`).join('\n')}`;
          } else if (focus === 'europe') {
            const s = MACRO_SNAPSHOT.europe;
            economicText = `=== EUROPA ===\n${Object.values(s).map(i => `• ${i.label}: ${i.value} — ${i.note}`).join('\n')}`;
          }

          const includeMarket = focus === 'full' || focus === 'market';
          const combined = [
            includeMarket ? liveText : '',
            economicText,
          ].filter(Boolean).join('\n\n');

          return {
            success: true,
            data: {
              liveMarket: liveData,
              snapshot: focus !== 'market' ? MACRO_SNAPSHOT : null,
              text: combined,
              sentiment: liveData.marketSentiment,
              lastUpdated: {
                marketData: liveData.timestamp,
                economicSnapshot: MACRO_SNAPSHOT.lastUpdated,
              },
            },
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: `Error obteniendo datos macro: ${message}` };
        }
      },
    },

    calculate_portfolio_performance: {
      description:
        'Calcula el rendimiento actual de toda la cartera del usuario: obtiene precios de mercado en tiempo real para cada activo y compara con el precio de compra para mostrar ganancia/pérdida por posición y total.',
      inputSchema: z.object({}),
      execute: async () => {
        if (!portfolio || portfolio.length === 0) {
          return { success: false, error: 'No hay activos guardados en la cartera. Sube un Excel con tus inversiones primero.' };
        }

        // Collect all tickers (skip empty ones)
        const tickers = (portfolio as Record<string, unknown>[])
          .map(a => String(a.ticker || '').trim().toUpperCase())
          .filter(t => t !== '' && t !== 'UNDEFINED');

        // Fetch real-time quotes for all tickers at once
        const quotes = tickers.length > 0 ? await getMarketData(tickers) : [];

        // Build a lookup map: normalised ticker → quote
        const quoteMap = new Map<string, typeof quotes[0]>();
        for (const q of quotes) {
          // Store under original symbol and stripped versions for fuzzy matching
          quoteMap.set(q.symbol.toUpperCase(), q);
          quoteMap.set(q.symbol.replace('-USD', '').replace('.MC', '').toUpperCase(), q);
        }

        let totalInvested = 0;
        let totalCurrentValue = 0;

        const positions = (portfolio as Record<string, unknown>[]).map(asset => {
          const ticker = String(asset.ticker || '').trim().toUpperCase();
          const qty = Number(asset.quantity) || 0;
          const avgPrice = Number(asset.purchase_price) || 0;
          const investedFromExcel = Number(asset.value_eur) || 0;

          // Capital invested: prefer qty × avg_price, fall back to value_eur from Excel
          const invested = (qty > 0 && avgPrice > 0) ? qty * avgPrice : investedFromExcel;

          // Look up quote
          const quote = quoteMap.get(ticker) || quoteMap.get(ticker.replace('.MC', '').replace('-USD', ''));
          const currentPrice = quote?.price ?? 0;

          // Current value: prefer qty × market_price, fall back to invested (no price change assumed)
          const currentValue = (qty > 0 && currentPrice > 0)
            ? qty * currentPrice
            : (currentPrice > 0 ? currentPrice : invested);

          const pnlEur = currentValue - invested;
          const pnlPct = invested > 0 ? (pnlEur / invested) * 100 : 0;

          totalInvested += invested;
          totalCurrentValue += currentValue;

          return {
            asset_name: String(asset.asset_name || ''),
            ticker: ticker || '—',
            asset_type: String(asset.asset_type || ''),
            quantity: qty || null,
            purchase_price: avgPrice || null,
            current_price: currentPrice || null,
            invested_eur: Number(invested.toFixed(2)),
            current_value_eur: Number(currentValue.toFixed(2)),
            pnl_eur: Number(pnlEur.toFixed(2)),
            pnl_percent: Number(pnlPct.toFixed(2)),
            status: pnlEur >= 0 ? '✅ positivo' : '❌ negativo',
            market_data_available: !!quote,
          };
        });

        const totalPnlEur = totalCurrentValue - totalInvested;
        const totalPnlPct = totalInvested > 0 ? (totalPnlEur / totalInvested) * 100 : 0;

        return {
          success: true,
          data: {
            positions,
            summary: {
              total_invested_eur: Number(totalInvested.toFixed(2)),
              total_current_value_eur: Number(totalCurrentValue.toFixed(2)),
              total_pnl_eur: Number(totalPnlEur.toFixed(2)),
              total_pnl_percent: Number(totalPnlPct.toFixed(2)),
              overall_status: totalPnlEur >= 0 ? '✅ EN POSITIVO' : '❌ EN NEGATIVO',
              positions_count: positions.length,
              positions_with_market_data: positions.filter(p => p.market_data_available).length,
            },
          },
        };
      },
    },
  };
}
