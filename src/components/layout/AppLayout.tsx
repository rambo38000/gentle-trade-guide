import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  NotebookPen,
  Sun,
  LayoutGrid,
  Eye,
  Bot,
  Layers,
  ClipboardList,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity, end: true },
  { to: "/cards", label: "Active Trade Cards", icon: Layers },
  { to: "/journal", label: "Trade Journal", icon: NotebookPen },
  { to: "/decisions", label: "Decision Log", icon: ClipboardList },
  { to: "/stats", label: "Statistics", icon: BarChart3 },
  { to: "/lessons", label: "Lessons Learned", icon: BookOpen },
  { to: "/briefs", label: "Morning Briefs", icon: Sun },
  { to: "/patterns", label: "Pattern Library", icon: LayoutGrid },
  { to: "/watchlist", label: "Watchlist Memory", icon: Eye },
  { to: "/agent", label: "Agent Workspace", icon: Bot },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-60 flex-col border-r border-sidebar-border bg-sidebar-background">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-tight">TradeAgent</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Second Brain</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2 px-2">
            <span className="pulse-green inline-block h-2 w-2 rounded-full bg-profit" />
            <span className="text-xs text-muted-foreground font-mono truncate">{user?.email ?? "Live"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-sidebar-background border-b border-sidebar-border">
        <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap text-muted-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
