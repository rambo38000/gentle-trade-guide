import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Zap, Clock, Ban } from "lucide-react";
import type { FocusStockData, TradeStatus } from "@/lib/mockData";
import { motion } from "framer-motion";
import { toast } from "sonner";

const statusConfig: Record<TradeStatus, { icon: React.ReactNode; className: string }> = {
  Pending: { icon: <Clock className="h-4 w-4" />, className: "text-hold bg-hold/15 border-hold/30" },
  Executed: { icon: <CheckCircle2 className="h-4 w-4" />, className: "text-profit bg-profit/15 border-profit/30" },
  Rejected: { icon: <Ban className="h-4 w-4" />, className: "text-loss bg-loss/15 border-loss/30" },
};

export function TradeExecution({ stock }: { stock: FocusStockData }) {
  const [status, setStatus] = useState<TradeStatus>("Pending");
  const [confirmAction, setConfirmAction] = useState<"execute" | "reject" | null>(null);

  const handleConfirm = () => {
    if (confirmAction === "execute") {
      setStatus("Executed");
      toast.success(`Trade executed: ${stock.decision} ${stock.symbol}`);
    } else {
      setStatus("Rejected");
      toast.error(`Trade rejected: ${stock.symbol}`);
    }
    setConfirmAction(null);
  };

  const sc = statusConfig[status];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Trade Execution</CardTitle>
              <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono ${sc.className}`}>
                {sc.icon}
                {status}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              <div className="rounded-md bg-secondary/50 p-2">
                <span className="text-xs text-muted-foreground block">Action</span>
                <span className={status === "Pending" ? "text-profit" : "text-muted-foreground"}>{stock.decision}</span>
              </div>
              <div className="rounded-md bg-secondary/50 p-2">
                <span className="text-xs text-muted-foreground block">Symbol</span>
                <span>{stock.symbol}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2 bg-profit/15 text-profit hover:bg-profit/25 border border-profit/30"
                variant="outline"
                disabled={status !== "Pending"}
                onClick={() => setConfirmAction("execute")}
              >
                <Zap className="h-4 w-4" /> Execute
              </Button>
              <Button
                className="flex-1 gap-2 bg-loss/15 text-loss hover:bg-loss/25 border border-loss/30"
                variant="outline"
                disabled={status !== "Pending"}
                onClick={() => setConfirmAction("reject")}
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {confirmAction === "execute" ? "Confirm Execution" : "Confirm Rejection"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "execute"
                ? `Execute ${stock.decision} order for ${stock.symbol} at $${stock.price.toFixed(2)}?`
                : `Reject the ${stock.decision} signal for ${stock.symbol}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              className={confirmAction === "execute" ? "bg-profit text-primary-foreground hover:bg-profit/90" : "bg-loss text-destructive-foreground hover:bg-loss/90"}
              onClick={handleConfirm}
            >
              {confirmAction === "execute" ? "Execute" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
