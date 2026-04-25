-- Families
CREATE TABLE families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Family Members
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  invited_email text,
  status text CHECK (status IN ('active', 'pending')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Accounts
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('checking', 'savings', 'wallet', 'credit_card')) DEFAULT 'checking',
  initial_balance numeric(15,2) DEFAULT 0,
  color text DEFAULT '#10B981',
  icon text DEFAULT 'wallet',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  icon text DEFAULT 'tag',
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
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
CREATE TABLE recurring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  frequency text CHECK (frequency IN ('weekly', 'monthly', 'yearly')) NOT NULL,
  next_date date NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Goals
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount numeric(15,2) NOT NULL,
  current_amount numeric(15,2) DEFAULT 0,
  deadline date,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_family_date ON transactions(family_id, date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_due_date ON transactions(due_date) WHERE paid = false;

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users see own family data" ON transactions
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own family data" ON accounts
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own family data" ON categories
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own family data" ON recurring
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own family data" ON goals
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own family" ON families
  FOR ALL USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own membership" ON family_members
  FOR ALL USING (user_id = auth.uid());
