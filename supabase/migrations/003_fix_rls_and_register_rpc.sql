CREATE OR REPLACE FUNCTION create_default_categories(p_family_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO Gestao_FamiliarWillcategories (family_id, name, type, icon, color) VALUES
    (p_family_id, 'Alimentação',    'expense', 'utensils',       '#EF4444'),
    (p_family_id, 'Transporte',     'expense', 'car',            '#F97316'),
    (p_family_id, 'Moradia',        'expense', 'home',           '#8B5CF6'),
    (p_family_id, 'Saúde',          'expense', 'heart-pulse',    '#EC4899'),
    (p_family_id, 'Lazer',          'expense', 'gamepad-2',      '#06B6D4'),
    (p_family_id, 'Educação',       'expense', 'graduation-cap', '#3B82F6'),
    (p_family_id, 'Vestuário',      'expense', 'shirt',          '#F59E0B'),
    (p_family_id, 'Outros',         'expense', 'tag',            '#6B7280'),
    (p_family_id, 'Salário',        'income',  'briefcase',      '#10B981'),
    (p_family_id, 'Freelance',      'income',  'laptop',         '#059669'),
    (p_family_id, 'Investimentos',  'income',  'trending-up',    '#047857');
END; $$;

CREATE OR REPLACE FUNCTION register_family(p_family_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_family_id uuid;
BEGIN
  INSERT INTO Gestao_FamiliarWillfamilies (name) VALUES (p_family_name) RETURNING id INTO v_family_id;
  INSERT INTO Gestao_FamiliarWillfamily_members (family_id, user_id, role, status)
    VALUES (v_family_id, auth.uid(), 'admin', 'active');
  PERFORM create_default_categories(v_family_id);
  RETURN v_family_id;
END; $$;

DROP POLICY IF EXISTS "Users see own membership" ON Gestao_FamiliarWillfamily_members;
CREATE POLICY "Users see own membership" ON Gestao_FamiliarWillfamily_members
  FOR SELECT USING (user_id = auth.uid());
