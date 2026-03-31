export type Decision = "BUY" | "SELL" | "HOLD";
export type TradeStatus = "Pending" | "Executed" | "Rejected";

export interface FocusStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  decision: Decision;
  confidence: number;
  reasoning: string;
}

export interface TradeRecord {
  id: string;
  symbol: string;
  action: Decision;
  quantity: number;
  price: number;
  confidence: number;
  date: string;
  status: TradeStatus;
  pnl: number | null;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface RiskConfig {
  riskPerTrade: number;
  maxTradesPerDay: number;
  mode: "Conservative" | "Aggressive";
}

export const mockFocusStock: FocusStockData = {
  symbol: "NVDA",
  name: "NVIDIA Corporation",
  price: 924.79,
  change: 18.34,
  changePercent: 2.02,
  decision: "BUY",
  confidence: 87,
  reasoning:
    "Strong momentum with AI infrastructure demand accelerating. RSI at 62 indicates room for upside. Earnings beat expectations by 14%. Institutional accumulation detected on volume analysis. Risk/reward ratio favorable at current levels with support at $890.",
};

export const mockTradeHistory: TradeRecord[] = [
  { id: "1", symbol: "NVDA", action: "BUY", quantity: 15, price: 906.45, confidence: 87, date: "2026-03-31", status: "Pending", pnl: null },
  { id: "2", symbol: "AAPL", action: "SELL", quantity: 50, price: 198.22, confidence: 72, date: "2026-03-30", status: "Executed", pnl: 340.0 },
  { id: "3", symbol: "TSLA", action: "BUY", quantity: 20, price: 175.80, confidence: 65, date: "2026-03-29", status: "Executed", pnl: -120.0 },
  { id: "4", symbol: "MSFT", action: "HOLD", quantity: 0, price: 428.50, confidence: 55, date: "2026-03-28", status: "Rejected", pnl: null },
  { id: "5", symbol: "AMD", action: "BUY", quantity: 30, price: 162.30, confidence: 78, date: "2026-03-27", status: "Executed", pnl: 215.0 },
  { id: "6", symbol: "GOOGL", action: "SELL", quantity: 25, price: 158.90, confidence: 81, date: "2026-03-26", status: "Executed", pnl: 520.0 },
];

export const mockPositions: Position[] = [
  { symbol: "NVDA", quantity: 15, avgPrice: 906.45, currentPrice: 924.79, pnl: 275.1, pnlPercent: 2.02 },
  { symbol: "AAPL", quantity: 100, avgPrice: 182.50, currentPrice: 198.22, pnl: 1572.0, pnlPercent: 8.61 },
  { symbol: "TSLA", quantity: 20, avgPrice: 175.80, currentPrice: 169.50, pnl: -126.0, pnlPercent: -3.58 },
  { symbol: "AMD", quantity: 30, avgPrice: 162.30, currentPrice: 169.45, pnl: 214.5, pnlPercent: 4.41 },
];

export const defaultRiskConfig: RiskConfig = {
  riskPerTrade: 2,
  maxTradesPerDay: 3,
  mode: "Conservative",
};
