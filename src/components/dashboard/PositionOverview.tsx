import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import type { Position } from "@/lib/mockData";
import { motion } from "framer-motion";

export function PositionOverview({ positions }: { positions: Position[] }) {
  const totalValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Positions</CardTitle>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Portfolio Value</p>
              <p className="font-mono font-bold text-sm">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {positions.map((p) => (
            <div key={p.symbol} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
              <div>
                <span className="font-mono font-semibold text-sm">{p.symbol}</span>
                <span className="text-xs text-muted-foreground ml-2">{p.quantity} shares @ ${p.avgPrice.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">${(p.currentPrice * p.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                <p className={`font-mono text-xs ${p.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {p.pnl >= 0 ? "+" : ""}${p.pnl.toFixed(2)} ({p.pnlPercent >= 0 ? "+" : ""}{p.pnlPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total P/L</span>
            <span className={`font-mono font-bold text-sm ${totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
