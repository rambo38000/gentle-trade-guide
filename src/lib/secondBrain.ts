export const LESSON_CATEGORIES = [
  "Execution",
  "Entry",
  "Exit",
  "Risk Management",
  "Psychology",
  "Market Conditions",
] as const;

export type LessonCategory = (typeof LESSON_CATEGORIES)[number];

export const TRADE_STATUSES = ["OPEN", "CLOSED", "CANCELLED"] as const;
export const TRADE_SIDES = ["LONG", "SHORT"] as const;
export const WATCHLIST_STATUSES = ["Active", "Watching", "Archived"] as const;

export const CARD_TYPES = ["Day Trade", "Swing Trade"] as const;
export const CARD_STATUSES = ["Planned", "Active", "Closed", "Cancelled"] as const;
export const DECISIONS = ["BUY", "DO NOT BUY", "HOLD", "EXIT"] as const;
export const OUTCOMES = ["Correct", "Incorrect", "Unknown"] as const;

export interface ActiveTradeCard {
  id: string;
  symbol: string;
  trade_type: string;
  entry_price: number | null;
  stop_price: number | null;
  thesis: string | null;
  invalidation_level: string | null;
  target_1: number | null;
  target_2: number | null;
  hold_criteria: string | null;
  exit_criteria: string | null;
  overnight_allowed: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DecisionLogEntry {
  id: string;
  decided_at: string;
  symbol: string;
  decision: string;
  confidence: number | null;
  reasoning: string | null;
  outcome: string;
  trade_id: string | null;
  active_trade_card_id: string | null;
  lesson_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: string;
  entry_price: number | null;
  exit_price: number | null;
  size: number | null;
  stop_price: number | null;
  target_price: number | null;
  pnl: number | null;
  status: string;
  trade_date: string;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  lesson_date: string;
  trade_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MorningBrief {
  id: string;
  brief_date: string;
  market_tone: string | null;
  leadership_groups: string | null;
  catalysts: string | null;
  risks: string | null;
  watchlist: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string | null;
  signs: string | null;
  examples: string | null;
  lessons: string | null;
  win_rate: number | null;
  occurrences: number | null;
  avg_rr: number | null;
  created_at: string;
  updated_at: string;
}

export interface WatchlistEntry {
  id: string;
  symbol: string;
  notes: string | null;
  observations: string | null;
  status: string;
  first_seen: string;
  last_reviewed: string | null;
  performance_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
