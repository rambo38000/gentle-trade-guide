import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Sun } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { MorningBrief, parseTags } from "@/lib/secondBrain";

const empty = {
  brief_date: new Date().toISOString().slice(0, 10),
  market_tone: "",
  leadership_groups: "",
  catalysts: "",
  risks: "",
  watchlist: "",
  notes: "",
};

export default function Briefs() {
  const [briefs, setBriefs] = useState<MorningBrief[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MorningBrief | null>(null);
  const [form, setForm] = useState({ ...empty });

  async function load() {
    const { data } = await supabase.from("morning_briefs").select("*").order("brief_date", { ascending: false });
    setBriefs((data as MorningBrief[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ ...empty }); setOpen(true); }
  function openEdit(b: MorningBrief) {
    setEditing(b);
    setForm({
      brief_date: b.brief_date,
      market_tone: b.market_tone ?? "",
      leadership_groups: b.leadership_groups ?? "",
      catalysts: b.catalysts ?? "",
      risks: b.risks ?? "",
      watchlist: (b.watchlist ?? []).join(", "),
      notes: b.notes ?? "",
    });
    setOpen(true);
  }
  async function save() {
    const payload = {
      brief_date: form.brief_date,
      market_tone: form.market_tone,
      leadership_groups: form.leadership_groups,
      catalysts: form.catalysts,
      risks: form.risks,
      watchlist: parseTags(form.watchlist).map(s => s.toUpperCase()),
      notes: form.notes,
    };
    const { error } = editing
      ? await supabase.from("morning_briefs").update(payload).eq("id", editing.id)
      : await supabase.from("morning_briefs").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Brief updated" : "Brief saved");
    setOpen(false);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this brief?")) return;
    await supabase.from("morning_briefs").delete().eq("id", id);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return briefs;
    return briefs.filter(b =>
      b.brief_date.includes(q) ||
      (b.market_tone ?? "").toLowerCase().includes(q) ||
      (b.leadership_groups ?? "").toLowerCase().includes(q) ||
      (b.catalysts ?? "").toLowerCase().includes(q) ||
      (b.risks ?? "").toLowerCase().includes(q) ||
      (b.watchlist ?? []).some(s => s.toLowerCase().includes(q))
    );
  }, [briefs, search]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Morning Brief Archive"
        description="Pre-market reads stored for review and pattern-matching."
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> New Brief</Button>}
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by date, theme, catalysts..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-4">
        {filtered.map(b => (
          <Card key={b.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <Sun className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-mono">{b.brief_date}</CardTitle>
                    {b.market_tone && <p className="text-xs text-muted-foreground mt-0.5">Tone: {b.market_tone}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <Section label="Leadership Groups" value={b.leadership_groups} />
              <Section label="Catalysts" value={b.catalysts} />
              <Section label="Risks" value={b.risks} />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Watchlist</p>
                <div className="flex flex-wrap gap-1">
                  {(b.watchlist ?? []).map(s => <Badge key={s} variant="secondary" className="font-mono">{s}</Badge>)}
                  {(b.watchlist ?? []).length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                </div>
              </div>
              {b.notes && <Section label="Notes" value={b.notes} full />}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No briefs yet.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Brief" : "Morning Brief"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.brief_date} onChange={e => setForm({ ...form, brief_date: e.target.value })} />
              <Input placeholder="Market tone (Risk-on, Cautious...)" value={form.market_tone} onChange={e => setForm({ ...form, market_tone: e.target.value })} />
            </div>
            <Textarea rows={2} placeholder="Leadership groups" value={form.leadership_groups} onChange={e => setForm({ ...form, leadership_groups: e.target.value })} />
            <Textarea rows={2} placeholder="Catalysts" value={form.catalysts} onChange={e => setForm({ ...form, catalysts: e.target.value })} />
            <Textarea rows={2} placeholder="Risks" value={form.risks} onChange={e => setForm({ ...form, risks: e.target.value })} />
            <Input placeholder="Watchlist (comma separated symbols)" value={form.watchlist} onChange={e => setForm({ ...form, watchlist: e.target.value })} />
            <Textarea rows={2} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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

function Section({ label, value, full }: { label: string; value: string | null; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="whitespace-pre-wrap text-foreground/90">{value || <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}
