-- Ciclos de pagamento: dia05 (Pagamento do Casal) e dia20 (Vales do Casal)
ALTER TABLE Gestao_FamiliarWilltransactions
  ADD COLUMN IF NOT EXISTS payment_cycle text
  CHECK (payment_cycle IN ('dia05', 'dia20'));

CREATE INDEX IF NOT EXISTS idx_gfw_transactions_cycle
  ON Gestao_FamiliarWilltransactions(family_id, payment_cycle, date DESC)
  WHERE payment_cycle IS NOT NULL;
