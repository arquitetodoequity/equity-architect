-- Create enums
CREATE TYPE public.partner_type AS ENUM ('founder', 'key_person', 'pool');
CREATE TYPE public.partner_status AS ENUM ('active', 'inactive', 'reserve');
CREATE TYPE public.token_type_name AS ENUM ('ON', 'PN', 'PHANTOM', 'GOLDEN');
CREATE TYPE public.vesting_type AS ENUM ('time', 'milestone');
CREATE TYPE public.new_partner_mode AS ENUM ('pool', 'new_emission', 'both');
CREATE TYPE public.proposal_status AS ENUM ('open', 'approved', 'rejected');
CREATE TYPE public.vote_choice AS ENUM ('approve', 'reject');

-- Companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT,
  monthly_revenue TEXT,
  total_supply INTEGER NOT NULL DEFAULT 1000000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies are viewable by authenticated users" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Companies can be inserted by authenticated users" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);

-- Partners
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  token_amount INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  partner_type public.partner_type NOT NULL DEFAULT 'founder',
  status public.partner_status NOT NULL DEFAULT 'active',
  pix_key TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners are viewable by authenticated users" ON public.partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Partners can be inserted by authenticated users" ON public.partners FOR INSERT TO authenticated WITH CHECK (true);

-- Token types
CREATE TABLE public.token_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name public.token_type_name NOT NULL,
  description TEXT,
  has_voting_rights BOOLEAN NOT NULL DEFAULT false,
  has_economic_rights BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.token_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Token types viewable by authenticated" ON public.token_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Token types insertable by authenticated" ON public.token_types FOR INSERT TO authenticated WITH CHECK (true);

-- Vesting configs
CREATE TABLE public.vesting_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  has_vesting BOOLEAN NOT NULL DEFAULT false,
  cliff_months INTEGER DEFAULT 0,
  vesting_months INTEGER DEFAULT 0,
  vesting_type public.vesting_type DEFAULT 'time'
);
ALTER TABLE public.vesting_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vesting configs viewable by authenticated" ON public.vesting_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vesting configs insertable by authenticated" ON public.vesting_configs FOR INSERT TO authenticated WITH CHECK (true);

-- Governance rules
CREATE TABLE public.governance_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  quorum_standard INTEGER NOT NULL DEFAULT 51,
  quorum_entry INTEGER NOT NULL DEFAULT 67,
  quorum_exit INTEGER NOT NULL DEFAULT 67,
  quorum_rules_change INTEGER NOT NULL DEFAULT 75,
  quorum_dissolution INTEGER NOT NULL DEFAULT 100,
  new_partner_mode public.new_partner_mode NOT NULL DEFAULT 'pool'
);
ALTER TABLE public.governance_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Governance rules viewable by authenticated" ON public.governance_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Governance rules insertable by authenticated" ON public.governance_rules FOR INSERT TO authenticated WITH CHECK (true);

-- Proposals
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  proposal_type TEXT,
  quorum_required INTEGER NOT NULL DEFAULT 67,
  status public.proposal_status NOT NULL DEFAULT 'open',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closes_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proposals viewable by authenticated" ON public.proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Proposals insertable by authenticated" ON public.proposals FOR INSERT TO authenticated WITH CHECK (true);

-- Votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  vote public.vote_choice NOT NULL,
  token_weight INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes viewable by authenticated" ON public.votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Votes insertable by authenticated" ON public.votes FOR INSERT TO authenticated WITH CHECK (true);

-- Distributions
CREATE TABLE public.distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  distributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Distributions viewable by authenticated" ON public.distributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Distributions insertable by authenticated" ON public.distributions FOR INSERT TO authenticated WITH CHECK (true);