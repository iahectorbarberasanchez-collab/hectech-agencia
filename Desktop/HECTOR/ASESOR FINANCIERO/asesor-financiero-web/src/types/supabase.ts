export interface PortfolioAsset {
  id?: string;
  user_id: string;
  asset_name: string;
  asset_type: string;
  ticker?: string;      // Ej: AAPL, BTC-USD
  quantity?: number;    // Unidades
  purchase_price?: number; // Precio de compra medio
  allocation_percent: number;
  target_percent?: number;
  value_eur: number;
  updated_at?: string;
}

export interface Transaction {
  id?: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at?: string;
}
