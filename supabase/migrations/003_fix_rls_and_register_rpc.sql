-- Migration 003: Fix RLS policies + create secure register_family RPC
-- Problema 1: family_members policy permite qualquer usuário entrar em qualquer família
-- Problema 2: registro faz inserts client-side que sofrem deadlock de RLS
-- Problema 3: create_default_categories sem search_path (risco de injection)

-- ─── 1. Corrigir create_default_categories (adicionar search_path) ────────────
CREATE OR REPLACE FUNCTION create_default_categories(p_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (family_id, name, type, icon, color) VALUES
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
END;
$$;

-- ─── 2. Criar RPC segura para registro (SECURITY DEFINER) ────────────────────
-- Resolve o deadlock: a função roda com privilégios de superusuário do Postgres,
-- contornando o RLS durante o registro inicial. O app chama apenas esta RPC.
CREATE OR REPLACE FUNCTION register_family(p_family_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id uuid;
BEGIN
  -- Criar família
  INSERT INTO families (name)
  VALUES (p_family_name)
  RETURNING id INTO v_family_id;

  -- Adicionar usuário logado como admin da família
  INSERT INTO family_members (family_id, user_id, role, status)
  VALUES (v_family_id, auth.uid(), 'admin', 'active');

  -- Criar categorias padrão
  PERFORM create_default_categories(v_family_id);

  RETURN v_family_id;
END;
$$;

-- ─── 3. Corrigir RLS de family_members (bloquear cross-family injection) ─────
-- Problema: policy FOR ALL com apenas USING permite INSERT em qualquer família
DROP POLICY IF EXISTS "Users see own membership" ON family_members;

-- SELECT: usuário vê apenas seus próprios memberships
CREATE POLICY "Users see own membership" ON family_members
  FOR SELECT
  USING (user_id = auth.uid());

-- INSERT/UPDATE/DELETE: bloqueados para o cliente (apenas via SECURITY DEFINER functions)
-- Sem policies de mutação = RLS bloqueia tudo no client, apenas funções server-side operam
