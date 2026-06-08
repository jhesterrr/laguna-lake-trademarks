-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'client')) default 'client',
  full_name text,
  email text unique,
  phone text,
  firm_name text, -- For admin
  company_name text, -- For clients
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Inquiries Table
create table public.inquiries (
  id text primary key,
  client_name text not null,
  company_name text,
  email text not null,
  phone text,
  service_type text not null,
  message text not null,
  status text check (status in ('new', 'reviewed', 'contacted', 'converted')) default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Cases Table
create table public.cases (
  id text primary key,
  client_id uuid references public.profiles(id),
  client_name text not null,
  client_email text,
  title text not null,
  type text not null,
  status text check (status in ('draft', 'review', 'filed', 'published', 'registered', 'rejected')) default 'draft',
  filing_date timestamp with time zone,
  application_number text,
  registration_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Messages/Threads Table
create table public.threads (
  id text primary key,
  client_id uuid references public.profiles(id),
  client_name text not null,
  client_email text,
  subject text not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()),
  unread_count integer default 0
);

create table public.messages (
  id text primary key,
  thread_id text references public.threads(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  sender_role text check (sender_role in ('admin', 'client')),
  sender_name text not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Payments Table
create table public.payments (
  id text primary key,
  client_id uuid references public.profiles(id),
  client_name text not null,
  case_id text references public.cases(id),
  case_title text,
  amount numeric not null,
  description text not null,
  status text check (status in ('pending', 'paid', 'overdue', 'cancelled')) default 'pending',
  due_date timestamp with time zone not null,
  paid_date timestamp with time zone,
  invoice_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Notifications Table
create table public.notifications (
  id text primary key,
  user_id uuid references public.profiles(id), -- Who receives the notification
  type text check (type in ('inquiry', 'message', 'payment', 'case', 'system')),
  title text not null,
  description text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup Row Level Security (RLS) - Basic open policies for prototyping
-- In production, you should lock these down based on auth.uid()
alter table public.profiles enable row level security;
alter table public.inquiries enable row level security;
alter table public.cases enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- Create policies to allow all for prototyping (Warning: Secure these before going live)
create policy "Allow all profiles" on public.profiles for all using (true);
create policy "Allow all inquiries" on public.inquiries for all using (true);
create policy "Allow all cases" on public.cases for all using (true);
create policy "Allow all threads" on public.threads for all using (true);
create policy "Allow all messages" on public.messages for all using (true);
create policy "Allow all payments" on public.payments for all using (true);
create policy "Allow all notifications" on public.notifications for all using (true);

-- Enable Realtime for all tables
alter publication supabase_realtime add table public.inquiries;
alter publication supabase_realtime add table public.cases;
alter publication supabase_realtime add table public.threads;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.notifications;
