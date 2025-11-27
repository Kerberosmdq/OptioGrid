-- Fix infinite recursion in RLS policies using a SECURITY DEFINER function

-- 1. Create a helper function to check ownership without triggering RLS
create or replace function public.is_template_owner(_template_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.templates
    where id = _template_id
    and owner_id = auth.uid()
  );
$$;

-- 2. Drop existing policies to start fresh
drop policy if exists "Users can view templates they own or collaborate on" on public.templates;
drop policy if exists "Users can view items of templates they own or collaborate on" on public.items;
drop policy if exists "Users can insert items to templates they own or edit" on public.items;
drop policy if exists "Users can update items of templates they own or edit" on public.items;
drop policy if exists "Users can delete items of templates they own or edit" on public.items;
drop policy if exists "Template owners can view collaborators" on public.collaborators;
drop policy if exists "Template owners can insert collaborators" on public.collaborators;
drop policy if exists "Template owners can delete collaborators" on public.collaborators;
drop policy if exists "Users can view collaborators" on public.collaborators;
drop policy if exists "Users can manage collaborators" on public.collaborators;

-- 3. Collaborators Policies (Using the new function to break recursion)
create policy "Users can view collaborators"
  on public.collaborators for select
  using (
    (auth.jwt() ->> 'email') = user_email -- Collaborator can see themselves
    or public.is_template_owner(template_id) -- Owner can see collaborators (via secure function)
  );

create policy "Template owners can insert collaborators"
  on public.collaborators for insert
  with check (
    public.is_template_owner(template_id)
  );

create policy "Template owners can delete collaborators"
  on public.collaborators for delete
  using (
    public.is_template_owner(template_id)
  );

-- 4. Templates Policies
create policy "Users can view templates they own or collaborate on"
  on public.templates for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.collaborators
      where collaborators.template_id = templates.id
      and collaborators.user_email = (auth.jwt() ->> 'email')
    )
  );

-- 5. Items Policies
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
          and collaborators.user_email = (auth.jwt() ->> 'email')
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
          and collaborators.user_email = (auth.jwt() ->> 'email')
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
          and collaborators.user_email = (auth.jwt() ->> 'email')
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
          and collaborators.user_email = (auth.jwt() ->> 'email')
          and collaborators.role = 'editor'
        )
      )
    )
  );
