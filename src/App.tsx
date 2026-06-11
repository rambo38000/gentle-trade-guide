import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index.tsx";
import Lessons from "./pages/Lessons";
import Journal from "./pages/Journal";
import Briefs from "./pages/Briefs";
import Patterns from "./pages/Patterns";
import Watchlist from "./pages/Watchlist";
import Agent from "./pages/Agent";
import ActiveTradeCards from "./pages/ActiveTradeCards";
import DecisionLog from "./pages/DecisionLog";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/briefs" element={<Briefs />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/agent" element={<Agent />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
