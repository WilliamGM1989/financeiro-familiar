-- RLS com WITH CHECK para todas as tabelas
DROP POLICY IF EXISTS "Users see own family data" ON Gestao_FamiliarWilltransactions;
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWilltransactions FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'))
  WITH CHECK (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'));

DROP POLICY IF EXISTS "Users see own family data" ON Gestao_FamiliarWillaccounts;
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillaccounts FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'))
  WITH CHECK (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'));

DROP POLICY IF EXISTS "Users see own family data" ON Gestao_FamiliarWillcategories;
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillcategories FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'))
  WITH CHECK (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'));

DROP POLICY IF EXISTS "Users see own family data" ON Gestao_FamiliarWillrecurring;
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillrecurring FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'))
  WITH CHECK (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'));

DROP POLICY IF EXISTS "Users see own family data" ON Gestao_FamiliarWillgoals;
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillgoals FOR ALL TO authenticated
  USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'))
  WITH CHECK (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'));

DROP POLICY IF EXISTS "Users see own family" ON Gestao_FamiliarWillfamilies;
CREATE POLICY "Users see own family" ON Gestao_FamiliarWillfamilies FOR ALL TO authenticated
  USING (id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'))
  WITH CHECK (id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active'));

-- RPC atômica add_goal_progress
CREATE OR REPLACE FUNCTION add_goal_progress(p_goal_id uuid, p_amount numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_new_amount numeric;
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'p_amount must be greater than zero'; END IF;
  UPDATE Gestao_FamiliarWillgoals
  SET current_amount = LEAST(current_amount + p_amount, target_amount)
  WHERE id = p_goal_id
    AND family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid() AND status = 'active')
  RETURNING current_amount INTO v_new_amount;
  IF v_new_amount IS NULL THEN RAISE EXCEPTION 'Goal not found or access denied'; END IF;
  RETURN v_new_amount;
END; $$;

REVOKE ALL ON FUNCTION add_goal_progress(uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION add_goal_progress(uuid, numeric) TO authenticated;

-- register_family com guarda contra múltiplas famílias
CREATE OR REPLACE FUNCTION register_family(p_family_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_family_id      uuid;
  v_existing_count integer;
BEGIN
  SELECT COUNT(*) INTO v_existing_count
  FROM Gestao_FamiliarWillfamily_members
  WHERE user_id = auth.uid() AND status = 'active';

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'User already belongs to a family.';
  END IF;

  INSERT INTO Gestao_FamiliarWillfamilies (name) VALUES (p_family_name) RETURNING id INTO v_family_id;
  INSERT INTO Gestao_FamiliarWillfamily_members (family_id, user_id, role, status)
    VALUES (v_family_id, auth.uid(), 'admin', 'active');
  PERFORM create_default_categories(v_family_id);
  RETURN v_family_id;
END; $$;

REVOKE ALL ON FUNCTION register_family(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_family(text) TO authenticated;
