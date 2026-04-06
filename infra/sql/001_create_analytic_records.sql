CREATE TABLE IF NOT EXISTS analytic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category VARCHAR(80) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    source VARCHAR(80) NOT NULL DEFAULT 'manual',
    status VARCHAR(30) NOT NULL DEFAULT 'ok',
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytic_records_category ON analytic_records(category);
CREATE INDEX IF NOT EXISTS idx_analytic_records_event_time ON analytic_records(event_time);
