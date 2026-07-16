-- Add color label to items (used by ideas only). Default yellow.
-- Values: 'red' | 'yellow' | 'blue'
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT 'yellow'
    CHECK (color IN ('red', 'yellow', 'blue'));
