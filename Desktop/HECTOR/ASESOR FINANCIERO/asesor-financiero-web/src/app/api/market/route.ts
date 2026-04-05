import { NextResponse } from 'next/server';
import { getMarketData } from '@/lib/market-data';

export const dynamic = 'force-dynamic';

// In-memory cache: key = comma-separated symbols, value = { data, timestamp }
const marketCache = new Map<string, { data: ReturnType<typeof getMarketData> extends Promise<infer T> ? T : never; ts: number }>();
const CACHE_TTL_MS = 60_000; // 60 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    let symbols = ['BTC', 'ETH', '^GSPC', '^IBEX', 'AAPL', 'SAN.MC'];
    if (symbolsParam) {
      symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
    }

    const cacheKey = symbols.join(',');
    const cached = marketCache.get(cacheKey);

    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        timestamp: new Date(cached.ts).toISOString(),
        cached: true,
      });
    }

    const data = await getMarketData(symbols);

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No se pudieron obtener datos de mercado' }, { status: 500 });
    }

    // Store in cache
    marketCache.set(cacheKey, { data, ts: Date.now() });

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Market API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
