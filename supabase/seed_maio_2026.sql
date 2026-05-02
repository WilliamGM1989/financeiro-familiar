-- =============================================================================
-- SEED: Dados reais de Maio/2026 — Ciclo Dia 05 (Pagamento do Casal)
-- =============================================================================
-- Como usar:
--   1. Abra o Supabase Dashboard → SQL Editor
--   2. Cole este script e clique em Run
--   3. O script é idempotente — pode rodar mais de uma vez sem duplicar dados
-- =============================================================================

DO $$
DECLARE
  v_family_id  uuid;
  v_user_id    uuid;
  v_account_id uuid;
  v_already    int;
BEGIN
  SELECT id INTO v_family_id FROM Gestao_FamiliarWillfamilies ORDER BY created_at LIMIT 1;
  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma família encontrada. Cadastre-se no app primeiro.';
  END IF;

  SELECT user_id INTO v_user_id FROM Gestao_FamiliarWillfamily_members
  WHERE family_id = v_family_id AND role = 'admin' ORDER BY created_at LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT user_id INTO v_user_id FROM Gestao_FamiliarWillfamily_members
    WHERE family_id = v_family_id AND status = 'active' ORDER BY created_at LIMIT 1;
  END IF;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário encontrado para a família %', v_family_id;
  END IF;

  SELECT id INTO v_account_id FROM Gestao_FamiliarWillaccounts
  WHERE family_id = v_family_id AND is_active = true ORDER BY created_at LIMIT 1;
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma conta ativa encontrada. Cadastre uma conta no app primeiro.';
  END IF;

  SELECT COUNT(*) INTO v_already FROM Gestao_FamiliarWilltransactions
  WHERE family_id = v_family_id AND payment_cycle = 'dia05' AND date = '2026-05-05';
  IF v_already > 0 THEN
    RAISE NOTICE 'Seed já executado (% registros). Pulando.', v_already;
    RETURN;
  END IF;

  -- RECEITAS Dia 05
  INSERT INTO Gestao_FamiliarWilltransactions
    (family_id, account_id, user_id, description, amount, type, date, paid, payment_cycle)
  VALUES
    (v_family_id, v_account_id, v_user_id, 'ANA (Salário Dihofman)',   1030.00, 'income', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'CAIXINHA',                  220.00, 'income', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'MOINHO (Salário Will)',      940.00, 'income', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'BAIANOS',                   250.00, 'income', '2026-05-05', true, 'dia05');

  -- DESPESAS Dia 05
  INSERT INTO Gestao_FamiliarWilltransactions
    (family_id, account_id, user_id, description, amount, type, date, paid, payment_cycle)
  VALUES
    (v_family_id, v_account_id, v_user_id, 'FINAN PRISMA',          492.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'AGUA DE CASA',           85.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'LUZ',                   330.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'VIVO ANA',               49.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'VIVO WILL',              49.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'VIVO LÍVIA',             43.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'VIVO JA WILL',           43.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'LANCHE MORDOCK',         61.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'LUIZ TELE SENA',         80.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'MERCADO',               467.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'POSTO GLOBO',           182.00,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'NU BANK',              1542.25,  'expense', '2026-05-05', true, 'dia05'),
    (v_family_id, v_account_id, v_user_id, 'FARMACIA MASTER FARMA', 171.00,  'expense', '2026-05-05', true, 'dia05');

  RAISE NOTICE 'SEED CONCLUÍDO! Receitas: R$2.440,00 | Despesas: R$3.594,25 | Saldo: -R$1.154,25';
END;
$$;
