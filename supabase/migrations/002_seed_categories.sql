CREATE OR REPLACE FUNCTION create_default_categories(p_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO Gestao_FamiliarWillcategories (family_id, name, type, icon, color) VALUES
    (p_family_id, 'Alimentação',    'expense', 'utensils',      '#EF4444'),
    (p_family_id, 'Transporte',     'expense', 'car',           '#F97316'),
    (p_family_id, 'Moradia',        'expense', 'home',          '#8B5CF6'),
    (p_family_id, 'Saúde',          'expense', 'heart-pulse',   '#EC4899'),
    (p_family_id, 'Lazer',          'expense', 'gamepad-2',     '#06B6D4'),
    (p_family_id, 'Educação',       'expense', 'graduation-cap','#3B82F6'),
    (p_family_id, 'Vestuário',      'expense', 'shirt',         '#F59E0B'),
    (p_family_id, 'Outros',         'expense', 'tag',           '#6B7280'),
    (p_family_id, 'Salário',        'income',  'briefcase',     '#10B981'),
    (p_family_id, 'Freelance',      'income',  'laptop',        '#059669'),
    (p_family_id, 'Investimentos',  'income',  'trending-up',   '#047857');
END;
$$;
