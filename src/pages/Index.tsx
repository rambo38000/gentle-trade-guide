import { useEffect, useState } from "react";
import { FocusStock } from "@/components/dashboard/FocusStock";
import { TradeExecution } from "@/components/dashboard/TradeExecution";
import { TradeHistory } from "@/components/dashboard/TradeHistory";
import { RiskSettings } from "@/components/dashboard/RiskSettings";
import { PositionOverview } from "@/components/dashboard/PositionOverview";
import { defaultRiskConfig } from "@/lib/mockData";
import type { FocusStockData, TradeRecord, Position, Decision, TradeStatus } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import type { Trade, DecisionLogEntry, ActiveTradeCard } from "@/lib/secondBrain";

const FALLBACK_FOCUS: FocusStockData = {
  symbol: "—",
  name: "No active focus",
  price: 0,
  change: 0,
  changePercent: 0,
  decision: "HOLD",
  confidence: 0,
  reasoning: "No decisions or active trade cards yet. Log a decision or create an active trade card to populate the focus panel.",
};

function toDecision(raw: string | null | undefined): Decision {
  const v = (raw ?? "").toUpperCase();
  if (v === "BUY") return "BUY";
  if (v === "SELL" || v === "EXIT") return "SELL";
  return "HOLD";
}

function toTradeStatus(raw: string | null | undefined): TradeStatus {
  const v = (raw ?? "").toUpperCase();
  if (v === "OPEN") return "Pending";
  if (v === "CLOSED") return "Executed";
  if (v === "CANCELLED") return "Rejected";
  return "Pending";
}

function tradeToRecord(t: Trade): TradeRecord {
  return {
    id: t.id,
    symbol: t.symbol,
    action: t.side?.toUpperCase() === "SHORT" ? "SELL" : "BUY",
    quantity: t.size ?? 0,
    price: t.entry_price ?? 0,
    confidence: 0,
    date: t.trade_date,
    status: toTradeStatus(t.status),
    pnl: t.pnl,
  };
}

function tradeToPosition(t: Trade): Position {
  const qty = t.size ?? 0;
  const entry = t.entry_price ?? 0;
  const current = t.exit_price ?? entry;
  const pnl = (current - entry) * qty * (t.side?.toUpperCase() === "SHORT" ? -1 : 1);
  const pnlPercent = entry > 0 ? ((current - entry) / entry) * 100 * (t.side?.toUpperCase() === "SHORT" ? -1 : 1) : 0;
  return {
    symbol: t.symbol,
    quantity: qty,
    avgPrice: entry,
    currentPrice: current,
    pnl,
    pnlPercent,
  };
}

const Index = () => {
  const [focus, setFocus] = useState<FocusStockData>(FALLBACK_FOCUS);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    (async () => {
      const [tradesRes, decisionsRes, cardsRes] = await Promise.all([
        supabase.from("trades").select("*").order("trade_date", { ascending: false }),
        supabase.from("decision_log").select("*").order("decided_at", { ascending: false }).limit(1),
        supabase.from("active_trade_cards").select("*").in("status", ["Active", "Planned"]).order("updated_at", { ascending: false }).limit(1),
      ]);

      const allTrades = (tradesRes.data as Trade[]) ?? [];
      setTrades(allTrades.map(tradeToRecord));
      setPositions(allTrades.filter(t => t.status === "OPEN").map(tradeToPosition));

      const latestDecision = (decisionsRes.data as DecisionLogEntry[] | null)?.[0];
      const latestCard = (cardsRes.data as ActiveTradeCard[] | null)?.[0];

      if (latestDecision || latestCard) {
        const symbol = latestDecision?.symbol ?? latestCard?.symbol ?? "—";
        const price = latestCard?.entry_price ?? 0;
        setFocus({
          symbol,
          name: latestCard ? `${latestCard.trade_type} · ${latestCard.status}` : "Latest decision",
          price,
          change: 0,
          changePercent: 0,
          decision: toDecision(latestDecision?.decision),
          confidence: Math.round(latestDecision?.confidence ?? 0),
          reasoning: latestDecision?.reasoning ?? latestCard?.thesis ?? "No reasoning recorded.",
        });
      }
    })();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold font-mono tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Live AI decisions, execution, and positions.</p>
      </header>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column - Focus & Execution */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <FocusStock data={focus} />
            <TradeExecution stock={focus} />
          </div>
          <TradeHistory trades={trades} />
        </div>

        {/* Right Column - Risk & Positions */}
        <div className="space-y-4">
          <RiskSettings config={defaultRiskConfig} />
          <PositionOverview positions={positions} />
        </div>
      </div>
    </div>
  );
};

export default Index;
