
-- Payroll: Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  employment_type TEXT DEFAULT 'full-time',
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  termination_date DATE,
  basic_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  housing_allowance NUMERIC(15,2) DEFAULT 0,
  transport_allowance NUMERIC(15,2) DEFAULT 0,
  other_allowances NUMERIC(15,2) DEFAULT 0,
  bank_name TEXT,
  bank_account_number TEXT,
  tax_id TEXT,
  pension_id TEXT,
  nhf_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll runs
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','processing','completed','cancelled')),
  total_gross NUMERIC(15,2) DEFAULT 0,
  total_net NUMERIC(15,2) DEFAULT 0,
  total_paye NUMERIC(15,2) DEFAULT 0,
  total_pension NUMERIC(15,2) DEFAULT 0,
  total_nhf NUMERIC(15,2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_month, period_year)
);

-- Payslips
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_salary NUMERIC(15,2) NOT NULL,
  housing_allowance NUMERIC(15,2) DEFAULT 0,
  transport_allowance NUMERIC(15,2) DEFAULT 0,
  other_allowances NUMERIC(15,2) DEFAULT 0,
  gross_pay NUMERIC(15,2) NOT NULL,
  paye_tax NUMERIC(15,2) DEFAULT 0,
  pension_employee NUMERIC(15,2) DEFAULT 0,
  pension_employer NUMERIC(15,2) DEFAULT 0,
  nhf NUMERIC(15,2) DEFAULT 0,
  other_deductions NUMERIC(15,2) DEFAULT 0,
  net_pay NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own employees" ON public.employees FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own payroll runs" ON public.payroll_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own payslips" ON public.payslips FOR ALL USING (
  EXISTS (SELECT 1 FROM public.payroll_runs pr WHERE pr.id = payslips.payroll_run_id AND pr.user_id = auth.uid())
);
