-- Families
CREATE TABLE Gestao_FamiliarWillfamilies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Family Members
CREATE TABLE Gestao_FamiliarWillfamily_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES Gestao_FamiliarWillfamilies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  invited_email text,
  status text CHECK (status IN ('active', 'pending')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Accounts
CREATE TABLE Gestao_FamiliarWillaccounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES Gestao_FamiliarWillfamilies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('checking', 'savings', 'wallet', 'credit_card')) DEFAULT 'checking',
  initial_balance numeric(15,2) DEFAULT 0,
  color text DEFAULT '#10B981',
  icon text DEFAULT 'wallet',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE Gestao_FamiliarWillcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES Gestao_FamiliarWillfamilies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  icon text DEFAULT 'tag',
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE Gestao_FamiliarWilltransactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES Gestao_FamiliarWillfamilies(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES Gestao_FamiliarWillaccounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES Gestao_FamiliarWillcategories(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  description text,
  amount numeric(15,2) NOT NULL,
  type text CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  date date NOT NULL,
  due_date date,
  paid boolean DEFAULT false,
  paid_at timestamptz,
  transfer_id uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Recurring
CREATE TABLE Gestao_FamiliarWillrecurring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES Gestao_FamiliarWillfamilies(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES Gestao_FamiliarWillaccounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES Gestao_FamiliarWillcategories(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  frequency text CHECK (frequency IN ('weekly', 'monthly', 'yearly')) NOT NULL,
  next_date date NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Goals
CREATE TABLE Gestao_FamiliarWillgoals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES Gestao_FamiliarWillfamilies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount numeric(15,2) NOT NULL,
  current_amount numeric(15,2) DEFAULT 0,
  deadline date,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gfw_transactions_family_date ON Gestao_FamiliarWilltransactions(family_id, date DESC);
CREATE INDEX idx_gfw_transactions_account ON Gestao_FamiliarWilltransactions(account_id);
CREATE INDEX idx_gfw_transactions_due_date ON Gestao_FamiliarWilltransactions(due_date) WHERE paid = false;

-- Enable RLS
ALTER TABLE Gestao_FamiliarWillfamilies ENABLE ROW LEVEL SECURITY;
ALTER TABLE Gestao_FamiliarWillfamily_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE Gestao_FamiliarWillaccounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE Gestao_FamiliarWillcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE Gestao_FamiliarWilltransactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE Gestao_FamiliarWillrecurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE Gestao_FamiliarWillgoals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWilltransactions
  FOR ALL USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid()));
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillaccounts
  FOR ALL USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid()));
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillcategories
  FOR ALL USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid()));
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillrecurring
  FOR ALL USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid()));
CREATE POLICY "Users see own family data" ON Gestao_FamiliarWillgoals
  FOR ALL USING (family_id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid()));
CREATE POLICY "Users see own family" ON Gestao_FamiliarWillfamilies
  FOR ALL USING (id IN (SELECT family_id FROM Gestao_FamiliarWillfamily_members WHERE user_id = auth.uid()));
CREATE POLICY "Users see own membership" ON Gestao_FamiliarWillfamily_members
  FOR ALL USING (user_id = auth.uid());
