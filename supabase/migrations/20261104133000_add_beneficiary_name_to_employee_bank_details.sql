alter table public.employee_bank_details
  add column if not exists beneficiary_name text;
