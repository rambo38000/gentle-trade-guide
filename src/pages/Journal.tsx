import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Trade, TRADE_SIDES, TRADE_STATUSES, parseTags } from "@/lib/secondBrain";

const empty = {
  symbol: "",
  side: "LONG",
  entry_price: "",
  exit_price: "",
  size: "",
  stop_price: "",
  target_price: "",
  pnl: "",
  status: "OPEN",
  trade_date: new Date().toISOString().slice(0, 10),
  notes: "",
  tags: "",
};

const num = (s: string) => (s === "" ? null : Number(s));

export default function Journal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [form, setForm] = useState({ ...empty });

  async function load() {
    const { data } = await supabase.from("trades").select("*").order("trade_date", { ascending: false });
    setTrades((data as Trade[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ ...empty }); setOpen(true); }
  function openEdit(t: Trade) {
    setEditing(t);
    setForm({
      symbol: t.symbol,
      side: t.side,
      entry_price: t.entry_price?.toString() ?? "",
      exit_price: t.exit_price?.toString() ?? "",
      size: t.size?.toString() ?? "",
      stop_price: t.stop_price?.toString() ?? "",
      target_price: t.target_price?.toString() ?? "",
      pnl: t.pnl?.toString() ?? "",
      status: t.status,
      trade_date: t.trade_date,
      notes: t.notes ?? "",
      tags: (t.tags ?? []).join(", "),
    });
    setOpen(true);
  }
  async function save() {
    if (!form.symbol.trim()) return toast.error("Symbol required");
    const payload = {
      symbol: form.symbol.toUpperCase(),
      side: form.side,
      entry_price: num(form.entry_price),
      exit_price: num(form.exit_price),
      size: num(form.size),
      stop_price: num(form.stop_price),
      target_price: num(form.target_price),
      pnl: num(form.pnl),
      status: form.status,
      trade_date: form.trade_date,
      notes: form.notes,
      tags: parseTags(form.tags),
    };
    const { error } = editing
      ? await supabase.from("trades").update(payload).eq("id", editing.id)
      : await supabase.from("trades").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Trade updated" : "Trade added");
    setOpen(false);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this trade?")) return;
    await supabase.from("trades").delete().eq("id", id);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trades.filter((t) => {
      const matchS = filterStatus === "all" || t.status === filterStatus;
      const matchQ = !q || t.symbol.toLowerCase().includes(q) || (t.notes ?? "").toLowerCase().includes(q) || (t.tags ?? []).some(x => x.toLowerCase().includes(q));
      return matchS && matchQ;
    });
  }, [trades, search, filterStatus]);

  const stats = useMemo(() => {
    const closed = trades.filter(t => t.status === "CLOSED" && t.pnl !== null);
    const wins = closed.filter(t => (t.pnl ?? 0) > 0);
    const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    return {
      total: trades.length,
      open: trades.filter(t => t.status === "OPEN").length,
      winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
      totalPnl,
    };
  }, [trades]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Trade Journal"
        description="Every trade, every reason, every outcome."
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> Log Trade</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Trades" value={stats.total.toString()} />
        <StatCard label="Open" value={stats.open.toString()} />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard label="Total P&L" value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}`} tone={stats.totalPnl >= 0 ? "profit" : "loss"} />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search symbol, notes, tags..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {TRADE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Symbol</TableHead>
                <TableHead className="font-mono text-xs">Side</TableHead>
                <TableHead className="font-mono text-xs text-right">Entry</TableHead>
                <TableHead className="font-mono text-xs text-right">Exit</TableHead>
                <TableHead className="font-mono text-xs text-right">Size</TableHead>
                <TableHead className="font-mono text-xs text-right">Stop</TableHead>
                <TableHead className="font-mono text-xs text-right">Target</TableHead>
                <TableHead className="font-mono text-xs text-right">P&L</TableHead>
                <TableHead className="font-mono text-xs">Status</TableHead>
                <TableHead className="font-mono text-xs">Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id} className="font-mono text-sm">
                  <TableCell className="font-semibold">{t.symbol}</TableCell>
                  <TableCell><span className={t.side === "LONG" ? "text-profit" : "text-loss"}>{t.side}</span></TableCell>
                  <TableCell className="text-right">{t.entry_price ?? "—"}</TableCell>
                  <TableCell className="text-right">{t.exit_price ?? "—"}</TableCell>
                  <TableCell className="text-right">{t.size ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{t.stop_price ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{t.target_price ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {t.pnl !== null ? <span className={t.pnl >= 0 ? "text-profit" : "text-loss"}>{t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}</span> : "—"}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{t.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{t.trade_date}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">No trades logged.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Trade" : "Log Trade"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
            <Select value={form.side} onValueChange={v => setForm({ ...form, side: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TRADE_SIDES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" step="any" placeholder="Entry price" value={form.entry_price} onChange={e => setForm({ ...form, entry_price: e.target.value })} />
            <Input type="number" step="any" placeholder="Exit price" value={form.exit_price} onChange={e => setForm({ ...form, exit_price: e.target.value })} />
            <Input type="number" step="any" placeholder="Size" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} />
            <Input type="number" step="any" placeholder="Stop" value={form.stop_price} onChange={e => setForm({ ...form, stop_price: e.target.value })} />
            <Input type="number" step="any" placeholder="Target" value={form.target_price} onChange={e => setForm({ ...form, target_price: e.target.value })} />
            <Input type="number" step="any" placeholder="P&L" value={form.pnl} onChange={e => setForm({ ...form, pnl: e.target.value })} />
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TRADE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" value={form.trade_date} onChange={e => setForm({ ...form, trade_date: e.target.value })} />
            <Input className="col-span-2" placeholder="Tags (comma)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            <Textarea className="col-span-2" rows={3} placeholder="Notes / lessons learned" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "profit" | "loss" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold font-mono mt-1 ${tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
