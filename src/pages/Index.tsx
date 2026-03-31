import { FocusStock } from "@/components/dashboard/FocusStock";
import { TradeExecution } from "@/components/dashboard/TradeExecution";
import { TradeHistory } from "@/components/dashboard/TradeHistory";
import { RiskSettings } from "@/components/dashboard/RiskSettings";
import { PositionOverview } from "@/components/dashboard/PositionOverview";
import { mockFocusStock, mockTradeHistory, mockPositions, defaultRiskConfig } from "@/lib/mockData";
import { Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight">TradeAgent</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Trading Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="pulse-green inline-block h-2 w-2 rounded-full bg-profit" />
          <span className="text-xs text-muted-foreground font-mono">Live</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column - Focus & Execution */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <FocusStock data={mockFocusStock} />
            <TradeExecution stock={mockFocusStock} />
          </div>
          <TradeHistory trades={mockTradeHistory} />
        </div>

        {/* Right Column - Risk & Positions */}
        <div className="space-y-4">
          <RiskSettings config={defaultRiskConfig} />
          <PositionOverview positions={mockPositions} />
        </div>
      </div>
    </div>
  );
};

export default Index;
