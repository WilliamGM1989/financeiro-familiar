CREATE OR REPLACE FUNCTION validate_transaction_family()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM Gestao_FamiliarWillaccounts
    WHERE id = NEW.account_id AND family_id = NEW.family_id
  ) THEN
    RAISE EXCEPTION 'account_id % não pertence à família %', NEW.account_id, NEW.family_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_validate_transaction_family
  BEFORE INSERT OR UPDATE ON Gestao_FamiliarWilltransactions
  FOR EACH ROW EXECUTE FUNCTION validate_transaction_family();
