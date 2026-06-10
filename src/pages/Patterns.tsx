import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Pattern } from "@/lib/secondBrain";

const empty = {
  name: "", description: "", signs: "", examples: "", lessons: "",
  win_rate: "", occurrences: "", avg_rr: "",
};
const num = (s: string) => (s === "" ? null : Number(s));

export default function Patterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pattern | null>(null);
  const [form, setForm] = useState({ ...empty });

  async function load() {
    const { data } = await supabase.from("patterns").select("*").order("name");
    setPatterns((data as Pattern[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ ...empty }); setOpen(true); }
  function openEdit(p: Pattern) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      signs: p.signs ?? "",
      examples: p.examples ?? "",
      lessons: p.lessons ?? "",
      win_rate: p.win_rate?.toString() ?? "",
      occurrences: p.occurrences?.toString() ?? "",
      avg_rr: p.avg_rr?.toString() ?? "",
    });
    setOpen(true);
  }
  async function save() {
    if (!form.name.trim()) return toast.error("Name required");
    const payload = {
      name: form.name,
      description: form.description,
      signs: form.signs,
      examples: form.examples,
      lessons: form.lessons,
      win_rate: num(form.win_rate),
      occurrences: form.occurrences === "" ? 0 : Number(form.occurrences),
      avg_rr: num(form.avg_rr),
    };
    const { error } = editing
      ? await supabase.from("patterns").update(payload).eq("id", editing.id)
      : await supabase.from("patterns").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Pattern updated" : "Pattern added");
    setOpen(false);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this pattern?")) return;
    await supabase.from("patterns").delete().eq("id", id);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return patterns;
    return patterns.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      (p.signs ?? "").toLowerCase().includes(q)
    );
  }, [patterns, search]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Pattern Library"
        description="Recurring setups, their tells, and what they teach you."
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> New Pattern</Button>}
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search patterns..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(p => (
          <Card key={p.id} className="card-hover">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Win Rate" value={p.win_rate !== null ? `${p.win_rate}%` : "—"} />
                <Stat label="Occurrences" value={(p.occurrences ?? 0).toString()} />
                <Stat label="Avg R:R" value={p.avg_rr !== null ? p.avg_rr.toString() : "—"} />
              </div>
              {p.description && <Field label="Description" value={p.description} />}
              {p.signs && <Field label="Signs" value={p.signs} />}
              {p.examples && <Field label="Examples" value={p.examples} />}
              {p.lessons && <Field label="Lessons" value={p.lessons} />}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-12">No patterns saved.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Pattern" : "New Pattern"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Pattern name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Textarea rows={2} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Textarea rows={2} placeholder="Signs / tells" value={form.signs} onChange={e => setForm({ ...form, signs: e.target.value })} />
            <Textarea rows={2} placeholder="Examples" value={form.examples} onChange={e => setForm({ ...form, examples: e.target.value })} />
            <Textarea rows={2} placeholder="Lessons" value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" step="any" placeholder="Win rate %" value={form.win_rate} onChange={e => setForm({ ...form, win_rate: e.target.value })} />
              <Input type="number" placeholder="Occurrences" value={form.occurrences} onChange={e => setForm({ ...form, occurrences: e.target.value })} />
              <Input type="number" step="any" placeholder="Avg R:R" value={form.avg_rr} onChange={e => setForm({ ...form, avg_rr: e.target.value })} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/40 rounded-md p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-foreground/90 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
