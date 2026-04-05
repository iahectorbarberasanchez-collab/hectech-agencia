import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';
import { getMarketData } from './market-data';
import { getMacroMarketData, formatMacroForAI } from './macro-data';
import { MACRO_SNAPSHOT, getMacroSummaryText } from './macro-snapshot';
import { runOptimization } from './tax-calculator';
import { extractAssetsFromSummary } from './asset-extractor';
import { simulateWhatIf, WhatIfEvent } from './what-if-simulator';
import { projectCashFlow, IncomeRecord, Transaction } from './cash-flow-projector';

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
  profile: Record<string, unknown> | null;
  incomeHistory: Record<string, unknown>[] | null;
  transactions: Record<string, unknown>[] | null;
}) {
  const { supabase, userId, financialData, financialSummary, documentText, portfolio, profile, incomeHistory, transactions } = params;

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

    simulate_what_if: {
      description:
        'Simula escenarios hipotéticos "¿qué pasaría si...?" proyectando el patrimonio neto y flujo de caja con y sin los eventos indicados. Úsalo cuando el usuario quiera saber el impacto de comprar una casa, cambiar de trabajo, tener un hijo, pedir una hipoteca, etc.',
      inputSchema: z.object({
        monthly_income: z.number().describe('Ingresos mensuales actuales del usuario'),
        monthly_expenses: z.number().describe('Gastos mensuales actuales del usuario'),
        current_net_worth: z.number().optional().describe('Patrimonio neto actual estimado (default: 0)'),
        events: z.array(z.object({
          description: z.string().describe('Descripción del evento hipotético'),
          one_time_cost: z.number().optional().describe('Coste o ingreso único (negativo = gasto, positivo = ingreso). Ej: -20000 para entrada piso'),
          monthly_cost_change: z.number().optional().describe('Cambio mensual recurrente (negativo = más gastos, positivo = más ingresos). Ej: -800 para hipoteca nueva'),
          months_from_now: z.number().describe('En cuántos meses ocurre el evento'),
          duration_months: z.number().optional().describe('Cuántos meses dura el cambio mensual (undefined = indefinido)'),
        })).describe('Lista de eventos hipotéticos a simular'),
        months: z.number().optional().describe('Horizonte de proyección en meses (default: 24)'),
      }),
      execute: async (args: {
        monthly_income: number;
        monthly_expenses: number;
        current_net_worth?: number;
        events: { description: string; one_time_cost?: number; monthly_cost_change?: number; months_from_now: number; duration_months?: number }[];
        months?: number;
      }) => {
        const events: WhatIfEvent[] = args.events.map(e => ({
          description: e.description,
          oneTimeCost: e.one_time_cost,
          monthlyCostChange: e.monthly_cost_change,
          monthsFromNow: e.months_from_now,
          durationMonths: e.duration_months,
        }));
        const result = simulateWhatIf({
          monthlyIncome: args.monthly_income,
          monthlyExpenses: args.monthly_expenses,
          currentNetWorth: args.current_net_worth ?? 0,
          events,
          months: args.months ?? 24,
        });
        return { success: true, data: result };
      },
    },

    project_cash_flow: {
      description:
        'Proyecta el flujo de caja predictivo para los próximos meses basándose en el historial de ingresos y transacciones del usuario. Detecta meses de riesgo (flujo negativo) y calcula la tasa de ahorro proyectada. Úsalo cuando el usuario pregunte por su situación futura, si podrá ahorrar, o si tiene riesgo financiero.',
      inputSchema: z.object({
        current_balance: z.number().optional().describe('Saldo disponible actual (para calcular cuándo se agotaría si hay tendencia negativa)'),
        months: z.number().optional().describe('Horizonte de proyección en meses (default: 12)'),
      }),
      execute: async ({ current_balance, months }: { current_balance?: number; months?: number }) => {
        const income: IncomeRecord[] = (incomeHistory || []).map(r => ({
          month: Number(r.month),
          year: Number(r.year),
          amount: Number(r.amount),
          source: String(r.source || ''),
          description: String(r.description || ''),
        }));
        const txns: Transaction[] = (transactions || []).map(t => ({
          date: String(t.date || ''),
          description: String(t.description || ''),
          type: String(t.type || ''),
          amount: Number(t.amount),
          category: String(t.category || ''),
        }));

        if (income.length === 0 && txns.length === 0) {
          return {
            success: false,
            error: 'No hay historial de ingresos ni transacciones disponibles. Pide al usuario que proporcione sus datos o suba su Excel.',
          };
        }

        const result = projectCashFlow({ incomeHistory: income, transactions: txns, currentBalance: current_balance, months });
        return { success: true, data: result };
      },
    },

    analyze_tax_loss_harvesting: {
      description:
        'Analiza la cartera para identificar oportunidades de Tax-Loss Harvesting: activos en pérdidas que se pueden vender para compensar ganancias fiscales en España (IRPF base del ahorro 19-28%). Úsalo cuando el usuario pregunte por optimización fiscal de cartera o quiera reducir su factura fiscal.',
      inputSchema: z.object({
        annual_gains: z.number().optional().describe('Ganancias patrimoniales realizadas este año (para calcular compensación)'),
      }),
      execute: async ({ annual_gains = 0 }: { annual_gains?: number }) => {
        if (!portfolio || portfolio.length === 0) {
          return { success: false, error: 'No hay cartera guardada para analizar.' };
        }

        const tickers = (portfolio as Record<string, unknown>[])
          .map(a => String(a.ticker || '').trim().toUpperCase())
          .filter(t => t !== '' && t !== 'UNDEFINED');

        const quotes = tickers.length > 0 ? await getMarketData(tickers) : [];
        const quoteMap = new Map(quotes.map(q => [q.symbol.toUpperCase(), q]));

        const harvestCandidates: {
          asset_name: string; ticker: string;
          current_price: number; purchase_price: number; quantity: number;
          unrealized_loss: number; tax_saving_estimate: number;
        }[] = [];
        let totalHarvestable = 0;

        for (const asset of portfolio as Record<string, unknown>[]) {
          const ticker = String(asset.ticker || '').toUpperCase();
          const qty = Number(asset.quantity) || 0;
          const avgPrice = Number(asset.purchase_price) || 0;
          const quote = quoteMap.get(ticker);
          if (!quote || !avgPrice || !qty) continue;

          const unrealizedPnl = (quote.price - avgPrice) * qty;
          if (unrealizedPnl < 0) {
            const loss = Math.abs(unrealizedPnl);
            // Spanish IRPF savings rate on losses: ~19% for first 6k, 21% up to 50k, 23% up to 200k, 27% up to 300k, 28% above 300k (simplified: 21%)
            const taxRate = annual_gains > 200000 ? 0.27 : annual_gains > 50000 ? 0.23 : 0.21;
            const taxSaving = Math.min(loss, annual_gains) * taxRate;
            harvestCandidates.push({
              asset_name: String(asset.asset_name || ''),
              ticker,
              current_price: quote.price,
              purchase_price: avgPrice,
              quantity: qty,
              unrealized_loss: Number((-unrealizedPnl).toFixed(2)),
              tax_saving_estimate: Number(taxSaving.toFixed(2)),
            });
            totalHarvestable += loss;
          }
        }

        harvestCandidates.sort((a, b) => b.unrealized_loss - a.unrealized_loss);

        const maxTaxSaving = Math.min(totalHarvestable, annual_gains) * 0.21;

        return {
          success: true,
          data: {
            candidates: harvestCandidates,
            total_harvestable_losses: Number(totalHarvestable.toFixed(2)),
            max_tax_saving_estimate: Number(maxTaxSaving.toFixed(2)),
            annual_gains_context: annual_gains,
            note: 'Recuerda la regla de los 2 meses en España: no puedes recomprar el mismo activo en 2 meses o se pierde la ventaja fiscal. Consulta con un asesor fiscal antes de actuar.',
          },
        };
      },
    },

    suggest_rebalancing: {
      description:
        'Analiza la cartera actual y sugiere operaciones de rebalanceo para volver a los porcentajes objetivo. Calcula cuánto comprar/vender de cada activo. Úsalo cuando el usuario pregunte si su cartera está equilibrada o qué ajustes hacer.',
      inputSchema: z.object({
        total_portfolio_value: z.number().optional().describe('Valor total actual de la cartera en EUR. Si no se provee, se calcula de la cartera guardada.'),
      }),
      execute: async ({ total_portfolio_value }: { total_portfolio_value?: number }) => {
        if (!portfolio || portfolio.length === 0) {
          return { success: false, error: 'No hay cartera guardada. Sube tu Excel primero.' };
        }

        // Get current market values
        const tickers = (portfolio as Record<string, unknown>[])
          .map(a => String(a.ticker || '').trim().toUpperCase())
          .filter(t => t !== '' && t !== 'UNDEFINED');
        const quotes = tickers.length > 0 ? await getMarketData(tickers) : [];
        const quoteMap = new Map(quotes.map(q => [q.symbol.toUpperCase(), q]));

        const positions = (portfolio as Record<string, unknown>[]).map(asset => {
          const ticker = String(asset.ticker || '').toUpperCase();
          const qty = Number(asset.quantity) || 0;
          const valueEur = Number(asset.value_eur) || 0;
          const quote = quoteMap.get(ticker);
          const currentValue = (qty > 0 && quote) ? qty * quote.price : valueEur;
          return {
            asset_name: String(asset.asset_name || ''),
            ticker,
            current_value: currentValue,
            target_percent: Number(asset.target_percent) || 0,
          };
        });

        const totalValue = total_portfolio_value ?? positions.reduce((s, p) => s + p.current_value, 0);
        if (totalValue === 0) return { success: false, error: 'No se pudo calcular el valor total de la cartera.' };

        const suggestions = positions.map(p => {
          const currentPct = totalValue > 0 ? (p.current_value / totalValue) * 100 : 0;
          const targetValue = (p.target_percent / 100) * totalValue;
          const delta = targetValue - p.current_value;
          const action = delta > 50 ? 'COMPRAR' : delta < -50 ? 'VENDER' : 'MANTENER';
          return {
            asset_name: p.asset_name,
            ticker: p.ticker,
            current_value_eur: Number(p.current_value.toFixed(2)),
            current_percent: Number(currentPct.toFixed(1)),
            target_percent: p.target_percent,
            delta_eur: Number(delta.toFixed(2)),
            action,
          };
        }).filter(s => s.action !== 'MANTENER' || Math.abs(s.delta_eur) > 10);

        const needsRebalancing = suggestions.some(s => s.action !== 'MANTENER');

        return {
          success: true,
          data: {
            total_portfolio_value_eur: Number(totalValue.toFixed(2)),
            suggestions,
            needs_rebalancing: needsRebalancing,
            summary: needsRebalancing
              ? `Tu cartera necesita ajuste. Las principales operaciones: ${suggestions.slice(0, 3).map(s => `${s.action} ${s.asset_name} (${s.delta_eur > 0 ? '+' : ''}${s.delta_eur}€)`).join(', ')}.`
              : 'Tu cartera está bien equilibrada. No se necesitan ajustes significativos.',
          },
        };
      },
    },

    get_market_sentiment: {
      description:
        'Obtiene el sentimiento actual del mercado basado en VIX, Fear & Greed index equivalente, y datos de los índices principales. Úsalo cuando el usuario pregunte si el mercado está en pánico, si es buen momento para invertir, o cuál es el mood general del mercado.',
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const liveData = await getMacroMarketData();
          const vix = liveData.vix?.price || 0;
          const sp500Change = liveData.indices.sp500?.changePercent || 0;
          const nasdaqChange = liveData.indices.nasdaq?.changePercent || 0;

          // Simple Fear & Greed proxy from VIX + market momentum
          let fearGreedScore = 50; // neutral
          if (vix > 30) fearGreedScore -= 30;
          else if (vix > 20) fearGreedScore -= 15;
          else if (vix < 15) fearGreedScore += 20;

          if (sp500Change < -2) fearGreedScore -= 15;
          else if (sp500Change > 2) fearGreedScore += 15;
          if (nasdaqChange < -3) fearGreedScore -= 10;
          else if (nasdaqChange > 3) fearGreedScore += 10;

          fearGreedScore = Math.max(0, Math.min(100, fearGreedScore));

          let label: string;
          let recommendation: string;
          if (fearGreedScore < 20) {
            label = 'MIEDO EXTREMO';
            recommendation = 'Históricamente el miedo extremo es momento de compra para inversores a largo plazo. Pero analiza si hay razones fundamentales detrás del miedo.';
          } else if (fearGreedScore < 40) {
            label = 'MIEDO';
            recommendation = 'Mercado en modo defensivo. Buena oportunidad para DCA (Dollar Cost Averaging) si tienes horizonte largo.';
          } else if (fearGreedScore < 60) {
            label = 'NEUTRAL';
            recommendation = 'Mercado equilibrado. Sigue tu estrategia habitual sin cambios bruscos.';
          } else if (fearGreedScore < 80) {
            label = 'CODICIA';
            recommendation = 'Mercado optimista. Cuidado con comprar en máximos. Considera reducir posiciones si llevas mucha ganancia.';
          } else {
            label = 'CODICIA EXTREMA';
            recommendation = 'Alerta: euforia de mercado. Alto riesgo de corrección. Warren Buffett: "Sé codicioso cuando otros tienen miedo, y temeroso cuando otros son codiciosos."';
          }

          return {
            success: true,
            data: {
              fearGreedScore,
              label,
              sentiment: liveData.marketSentiment,
              vix,
              vixInterpretation: vix > 30 ? 'Alta volatilidad (miedo)' : vix > 20 ? 'Volatilidad moderada' : 'Baja volatilidad (complacencia)',
              sp500DayChange: sp500Change,
              nasdaqDayChange: nasdaqChange,
              recommendation,
              timestamp: liveData.timestamp,
            },
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: `Error obteniendo sentimiento de mercado: ${message}` };
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
