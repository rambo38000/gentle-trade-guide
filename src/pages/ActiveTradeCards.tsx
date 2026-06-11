import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Moon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ActiveTradeCard, CARD_STATUSES, CARD_TYPES } from "@/lib/secondBrain";

const empty = {
  symbol: "",
  trade_type: "Day Trade",
  entry_price: "",
  stop_price: "",
  thesis: "",
  invalidation_level: "",
  target_1: "",
  target_2: "",
  hold_criteria: "",
  exit_criteria: "",
  overnight_allowed: false,
  status: "Planned",
};

const num = (s: string) => (s === "" ? null : Number(s));

const statusTone: Record<string, string> = {
  Planned: "bg-muted text-muted-foreground",
  Active: "bg-primary/15 text-primary",
  Closed: "bg-secondary text-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

export default function ActiveTradeCards() {
  const [cards, setCards] = useState<ActiveTradeCard[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActiveTradeCard | null>(null);
  const [form, setForm] = useState({ ...empty });

  async function load() {
    const { data, error } = await (supabase as any)
      .from("active_trade_cards")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) return toast.error(error.message);
    setCards((data as ActiveTradeCard[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ ...empty }); setOpen(true); }
  function openEdit(c: ActiveTradeCard) {
    setEditing(c);
    setForm({
      symbol: c.symbol,
      trade_type: c.trade_type,
      entry_price: c.entry_price?.toString() ?? "",
      stop_price: c.stop_price?.toString() ?? "",
      thesis: c.thesis ?? "",
      invalidation_level: c.invalidation_level ?? "",
      target_1: c.target_1?.toString() ?? "",
      target_2: c.target_2?.toString() ?? "",
      hold_criteria: c.hold_criteria ?? "",
      exit_criteria: c.exit_criteria ?? "",
      overnight_allowed: c.overnight_allowed,
      status: c.status,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.symbol.trim()) return toast.error("Symbol required");
    const payload = {
      symbol: form.symbol.toUpperCase(),
      trade_type: form.trade_type,
      entry_price: num(form.entry_price),
      stop_price: num(form.stop_price),
      thesis: form.thesis,
      invalidation_level: form.invalidation_level,
      target_1: num(form.target_1),
      target_2: num(form.target_2),
      hold_criteria: form.hold_criteria,
      exit_criteria: form.exit_criteria,
      overnight_allowed: form.overnight_allowed,
      status: form.status,
    };
    const { error } = editing
      ? await (supabase as any).from("active_trade_cards").update(payload).eq("id", editing.id)
      : await (supabase as any).from("active_trade_cards").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Card updated" : "Card created");
    setOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this card?")) return;
    await (supabase as any).from("active_trade_cards").delete().eq("id", id);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cards.filter((c) => {
      const matchS = filterStatus === "all" || c.status === filterStatus;
      const matchQ = !q || c.symbol.toLowerCase().includes(q);
      return matchS && matchQ;
    });
  }, [cards, search, filterStatus]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Active Trade Cards"
        description="The source of truth for every live and planned trade."
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> New Card</Button>}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search symbol..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {CARD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="hover:border-primary/40 transition-colors">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-mono">{c.symbol}</h3>
                    <Badge variant="outline" className="text-[10px]">{c.trade_type}</Badge>
                    {c.overnight_allowed && (
                      <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded ${statusTone[c.status] ?? ""}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                <Stat label="Entry" v={c.entry_price} />
                <Stat label="Stop" v={c.stop_price} tone="loss" />
                <Stat label="T1" v={c.target_1} tone="profit" />
                <Stat label="T2" v={c.target_2} tone="profit" />
              </div>

              {c.thesis && <Block label="Thesis" v={c.thesis} />}
              {c.invalidation_level && <Block label="Invalidation" v={c.invalidation_level} />}
              {c.hold_criteria && <Block label="Hold" v={c.hold_criteria} />}
              {c.exit_criteria && <Block label="Exit" v={c.exit_criteria} />}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
            No trade cards yet. Create one to plan your next trade.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Card" : "New Trade Card"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
            <Select value={form.trade_type} onValueChange={v => setForm({ ...form, trade_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CARD_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" step="any" placeholder="Entry price" value={form.entry_price} onChange={e => setForm({ ...form, entry_price: e.target.value })} />
            <Input type="number" step="any" placeholder="Stop price" value={form.stop_price} onChange={e => setForm({ ...form, stop_price: e.target.value })} />
            <Input type="number" step="any" placeholder="Target 1" value={form.target_1} onChange={e => setForm({ ...form, target_1: e.target.value })} />
            <Input type="number" step="any" placeholder="Target 2" value={form.target_2} onChange={e => setForm({ ...form, target_2: e.target.value })} />
            <Textarea className="col-span-2" rows={2} placeholder="Thesis" value={form.thesis} onChange={e => setForm({ ...form, thesis: e.target.value })} />
            <Textarea className="col-span-2" rows={2} placeholder="Invalidation level" value={form.invalidation_level} onChange={e => setForm({ ...form, invalidation_level: e.target.value })} />
            <Textarea className="col-span-2" rows={2} placeholder="Hold criteria" value={form.hold_criteria} onChange={e => setForm({ ...form, hold_criteria: e.target.value })} />
            <Textarea className="col-span-2" rows={2} placeholder="Exit criteria" value={form.exit_criteria} onChange={e => setForm({ ...form, exit_criteria: e.target.value })} />
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CARD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex items-center justify-between border rounded-md px-3">
              <Label htmlFor="overnight" className="text-sm">Overnight allowed</Label>
              <Switch id="overnight" checked={form.overnight_allowed} onCheckedChange={v => setForm({ ...form, overnight_allowed: v })} />
            </div>
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

function Stat({ label, v, tone }: { label: string; v: number | null; tone?: "profit" | "loss" }) {
  return (
    <div className="bg-secondary/40 rounded px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-semibold ${tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""}`}>
        {v ?? "—"}
      </div>
    </div>
  );
}
function Block({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm">{v}</div>
    </div>
  );
}
