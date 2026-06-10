
-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trade Journal
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL DEFAULT 'LONG',
  entry_price NUMERIC,
  exit_price NUMERIC,
  size NUMERIC,
  stop_price NUMERIC,
  target_price NUMERIC,
  pnl NUMERIC,
  status TEXT NOT NULL DEFAULT 'OPEN',
  trade_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO anon, authenticated;
GRANT ALL ON public.trades TO service_role;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access trades" ON public.trades FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_trades_updated BEFORE UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Lessons Learned
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Execution',
  tags TEXT[] DEFAULT '{}',
  lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Morning Briefs
CREATE TABLE public.morning_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_date DATE NOT NULL DEFAULT CURRENT_DATE,
  market_tone TEXT,
  leadership_groups TEXT,
  catalysts TEXT,
  risks TEXT,
  watchlist TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.morning_briefs TO anon, authenticated;
GRANT ALL ON public.morning_briefs TO service_role;
ALTER TABLE public.morning_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access briefs" ON public.morning_briefs FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_briefs_updated BEFORE UPDATE ON public.morning_briefs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Pattern Library
CREATE TABLE public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  signs TEXT,
  examples TEXT,
  lessons TEXT,
  win_rate NUMERIC,
  occurrences INTEGER DEFAULT 0,
  avg_rr NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patterns TO anon, authenticated;
GRANT ALL ON public.patterns TO service_role;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access patterns" ON public.patterns FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_patterns_updated BEFORE UPDATE ON public.patterns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Watchlist Memory
CREATE TABLE public.watchlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  notes TEXT,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  first_seen DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed DATE,
  performance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist_entries TO anon, authenticated;
GRANT ALL ON public.watchlist_entries TO service_role;
ALTER TABLE public.watchlist_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access watchlist" ON public.watchlist_entries FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_watchlist_updated BEFORE UPDATE ON public.watchlist_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
