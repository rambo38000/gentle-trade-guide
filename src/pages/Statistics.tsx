import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { Trade } from "@/lib/secondBrain";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Bucket {
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  profitFactor: number;
}

function bucket(list: Trade[]): Bucket {
  const closed = list.filter(t => t.status === "CLOSED" && t.pnl !== null);
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const losses = closed.filter(t => (t.pnl ?? 0) < 0);
  const winSum = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const lossSum = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const avgWin = wins.length ? winSum / wins.length : 0;
  const avgLoss = losses.length ? lossSum / losses.length : 0;
  const winRate = closed.length ? wins.length / closed.length : 0;
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;
  const profitFactor = lossSum > 0 ? winSum / lossSum : winSum > 0 ? Infinity : 0;
  return {
    trades: closed.length,
    wins: wins.length,
    losses: losses.length,
    pnl: winSum - lossSum,
    winRate: winRate * 100,
    avgWin,
    avgLoss,
    expectancy,
    profitFactor,
  };
}

const fmt = (n: number) => `${n >= 0 ? "" : "-"}$${Math.abs(n).toFixed(2)}`;
const pf = (n: number) => (!isFinite(n) ? "∞" : n.toFixed(2));

export default function Statistics() {
  const [trades, setTrades] = useState<Trade[]>([]);

  async function load() {
    const { data } = await supabase.from("trades").select("*");
    setTrades((data as Trade[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  const overall = useMemo(() => bucket(trades), [trades]);
  const day = useMemo(
    () => bucket(trades.filter(t => (t.tags ?? []).some(x => /day/i.test(x)))),
    [trades]
  );
  const swing = useMemo(
    () => bucket(trades.filter(t => (t.tags ?? []).some(x => /swing/i.test(x)))),
    [trades]
  );

  const bySymbol = useMemo(() => {
    const map = new Map<string, Trade[]>();
    trades.forEach(t => {
      const arr = map.get(t.symbol) ?? [];
      arr.push(t);
      map.set(t.symbol, arr);
    });
    return Array.from(map.entries())
      .map(([symbol, list]) => ({ symbol, ...bucket(list) }))
      .filter(x => x.trades > 0)
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const byPattern = useMemo(() => {
    const map = new Map<string, Trade[]>();
    trades.forEach(t => {
      (t.tags ?? []).forEach(tag => {
        const arr = map.get(tag) ?? [];
        arr.push(t);
        map.set(tag, arr);
      });
    });
    return Array.from(map.entries())
      .map(([pattern, list]) => ({ pattern, ...bucket(list) }))
      .filter(x => x.trades > 0)
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Trading Statistics"
        description="Performance computed from every trade in your journal."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Trades" value={overall.trades.toString()} />
        <Stat label="Win Rate" value={`${overall.winRate.toFixed(1)}%`} />
        <Stat label="Total P/L" value={fmt(overall.pnl)} tone={overall.pnl >= 0 ? "profit" : "loss"} />
        <Stat label="Profit Factor" value={pf(overall.profitFactor)} />
        <Stat label="Avg Winner" value={fmt(overall.avgWin)} tone="profit" />
        <Stat label="Avg Loser" value={fmt(-overall.avgLoss)} tone="loss" />
        <Stat label="Expectancy" value={fmt(overall.expectancy)} tone={overall.expectancy >= 0 ? "profit" : "loss"} />
        <Stat label="Wins / Losses" value={`${overall.wins} / ${overall.losses}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SubBucketCard title="Day Trade Performance" b={day} hint="Trades tagged with 'day'" />
        <SubBucketCard title="Swing Trade Performance" b={swing} hint="Trades tagged with 'swing'" />
      </div>

      <ChartCard
        title="Performance by Symbol"
        empty={bySymbol.length === 0}
        data={bySymbol.slice(0, 15).map(x => ({ label: x.symbol, pnl: x.pnl, trades: x.trades, winRate: x.winRate }))}
      />

      <ChartCard
        title="Performance by Pattern (tag)"
        empty={byPattern.length === 0}
        data={byPattern.slice(0, 15).map(x => ({ label: x.pattern, pnl: x.pnl, trades: x.trades, winRate: x.winRate }))}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "profit" | "loss" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold font-mono mt-1 ${tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function SubBucketCard({ title, b, hint }: { title: string; b: Bucket; hint: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 text-sm font-mono">
        <Mini label="Trades" v={b.trades.toString()} />
        <Mini label="Win %" v={`${b.winRate.toFixed(1)}%`} />
        <Mini label="P/L" v={fmt(b.pnl)} tone={b.pnl >= 0 ? "profit" : "loss"} />
        <Mini label="Avg Win" v={fmt(b.avgWin)} tone="profit" />
        <Mini label="Avg Loss" v={fmt(-b.avgLoss)} tone="loss" />
        <Mini label="PF" v={pf(b.profitFactor)} />
      </CardContent>
    </Card>
  );
}

function Mini({ label, v, tone }: { label: string; v: string; tone?: "profit" | "loss" }) {
  return (
    <div className="bg-secondary/40 rounded px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""}>{v}</div>
    </div>
  );
}

function ChartCard({ title, data, empty }: { title: string; data: { label: string; pnl: number; trades: number; winRate: number }[]; empty: boolean }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground py-10 text-center">No data yet.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v: number, n) => n === "pnl" ? fmt(v) : v}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
