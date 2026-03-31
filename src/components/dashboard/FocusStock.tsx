import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Brain, Target } from "lucide-react";
import type { FocusStockData } from "@/lib/mockData";
import { motion } from "framer-motion";

const decisionColor: Record<string, string> = {
  BUY: "text-profit",
  SELL: "text-loss",
  HOLD: "text-hold",
};

const decisionBg: Record<string, string> = {
  BUY: "bg-profit/15 text-profit border-profit/30",
  SELL: "bg-loss/15 text-loss border-loss/30",
  HOLD: "bg-hold/15 text-hold border-hold/30",
};

export function FocusStock({ data }: { data: FocusStockData }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="terminal-glow card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-mono">{data.symbol}</CardTitle>
                <p className="text-xs text-muted-foreground">{data.name}</p>
              </div>
            </div>
            <Badge variant="outline" className={`font-mono text-sm px-3 py-1 ${decisionBg[data.decision]}`}>
              {data.decision}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-mono font-bold">${data.price.toFixed(2)}</span>
            <span className={`flex items-center gap-1 text-sm font-mono ${data.change >= 0 ? "text-profit" : "text-loss"}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {data.change >= 0 ? "+" : ""}
              {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</span>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${data.confidence >= 75 ? "bg-profit" : data.confidence >= 50 ? "bg-hold" : "bg-loss"}`}
                initial={{ width: 0 }}
                animate={{ width: `${data.confidence}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className={`font-mono text-sm font-semibold ${decisionColor[data.decision]}`}>{data.confidence}%</span>
          </div>

          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">AI Reasoning</span>
            </div>
            <p className="text-sm text-secondary-foreground leading-relaxed">{data.reasoning}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
