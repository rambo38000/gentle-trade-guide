import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, BookOpen, NotebookPen, Sun, LayoutGrid, Eye, ArrowRight, ClipboardList, GitBranch } from "lucide-react";
import { Badge as _B } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { ActiveTradeCard, DecisionLogEntry, Lesson, MorningBrief, Pattern, Trade, WatchlistEntry } from "@/lib/secondBrain";

export default function Agent() {
  const [counts, setCounts] = useState({ trades: 0, lessons: 0, briefs: 0, patterns: 0, watchlist: 0, cards: 0, decisions: 0 });
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [latestBrief, setLatestBrief] = useState<MorningBrief | null>(null);
  const [topPatterns, setTopPatterns] = useState<Pattern[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [activeCards, setActiveCards] = useState<ActiveTradeCard[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<DecisionLogEntry[]>([]);

  useEffect(() => {
    (async () => {
      const [trades, lessons, briefs, patterns, watch, cards, decisions] = await Promise.all([
        supabase.from("trades").select("*", { count: "exact" }).order("trade_date", { ascending: false }).limit(5),
        supabase.from("lessons").select("*", { count: "exact" }).order("lesson_date", { ascending: false }).limit(5),
        supabase.from("morning_briefs").select("*", { count: "exact" }).order("brief_date", { ascending: false }).limit(1),
        supabase.from("patterns").select("*", { count: "exact" }).order("occurrences", { ascending: false }).limit(5),
        supabase.from("watchlist_entries").select("*", { count: "exact" }).eq("status", "Active").order("symbol").limit(10),
        (supabase as any).from("active_trade_cards").select("*", { count: "exact" }).in("status", ["Planned", "Active"]).order("updated_at", { ascending: false }).limit(6),
        (supabase as any).from("decision_log").select("*", { count: "exact" }).order("decided_at", { ascending: false }).limit(5),
      ]);
      setCounts({
        trades: trades.count ?? 0,
        lessons: lessons.count ?? 0,
        briefs: briefs.count ?? 0,
        patterns: patterns.count ?? 0,
        watchlist: watch.count ?? 0,
        cards: cards.count ?? 0,
        decisions: decisions.count ?? 0,
      });
      setRecentTrades((trades.data as Trade[]) ?? []);
      setRecentLessons((lessons.data as Lesson[]) ?? []);
      setLatestBrief(((briefs.data as MorningBrief[]) ?? [])[0] ?? null);
      setTopPatterns((patterns.data as Pattern[]) ?? []);
      setWatchlist((watch.data as WatchlistEntry[]) ?? []);
      setActiveCards((cards.data as ActiveTradeCard[]) ?? []);
      setRecentDecisions((decisions.data as DecisionLogEntry[]) ?? []);
    })();
  }, []);

  const sources = [
    { to: "/cards", label: "Active Trade Cards", icon: ClipboardList, count: counts.cards, desc: "planned/active" },
    { to: "/decisions", label: "Decision Log", icon: GitBranch, count: counts.decisions, desc: "decisions tracked" },
    { to: "/journal", label: "Trade Journal", icon: NotebookPen, count: counts.trades, desc: "trades logged" },
    { to: "/lessons", label: "Lessons Learned", icon: BookOpen, count: counts.lessons, desc: "lessons captured" },
    { to: "/briefs", label: "Morning Briefs", icon: Sun, count: counts.briefs, desc: "briefs archived" },
    { to: "/patterns", label: "Pattern Library", icon: LayoutGrid, count: counts.patterns, desc: "patterns mapped" },
    { to: "/watchlist", label: "Watchlist Memory", icon: Eye, count: counts.watchlist, desc: "active symbols" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Agent Workspace"
        description="A unified view of every memory store. Your future AI agent reads and writes here."
      />

      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-1">AI Agent Connection</p>
            <p className="text-muted-foreground">
              Your OpenAI + Alpaca MCP agent can read and write any of the five Second Brain stores below via the backend API.
              Use this page to monitor what the agent sees and to keep its context fresh.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {sources.map(s => (
          <Link key={s.to} to={s.to}>
            <Card className="card-hover h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="h-4 w-4 text-primary" />
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold font-mono">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                <p className="text-sm font-medium mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><NotebookPen className="h-4 w-4" /> Recent Trades</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentTrades.map(t => (
              <div key={t.id} className="flex justify-between text-sm font-mono border-b border-border pb-1.5 last:border-0">
                <span className="font-semibold">{t.symbol}</span>
                <span className={t.side === "LONG" ? "text-profit" : "text-loss"}>{t.side}</span>
                <span className="text-muted-foreground">{t.trade_date}</span>
                <span className={t.pnl && t.pnl >= 0 ? "text-profit" : t.pnl && t.pnl < 0 ? "text-loss" : "text-muted-foreground"}>
                  {t.pnl !== null ? `${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}` : "—"}
                </span>
              </div>
            ))}
            {recentTrades.length === 0 && <p className="text-xs text-muted-foreground">No trades yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Recent Lessons</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentLessons.map(l => (
              <div key={l.id} className="text-sm border-b border-border pb-1.5 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{l.title}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{l.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{l.content}</p>
              </div>
            ))}
            {recentLessons.length === 0 && <p className="text-xs text-muted-foreground">No lessons yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sun className="h-4 w-4" /> Latest Morning Brief</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {latestBrief ? (
              <>
                <p className="font-mono text-muted-foreground">{latestBrief.brief_date}</p>
                {latestBrief.market_tone && <p><span className="text-xs text-muted-foreground">Tone:</span> {latestBrief.market_tone}</p>}
                {latestBrief.catalysts && <p className="line-clamp-2"><span className="text-xs text-muted-foreground">Catalysts:</span> {latestBrief.catalysts}</p>}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(latestBrief.watchlist ?? []).slice(0, 8).map(s => <Badge key={s} variant="secondary" className="font-mono text-[10px]">{s}</Badge>)}
                </div>
              </>
            ) : <p className="text-xs text-muted-foreground">No briefs archived.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Top Patterns</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topPatterns.map(p => (
              <div key={p.id} className="flex justify-between text-sm border-b border-border pb-1.5 last:border-0">
                <span className="font-medium">{p.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {p.win_rate ?? "—"}% · {p.occurrences ?? 0}x
                </span>
              </div>
            ))}
            {topPatterns.length === 0 && <p className="text-xs text-muted-foreground">No patterns yet.</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" /> Active Watchlist</CardTitle></CardHeader>
          <CardContent>
            {watchlist.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {watchlist.map(w => <Badge key={w.id} variant="secondary" className="font-mono">{w.symbol}</Badge>)}
              </div>
            ) : <p className="text-xs text-muted-foreground">No active symbols.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
