import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import type { RiskConfig } from "@/lib/mockData";
import { motion } from "framer-motion";

export function RiskSettings({ config }: { config: RiskConfig }) {
  const [risk, setRisk] = useState(config);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Risk Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Risk per Trade (%)</Label>
            <Input
              type="number"
              value={risk.riskPerTrade}
              onChange={(e) => setRisk({ ...risk, riskPerTrade: Number(e.target.value) })}
              className="h-9 font-mono bg-secondary/50 border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Trades / Day</Label>
            <Input
              type="number"
              value={risk.maxTradesPerDay}
              onChange={(e) => setRisk({ ...risk, maxTradesPerDay: Number(e.target.value) })}
              className="h-9 font-mono bg-secondary/50 border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <Select value={risk.mode} onValueChange={(v) => setRisk({ ...risk, mode: v as RiskConfig["mode"] })}>
              <SelectTrigger className="h-9 font-mono bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conservative">Conservative</SelectItem>
                <SelectItem value="Aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
