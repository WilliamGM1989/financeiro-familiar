-- Migration 005: Security fixes
-- Auditoria identificou três vulnerabilidades:
--   [ALTO]  Tarefa 1 — RLS WITH CHECK ausente em todas as tabelas de domínio
--   [MÉDIO] Tarefa 2 — Race condition em goal progress (read-modify-write no client)
--   [MÉDIO] Tarefa 3 — register_family sem guarda contra múltiplas famílias por usuário

-- ─────────────────────────────────────────────────────────────────────────────
-- TAREFA 1 — Recriar policies com WITH CHECK
-- ─────────────────────────────────────────────────────────────────────────────

-- ── transactions ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own family data" ON transactions;

CREATE POLICY "Users see own family data" ON transactions
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ── accounts ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own family data" ON accounts;

CREATE POLICY "Users see own family data" ON accounts
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ── categories ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own family data" ON categories;

CREATE POLICY "Users see own family data" ON categories
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ── recurring ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own family data" ON recurring;

CREATE POLICY "Users see own family data" ON recurring
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ── goals ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own family data" ON goals;

CREATE POLICY "Users see own family data" ON goals
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ── families ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own family" ON families;

CREATE POLICY "Users see own family" ON families
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TAREFA 2 — RPC atômica add_goal_progress (elimina race condition)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION add_goal_progress(
  p_goal_id uuid,
  p_amount  numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_amount numeric;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount must be greater than zero';
  END IF;

  UPDATE goals
  SET current_amount = LEAST(current_amount + p_amount, target_amount)
  WHERE id = p_goal_id
    AND family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  RETURNING current_amount INTO v_new_amount;

  IF v_new_amount IS NULL THEN
    RAISE EXCEPTION 'Goal not found or access denied';
  END IF;

  RETURN v_new_amount;
END;
$$;

REVOKE ALL ON FUNCTION add_goal_progress(uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION add_goal_progress(uuid, numeric) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- TAREFA 3 — Guarda em register_family (impede famílias ilimitadas)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION register_family(p_family_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id      uuid;
  v_existing_count integer;
BEGIN
  -- GUARDA: impede criação de múltiplas famílias
  SELECT COUNT(*) INTO v_existing_count
  FROM family_members
  WHERE user_id = auth.uid()
    AND status = 'active';

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'User already belongs to a family. Leave the current family before creating a new one.';
  END IF;

  INSERT INTO families (name)
  VALUES (p_family_name)
  RETURNING id INTO v_family_id;

  INSERT INTO family_members (family_id, user_id, role, status)
  VALUES (v_family_id, auth.uid(), 'admin', 'active');

  PERFORM create_default_categories(v_family_id);

  RETURN v_family_id;
END;
$$;

REVOKE ALL ON FUNCTION register_family(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_family(text) TO authenticated;
