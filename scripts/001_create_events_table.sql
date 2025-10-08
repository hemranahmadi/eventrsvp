-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date text not null,
  time text not null,
  location text not null,
  host_name text not null,
  host_email text not null,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  active boolean default true,
  guest_limit integer,
  deadline text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.events enable row level security;

-- RLS Policies for events
create policy "Users can view all events"
  on public.events for select
  using (true);

create policy "Users can insert their own events"
  on public.events for insert
  with check (auth.uid() = host_user_id);

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = host_user_id);

create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = host_user_id);
