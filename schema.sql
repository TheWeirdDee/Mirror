-- Create vaults table
CREATE TABLE vaults (
  vault_uuid UUID PRIMARY KEY,
  vault_type TEXT NOT NULL CHECK (vault_type IN ('sell', 'buy')),
  wallet_address TEXT NOT NULL,
  encrypted_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
  match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sell_vault_uuid UUID NOT NULL REFERENCES vaults(vault_uuid),
  buy_vault_uuid UUID NOT NULL REFERENCES vaults(vault_uuid),
  score INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'stage_1' CHECK (status IN ('stage_1', 'stage_2', 'stage_3', 'stage_4', 'rejected', 'expired')),
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security) if you want, but for hackathon purposes we can leave it simple
-- or just enable basic access
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for hackathon demo
CREATE POLICY "Public full access vaults" ON vaults FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
