-- Create RSVPs table
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  attending boolean not null,
  party_size integer not null default 1,
  message text,
  created_at timestamp with time zone default now(),
  unique(event_id, guest_email)
);

-- Enable RLS
alter table public.rsvps enable row level security;

-- RLS Policies for RSVPs
create policy "Anyone can view RSVPs"
  on public.rsvps for select
  using (true);

create policy "Anyone can insert RSVPs"
  on public.rsvps for insert
  with check (true);

create policy "Event hosts can update RSVPs for their events"
  on public.rsvps for update
  using (
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
      and events.host_user_id = auth.uid()
    )
  );

create policy "Event hosts can delete RSVPs for their events"
  on public.rsvps for delete
  using (
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
      and events.host_user_id = auth.uid()
    )
  );
