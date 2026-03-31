import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History } from "lucide-react";
import type { TradeRecord } from "@/lib/mockData";
import { motion } from "framer-motion";

type SortKey = "date" | "confidence" | "symbol";

export function TradeHistory({ trades }: { trades: TradeRecord[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [filterAction, setFilterAction] = useState<string>("all");

  const filtered = trades.filter((t) => filterAction === "all" || t.action === filterAction);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date") return b.date.localeCompare(a.date);
    if (sortBy === "confidence") return b.confidence - a.confidence;
    return a.symbol.localeCompare(b.symbol);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Trade History</CardTitle>
            </div>
            <div className="flex gap-2">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="h-8 w-[100px] text-xs bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="BUY">Buy</SelectItem>
                  <SelectItem value="SELL">Sell</SelectItem>
                  <SelectItem value="HOLD">Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger className="h-8 w-[120px] text-xs bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="confidence">By Confidence</SelectItem>
                  <SelectItem value="symbol">By Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-mono text-muted-foreground">Symbol</TableHead>
                  <TableHead className="text-xs font-mono text-muted-foreground">Action</TableHead>
                  <TableHead className="text-xs font-mono text-muted-foreground text-right">Qty</TableHead>
                  <TableHead className="text-xs font-mono text-muted-foreground text-right">Price</TableHead>
                  <TableHead className="text-xs font-mono text-muted-foreground text-right">Conf.</TableHead>
                  <TableHead className="text-xs font-mono text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-mono text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-mono text-muted-foreground text-right">P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((t) => (
                  <TableRow key={t.id} className="border-border font-mono text-sm">
                    <TableCell className="font-semibold">{t.symbol}</TableCell>
                    <TableCell>
                      <span className={t.action === "BUY" ? "text-profit" : t.action === "SELL" ? "text-loss" : "text-hold"}>
                        {t.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{t.quantity}</TableCell>
                    <TableCell className="text-right">${t.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{t.confidence}%</TableCell>
                    <TableCell className="text-muted-foreground">{t.date}</TableCell>
                    <TableCell>
                      <span className={`text-xs ${t.status === "Executed" ? "text-profit" : t.status === "Rejected" ? "text-loss" : "text-hold"}`}>
                        {t.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {t.pnl !== null ? (
                        <span className={t.pnl >= 0 ? "text-profit" : "text-loss"}>
                          {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
