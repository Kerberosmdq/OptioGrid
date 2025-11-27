-- Drop existing policies to avoid conflicts and ensure clean state
drop policy if exists "Users can view templates they own or collaborate on" on public.templates;
drop policy if exists "Users can view items of templates they own or collaborate on" on public.items;
drop policy if exists "Users can insert items to templates they own or edit" on public.items;
drop policy if exists "Users can update items of templates they own or edit" on public.items;
drop policy if exists "Users can delete items of templates they own or edit" on public.items;
drop policy if exists "Template owners can view collaborators" on public.collaborators;

-- 1. Collaborators Policies
-- Allow owners to view collaborators (existing) AND collaborators to view themselves (new)
create policy "Users can view collaborators"
  on public.collaborators for select
  using (
    (auth.jwt() ->> 'email') = user_email -- Collaborator can see themselves
    or exists (
      select 1 from public.templates
      where templates.id = collaborators.template_id
      and templates.owner_id = auth.uid() -- Owner can see collaborators
    )
  );

-- 2. Templates Policies
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

-- 3. Items Policies
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
