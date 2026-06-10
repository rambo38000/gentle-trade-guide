import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { WatchlistEntry, WATCHLIST_STATUSES } from "@/lib/secondBrain";

const empty = {
  symbol: "",
  status: "Active",
  notes: "",
  observations: "",
  performance_notes: "",
  first_seen: new Date().toISOString().slice(0, 10),
  last_reviewed: "",
};

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WatchlistEntry | null>(null);
  const [form, setForm] = useState({ ...empty });

  async function load() {
    const { data } = await supabase.from("watchlist_entries").select("*").order("symbol");
    setItems((data as WatchlistEntry[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ ...empty }); setOpen(true); }
  function openEdit(e: WatchlistEntry) {
    setEditing(e);
    setForm({
      symbol: e.symbol,
      status: e.status,
      notes: e.notes ?? "",
      observations: e.observations ?? "",
      performance_notes: e.performance_notes ?? "",
      first_seen: e.first_seen,
      last_reviewed: e.last_reviewed ?? "",
    });
    setOpen(true);
  }
  async function save() {
    if (!form.symbol.trim()) return toast.error("Symbol required");
    const payload = {
      symbol: form.symbol.toUpperCase(),
      status: form.status,
      notes: form.notes,
      observations: form.observations,
      performance_notes: form.performance_notes,
      first_seen: form.first_seen,
      last_reviewed: form.last_reviewed || null,
    };
    const { error } = editing
      ? await supabase.from("watchlist_entries").update(payload).eq("id", editing.id)
      : await supabase.from("watchlist_entries").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Added");
    setOpen(false);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Remove from watchlist?")) return;
    await supabase.from("watchlist_entries").delete().eq("id", id);
    toast.success("Removed");
    load();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => {
      const ms = filterStatus === "all" || i.status === filterStatus;
      const mq = !q || i.symbol.toLowerCase().includes(q) || (i.notes ?? "").toLowerCase().includes(q) || (i.observations ?? "").toLowerCase().includes(q);
      return ms && mq;
    });
  }, [items, search, filterStatus]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Watchlist Memory"
        description="Symbols you keep returning to — and what they keep teaching you."
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> Add Symbol</Button>}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search symbols, notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {WATCHLIST_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(i => (
          <Card key={i.id} className="card-hover">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-mono">{i.symbol}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] mt-1">{i.status}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(i.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {i.notes && <div><span className="text-xs uppercase tracking-wider text-muted-foreground">Notes</span><p className="whitespace-pre-wrap">{i.notes}</p></div>}
              {i.observations && <div><span className="text-xs uppercase tracking-wider text-muted-foreground">Observations</span><p className="whitespace-pre-wrap">{i.observations}</p></div>}
              {i.performance_notes && <div><span className="text-xs uppercase tracking-wider text-muted-foreground">Performance</span><p className="whitespace-pre-wrap">{i.performance_notes}</p></div>}
              <div className="text-[10px] font-mono text-muted-foreground pt-2 border-t border-border flex justify-between">
                <span>First: {i.first_seen}</span>
                <span>Last: {i.last_reviewed ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-12">Watchlist is empty.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Symbol" : "Add to Watchlist"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WATCHLIST_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Textarea rows={2} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <Textarea rows={2} placeholder="Observations" value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} />
            <Textarea rows={2} placeholder="Performance notes" value={form.performance_notes} onChange={e => setForm({ ...form, performance_notes: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">First seen</label>
                <Input type="date" value={form.first_seen} onChange={e => setForm({ ...form, first_seen: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Last reviewed</label>
                <Input type="date" value={form.last_reviewed} onChange={e => setForm({ ...form, last_reviewed: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
