-- Migration 004: Cross-family validation trigger for transactions
-- Garante que account_id pertence à mesma família da transação

CREATE OR REPLACE FUNCTION validate_transaction_family()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM accounts
    WHERE id = NEW.account_id
      AND family_id = NEW.family_id
  ) THEN
    RAISE EXCEPTION
      'account_id % não pertence à família %',
      NEW.account_id,
      NEW.family_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_transaction_family
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_transaction_family();
