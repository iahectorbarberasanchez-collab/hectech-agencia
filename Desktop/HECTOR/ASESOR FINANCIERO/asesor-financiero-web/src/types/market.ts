export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange: string;
  name: string;
  type: string;
  timestamp: string | Date;
}
