-- Salary slip QR verification registry.
-- Public users can verify a document ID through verify_salary_slip().
-- Only active HR/Admin users can register newly issued salary slips.

create table if not exists public.salary_slip_verifications (
  document_id text primary key,
  employee_name text not null,
  staff_id text not null,
  salary_month text not null,
  net_payable numeric(14,2) not null,
  issued_at timestamptz not null default now(),
  is_active boolean not null default true
);

alter table public.salary_slip_verifications enable row level security;
revoke all on public.salary_slip_verifications from anon, authenticated;

create or replace function public.register_salary_slip(
  p_document_id text,
  p_employee_name text,
  p_staff_id text,
  p_salary_month text,
  p_net_payable numeric
) returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_profiles p
    where p.user_id = auth.uid() and p.is_active = true
      and lower(p.role) in ('admin','hr')
  ) then
    raise exception 'Only active HR/Admin users can issue salary slips';
  end if;
  insert into public.salary_slip_verifications
    (document_id, employee_name, staff_id, salary_month, net_payable)
  values (p_document_id, p_employee_name, p_staff_id, p_salary_month, p_net_payable);
  return true;
end;
$$;

create or replace function public.verify_salary_slip(p_document_id text)
returns table (
  document_id text, employee_name text, staff_id text, salary_month text,
  net_payable numeric, issued_at timestamptz, is_valid boolean
)
language sql security definer set search_path = public
as $$
  select s.document_id, s.employee_name, s.staff_id, s.salary_month,
         s.net_payable, s.issued_at, s.is_active
  from public.salary_slip_verifications s
  where s.document_id = p_document_id
  limit 1;
$$;

revoke all on function public.register_salary_slip(text,text,text,text,numeric) from public, anon;
grant execute on function public.register_salary_slip(text,text,text,text,numeric) to authenticated;
grant execute on function public.verify_salary_slip(text) to anon, authenticated;
