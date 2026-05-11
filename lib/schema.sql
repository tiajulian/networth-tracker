-- Run this in your Supabase SQL editor

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  account_type text not null check (account_type in ('indonesian_bank','indonesian_shares','australian_cash','super')),
  amount numeric not null,
  currency text not null check (currency in ('IDR','AUD')),
  date date not null,
  created_at timestamptz default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_amount_aud numeric not null,
  target_date date,
  created_at timestamptz default now()
);

-- Unique constraint so upsert works (one entry per account per day)
alter table entries add constraint entries_account_date_unique unique (account_type, date);

-- Index for fast time-series queries
create index if not exists entries_date_idx on entries (date desc);
create index if not exists entries_account_date_idx on entries (account_type, date desc);

-- Row level security (optional but recommended)
alter table entries enable row level security;
alter table goals enable row level security;

-- Allow all operations from service role (used by our API)
create policy "service role full access entries" on entries for all using (true);
create policy "service role full access goals" on goals for all using (true);
