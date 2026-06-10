import { FocusStock } from "@/components/dashboard/FocusStock";
import { TradeExecution } from "@/components/dashboard/TradeExecution";
import { TradeHistory } from "@/components/dashboard/TradeHistory";
import { RiskSettings } from "@/components/dashboard/RiskSettings";
import { PositionOverview } from "@/components/dashboard/PositionOverview";
import { mockFocusStock, mockTradeHistory, mockPositions, defaultRiskConfig } from "@/lib/mockData";
import { Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold font-mono tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Live AI decisions, execution, and positions.</p>
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
