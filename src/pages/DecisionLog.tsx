import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import {
  ActiveTradeCard,
  DECISIONS,
  DecisionLogEntry,
  Lesson,
  OUTCOMES,
  Trade,
} from "@/lib/secondBrain";

const empty = {
  decided_at: new Date().toISOString().slice(0, 16),
  symbol: "",
  decision: "HOLD",
  confidence: "",
  reasoning: "",
  outcome: "Unknown",
  trade_id: "none",
  active_trade_card_id: "none",
  lesson_id: "none",
};

const decisionTone: Record<string, string> = {
  BUY: "text-profit",
  "DO NOT BUY": "text-loss",
  HOLD: "text-muted-foreground",
  EXIT: "text-loss",
};
const outcomeTone: Record<string, string> = {
  Correct: "text-profit",
  Incorrect: "text-loss",
  Unknown: "text-muted-foreground",
};

export default function DecisionLog() {
  const [entries, setEntries] = useState<DecisionLogEntry[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [cards, setCards] = useState<ActiveTradeCard[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [search, setSearch] = useState("");
  const [filterDecision, setFilterDecision] = useState("all");
  const [filterOutcome, setFilterOutcome] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DecisionLogEntry | null>(null);
  const [form, setForm] = useState({ ...empty });

  async function load() {
    const [d, t, c, l] = await Promise.all([
      (supabase as any).from("decision_log").select("*").order("decided_at", { ascending: false }),
      supabase.from("trades").select("*").order("trade_date", { ascending: false }),
      (supabase as any).from("active_trade_cards").select("*").order("updated_at", { ascending: false }),
      supabase.from("lessons").select("*").order("lesson_date", { ascending: false }),
    ]);
    setEntries((d.data as DecisionLogEntry[]) ?? []);
    setTrades((t.data as Trade[]) ?? []);
    setCards((c.data as ActiveTradeCard[]) ?? []);
    setLessons((l.data as Lesson[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ ...empty, decided_at: new Date().toISOString().slice(0, 16) }); setOpen(true); }
  function openEdit(e: DecisionLogEntry) {
    setEditing(e);
    setForm({
      decided_at: new Date(e.decided_at).toISOString().slice(0, 16),
      symbol: e.symbol,
      decision: e.decision,
      confidence: e.confidence?.toString() ?? "",
      reasoning: e.reasoning ?? "",
      outcome: e.outcome,
      trade_id: e.trade_id ?? "none",
      active_trade_card_id: e.active_trade_card_id ?? "none",
      lesson_id: e.lesson_id ?? "none",
    });
    setOpen(true);
  }
  async function save() {
    if (!form.symbol.trim()) return toast.error("Symbol required");
    const payload = {
      decided_at: new Date(form.decided_at).toISOString(),
      symbol: form.symbol.toUpperCase(),
      decision: form.decision,
      confidence: form.confidence === "" ? null : Number(form.confidence),
      reasoning: form.reasoning,
      outcome: form.outcome,
      trade_id: form.trade_id === "none" ? null : form.trade_id,
      active_trade_card_id: form.active_trade_card_id === "none" ? null : form.active_trade_card_id,
      lesson_id: form.lesson_id === "none" ? null : form.lesson_id,
    };
    const { error } = editing
      ? await (supabase as any).from("decision_log").update(payload).eq("id", editing.id)
      : await (supabase as any).from("decision_log").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Decision updated" : "Decision logged");
    setOpen(false);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this decision?")) return;
    await (supabase as any).from("decision_log").delete().eq("id", id);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter(e => {
      const matchD = filterDecision === "all" || e.decision === filterDecision;
      const matchO = filterOutcome === "all" || e.outcome === filterOutcome;
      const matchQ = !q || e.symbol.toLowerCase().includes(q) || (e.reasoning ?? "").toLowerCase().includes(q);
      return matchD && matchO && matchQ;
    });
  }, [entries, search, filterDecision, filterOutcome]);

  const tradeLabel = (id: string | null) => {
    if (!id) return null;
    const t = trades.find(x => x.id === id);
    return t ? `${t.symbol} · ${t.trade_date}` : "trade";
  };
  const cardLabel = (id: string | null) => {
    if (!id) return null;
    const c = cards.find(x => x.id === id);
    return c ? `${c.symbol} card` : "card";
  };
  const lessonLabel = (id: string | null) => {
    if (!id) return null;
    const l = lessons.find(x => x.id === id);
    return l ? l.title : "lesson";
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Decision Log"
        description="Every decision the agent made — with outcome tracking."
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> Log Decision</Button>}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search symbol or reasoning..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterDecision} onValueChange={setFilterDecision}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Decisions</SelectItem>
            {DECISIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterOutcome} onValueChange={setFilterOutcome}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            {OUTCOMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Time</TableHead>
                <TableHead className="font-mono text-xs">Symbol</TableHead>
                <TableHead className="font-mono text-xs">Decision</TableHead>
                <TableHead className="font-mono text-xs text-right">Conf.</TableHead>
                <TableHead className="font-mono text-xs">Reasoning</TableHead>
                <TableHead className="font-mono text-xs">Links</TableHead>
                <TableHead className="font-mono text-xs">Outcome</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id} className="text-sm">
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {new Date(e.decided_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">{e.symbol}</TableCell>
                  <TableCell className={`font-mono font-semibold ${decisionTone[e.decision] ?? ""}`}>{e.decision}</TableCell>
                  <TableCell className="text-right font-mono">{e.confidence !== null ? `${e.confidence}%` : "—"}</TableCell>
                  <TableCell className="max-w-md text-muted-foreground text-xs">{e.reasoning}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {tradeLabel(e.trade_id) && <Badge variant="outline" className="text-[10px] w-fit">trade · {tradeLabel(e.trade_id)}</Badge>}
                      {cardLabel(e.active_trade_card_id) && <Badge variant="outline" className="text-[10px] w-fit">card · {cardLabel(e.active_trade_card_id)}</Badge>}
                      {lessonLabel(e.lesson_id) && <Badge variant="outline" className="text-[10px] w-fit">lesson · {lessonLabel(e.lesson_id)}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className={`font-mono text-xs ${outcomeTone[e.outcome] ?? ""}`}>{e.outcome}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No decisions logged.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Decision" : "Log Decision"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input type="datetime-local" value={form.decided_at} onChange={e => setForm({ ...form, decided_at: e.target.value })} />
            <Input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
            <Select value={form.decision} onValueChange={v => setForm({ ...form, decision: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DECISIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" step="any" placeholder="Confidence %" value={form.confidence} onChange={e => setForm({ ...form, confidence: e.target.value })} />
            <Textarea className="col-span-2" rows={3} placeholder="Reasoning summary" value={form.reasoning} onChange={e => setForm({ ...form, reasoning: e.target.value })} />
            <Select value={form.outcome} onValueChange={v => setForm({ ...form, outcome: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OUTCOMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <div />
            <Select value={form.trade_id} onValueChange={v => setForm({ ...form, trade_id: v })}>
              <SelectTrigger><SelectValue placeholder="Link trade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No trade</SelectItem>
                {trades.map(t => <SelectItem key={t.id} value={t.id}>{t.symbol} · {t.trade_date}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.active_trade_card_id} onValueChange={v => setForm({ ...form, active_trade_card_id: v })}>
              <SelectTrigger><SelectValue placeholder="Link card" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No card</SelectItem>
                {cards.map(c => <SelectItem key={c.id} value={c.id}>{c.symbol} · {c.status}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.lesson_id} onValueChange={v => setForm({ ...form, lesson_id: v })}>
              <SelectTrigger className="col-span-2"><SelectValue placeholder="Link lesson" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No lesson</SelectItem>
                {lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
