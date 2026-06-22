-- PRD-aligned schema: revenue, day_type, weather(jsonb), ai_analysis(jsonb)
CREATE TABLE IF NOT EXISTS sales_diary (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  date             DATE         NOT NULL UNIQUE,
  revenue          INTEGER      NOT NULL CHECK (revenue >= 0),
  notes            TEXT,
  special_events   TEXT[]       DEFAULT '{}',
  day_type         TEXT         CHECK (day_type IN ('weekday', 'weekend', 'holiday')),
  weather          JSONB,       -- {condition, description, temp, humidity, city}
  ai_analysis      JSONB,       -- {comment, trend, reason}
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_diary_date ON sales_diary (date DESC);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sales_diary_updated_at ON sales_diary;
CREATE TRIGGER trigger_sales_diary_updated_at
  BEFORE UPDATE ON sales_diary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (인증 추가 시 활성화)
-- ALTER TABLE sales_diary ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "all_access" ON sales_diary USING (true) WITH CHECK (true);
