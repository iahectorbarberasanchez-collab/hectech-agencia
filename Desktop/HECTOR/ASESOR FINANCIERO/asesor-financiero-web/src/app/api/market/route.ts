import { NextResponse } from 'next/server';
import { getMarketData } from '@/lib/market-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    
    let symbols = ['BTC', 'ETH', '^GSPC', '^IBEX', 'AAPL', 'SAN.MC'];
    if (symbolsParam) {
      symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
    }

    const data = await getMarketData(symbols);

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No se pudieron obtener datos de mercado' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
