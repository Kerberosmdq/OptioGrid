-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Templates Table
create table public.templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users not null,
  name text not null,
  category text,
  fields jsonb default '[]'::jsonb,
  is_archived boolean default false
);

-- Items Table
create table public.items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  template_id uuid references public.templates on delete cascade not null,
  url text not null,
  title text,
  price numeric,
  currency text default 'USD',
  image_url text,
  description text,
  metadata jsonb default '{}'::jsonb,
  user_notes text
);

-- Collaborators Table
create table public.collaborators (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.templates on delete cascade not null,
  user_email text not null,
  role text check (role in ('editor', 'viewer')),
  unique(template_id, user_email)
);

-- Votes Table
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  item_id uuid references public.items on delete cascade not null,
  unique(user_id, item_id)
);

-- Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  item_id uuid references public.items on delete cascade not null,
  content text not null
);

-- RLS Policies
alter table public.templates enable row level security;
alter table public.items enable row level security;
alter table public.collaborators enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

-- Templates Policies
-- Collaborators Policies
create policy "Template owners can view collaborators"
  on public.collaborators for select
  using (
    exists (
      select 1 from public.templates
      where templates.id = collaborators.template_id
      and templates.owner_id = auth.uid()
    )
  );

create policy "Template owners can insert collaborators"
  on public.collaborators for insert
  with check (
    exists (
      select 1 from public.templates
      where templates.id = template_id
      and templates.owner_id = auth.uid()
    )
  );

create policy "Template owners can delete collaborators"
  on public.collaborators for delete
  using (
    exists (
      select 1 from public.templates
      where templates.id = collaborators.template_id
      and templates.owner_id = auth.uid()
    )
  );

-- Updated Templates Policies (Include Collaborators)
create policy "Users can view templates they own or collaborate on"
  on public.templates for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.collaborators
      where collaborators.template_id = templates.id
      and collaborators.user_email = (select email from auth.users where id = auth.uid())
    )
  );

-- Updated Items Policies (Include Collaborators)
create policy "Users can view items of templates they own or collaborate on"
  on public.items for select
  using (
    exists (
      select 1 from public.templates
      where templates.id = items.template_id
      and (
        templates.owner_id = auth.uid()
        or exists (
          select 1 from public.collaborators
          where collaborators.template_id = templates.id
          and collaborators.user_email = (select email from auth.users where id = auth.uid())
        )
      )
    )
  );

create policy "Users can insert items to templates they own or edit"
  on public.items for insert
  with check (
    exists (
      select 1 from public.templates
      where templates.id = template_id
      and (
        templates.owner_id = auth.uid()
        or exists (
          select 1 from public.collaborators
          where collaborators.template_id = templates.id
          and collaborators.user_email = (select email from auth.users where id = auth.uid())
          and collaborators.role = 'editor'
        )
      )
    )
  );

create policy "Users can update items of templates they own or edit"
  on public.items for update
  using (
    exists (
      select 1 from public.templates
      where templates.id = items.template_id
      and (
        templates.owner_id = auth.uid()
        or exists (
          select 1 from public.collaborators
          where collaborators.template_id = templates.id
          and collaborators.user_email = (select email from auth.users where id = auth.uid())
          and collaborators.role = 'editor'
        )
      )
    )
  );

create policy "Users can delete items of templates they own or edit"
  on public.items for delete
  using (
    exists (
      select 1 from public.templates
      where templates.id = items.template_id
      and (
        templates.owner_id = auth.uid()
        or exists (
          select 1 from public.collaborators
          where collaborators.template_id = templates.id
          and collaborators.user_email = (select email from auth.users where id = auth.uid())
          and collaborators.role = 'editor'
        )
      )
    )
  );

-- Votes Policies
create policy "Users can view all votes"
  on public.votes for select
  using (true);

create policy "Authenticated users can vote"
  on public.votes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own votes"
  on public.votes for delete
  using (auth.uid() = user_id);

-- Comments Policies
create policy "Users can view all comments"
  on public.comments for select
  using (true);

create policy "Authenticated users can comment"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);
