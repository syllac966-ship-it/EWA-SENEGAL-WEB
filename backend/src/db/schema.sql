-- EWA Senegal - schéma de base de données
-- Toutes les tables utilisent des UUID en clé primaire et des requêtes
-- paramétrées côté application (jamais de SQL concaténé).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('employee', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Migration douce : bases créées avant l'introduction du statut "pending"
-- (inscription en libre-service, en attente de validation RH).
ALTER TYPE employee_status ADD VALUE IF NOT EXISTS 'pending';

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('wave', 'orange_money');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE advance_status AS ENUM ('pending', 'approved', 'rejected', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Entreprises partenaires (habilitées à faire bénéficier leurs salariés d'EWA)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employés
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  department VARCHAR(100),
  company_id UUID REFERENCES companies(id),
  monthly_salary NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_salary >= 0),
  hire_date DATE NOT NULL,
  status employee_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration douce : bases créées avant les entreprises partenaires / l'inscription en libre-service
ALTER TABLE employees ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
DO $$ BEGIN
  ALTER TABLE employees ALTER COLUMN monthly_salary SET DEFAULT 0;
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE employees DROP CONSTRAINT employees_monthly_salary_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE employees ADD CONSTRAINT employees_monthly_salary_check CHECK (monthly_salary >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Comptes d'authentification (salarié ou admin RH)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT employee_role_has_employee CHECK (
    (role = 'employee' AND employee_id IS NOT NULL) OR
    (role = 'admin' AND employee_id IS NULL)
  )
);

-- Migration douce : bases créées avant la suppression de compte (soft delete)
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- Jetons de réinitialisation de mot de passe (le jeton brut n'est jamais stocké,
-- seul son hash SHA-256 l'est — comparable à un mot de passe à usage unique).
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);

-- Paramètres de paie (une seule ligne active pour le MVP)
CREATE TABLE IF NOT EXISTS payroll_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  working_days_per_month INTEGER NOT NULL DEFAULT 22 CHECK (working_days_per_month > 0),
  advance_cap_percent NUMERIC(5, 2) NOT NULL DEFAULT 50 CHECK (advance_cap_percent > 0 AND advance_cap_percent <= 100),
  pay_period_start_day INTEGER NOT NULL DEFAULT 1 CHECK (pay_period_start_day BETWEEN 1 AND 28),
  service_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 5 CHECK (service_fee_percent >= 0 AND service_fee_percent <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES users(id)
);

-- Migration douce pour les bases déjà créées avant l'ajout des frais de service
ALTER TABLE payroll_settings
  ADD COLUMN IF NOT EXISTS service_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 5
    CHECK (service_fee_percent >= 0 AND service_fee_percent <= 100);

-- Journal des jours travaillés (pointage simplifié)
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(employee_id, work_date);

-- Demandes d'avance sur salaire
CREATE TABLE IF NOT EXISTS advance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  worked_days INTEGER NOT NULL CHECK (worked_days >= 0),
  daily_rate NUMERIC(12, 2) NOT NULL CHECK (daily_rate >= 0),
  earned_amount NUMERIC(12, 2) NOT NULL CHECK (earned_amount >= 0),
  cap_amount NUMERIC(12, 2) NOT NULL CHECK (cap_amount >= 0),
  requested_amount NUMERIC(12, 2) NOT NULL CHECK (requested_amount > 0),
  service_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 5 CHECK (service_fee_percent >= 0),
  fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  total_deduction_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_deduction_amount >= 0),
  payment_method payment_method NOT NULL,
  payment_phone VARCHAR(20) NOT NULL,
  status advance_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT requested_within_cap CHECK (requested_amount <= cap_amount),
  CONSTRAINT total_deduction_matches CHECK (total_deduction_amount = requested_amount + fee_amount)
);

CREATE INDEX IF NOT EXISTS idx_advance_requests_employee ON advance_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_advance_requests_status ON advance_requests(status);

-- Migration douce pour les bases déjà créées avant l'ajout des frais de service
ALTER TABLE advance_requests ADD COLUMN IF NOT EXISTS service_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 5 CHECK (service_fee_percent >= 0);
ALTER TABLE advance_requests ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0);
ALTER TABLE advance_requests ADD COLUMN IF NOT EXISTS total_deduction_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_deduction_amount >= 0);

-- Rétro-calcule les frais pour les demandes créées avant l'introduction des frais de service
UPDATE advance_requests
SET fee_amount = ROUND(requested_amount * (service_fee_percent / 100), 2),
    total_deduction_amount = requested_amount + ROUND(requested_amount * (service_fee_percent / 100), 2)
WHERE total_deduction_amount = 0;

DO $$ BEGIN
  ALTER TABLE advance_requests ADD CONSTRAINT total_deduction_matches CHECK (total_deduction_amount = requested_amount + fee_amount);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Paiements (simulation Wave / Orange Money — aucun appel réseau réel)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_request_id UUID NOT NULL UNIQUE REFERENCES advance_requests(id) ON DELETE CASCADE,
  method payment_method NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  phone_number VARCHAR(20) NOT NULL,
  provider_transaction_id VARCHAR(64) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_advance_request ON payments(advance_request_id);

-- Messages du formulaire "Nous contacter"
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user ON support_messages(user_id);
