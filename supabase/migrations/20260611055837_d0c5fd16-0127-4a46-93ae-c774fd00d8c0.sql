
CREATE TABLE public.active_trade_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  trade_type text NOT NULL DEFAULT 'Day Trade',
  entry_price numeric,
  stop_price numeric,
  thesis text,
  invalidation_level text,
  target_1 numeric,
  target_2 numeric,
  hold_criteria text,
  exit_criteria text,
  overnight_allowed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'Planned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.active_trade_cards TO anon, authenticated;
GRANT ALL ON public.active_trade_cards TO service_role;
ALTER TABLE public.active_trade_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access active_trade_cards" ON public.active_trade_cards FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_active_trade_cards_updated_at BEFORE UPDATE ON public.active_trade_cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.decision_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decided_at timestamptz NOT NULL DEFAULT now(),
  symbol text NOT NULL,
  decision text NOT NULL DEFAULT 'HOLD',
  confidence numeric,
  reasoning text,
  outcome text NOT NULL DEFAULT 'Unknown',
  trade_id uuid REFERENCES public.trades(id) ON DELETE SET NULL,
  active_trade_card_id uuid REFERENCES public.active_trade_cards(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_log TO anon, authenticated;
GRANT ALL ON public.decision_log TO service_role;
ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access decision_log" ON public.decision_log FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_decision_log_updated_at BEFORE UPDATE ON public.decision_log FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
