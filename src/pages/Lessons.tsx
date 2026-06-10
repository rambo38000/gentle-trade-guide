import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LESSON_CATEGORIES, Lesson, Trade, parseTags } from "@/lib/secondBrain";

const empty = {
  title: "",
  content: "",
  category: "Execution",
  tags: "",
  lesson_date: new Date().toISOString().slice(0, 10),
  trade_id: "none",
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState({ ...empty });

  async function load() {
    const [{ data: l }, { data: t }] = await Promise.all([
      supabase.from("lessons").select("*").order("lesson_date", { ascending: false }),
      supabase.from("trades").select("*").order("trade_date", { ascending: false }),
    ]);
    setLessons((l as Lesson[]) ?? []);
    setTrades((t as Trade[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ ...empty });
    setOpen(true);
  }
  function openEdit(l: Lesson) {
    setEditing(l);
    setForm({
      title: l.title,
      content: l.content,
      category: l.category,
      tags: (l.tags ?? []).join(", "),
      lesson_date: l.lesson_date,
      trade_id: l.trade_id ?? "none",
    });
    setOpen(true);
  }
  async function save() {
    if (!form.title.trim()) return toast.error("Title required");
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      tags: parseTags(form.tags),
      lesson_date: form.lesson_date,
      trade_id: form.trade_id === "none" ? null : form.trade_id,
    };
    const { error } = editing
      ? await supabase.from("lessons").update(payload).eq("id", editing.id)
      : await supabase.from("lessons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Lesson updated" : "Lesson added");
    setOpen(false);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lessons.filter((l) => {
      const matchCat = filterCat === "all" || l.category === filterCat;
      const matchQ =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.content.toLowerCase().includes(q) ||
        (l.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [lessons, search, filterCat]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Lessons Learned"
        description="Capture insights from every trade and review them often."
        actions={
          <Button onClick={openNew}><Plus className="h-4 w-4" /> New Lesson</Button>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search lessons, tags, content..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {LESSON_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l) => {
          const trade = trades.find((t) => t.id === l.trade_id);
          return (
            <Card key={l.id} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{l.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{l.lesson_date}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="font-mono text-[10px]">{l.category}</Badge>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{l.content}</p>
                {trade && <div className="text-xs font-mono text-primary">→ {trade.symbol} {trade.side} {trade.trade_date}</div>}
                {(l.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {l.tags!.map((t) => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-12">No lessons yet. Add your first insight.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Lesson" : "New Lesson"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea rows={6} placeholder="What did you learn?" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LESSON_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={form.lesson_date} onChange={(e) => setForm({ ...form, lesson_date: e.target.value })} />
            </div>
            <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <Select value={form.trade_id} onValueChange={(v) => setForm({ ...form, trade_id: v })}>
              <SelectTrigger><SelectValue placeholder="Link to trade (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked trade</SelectItem>
                {trades.map((t) => <SelectItem key={t.id} value={t.id}>{t.symbol} · {t.side} · {t.trade_date}</SelectItem>)}
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
