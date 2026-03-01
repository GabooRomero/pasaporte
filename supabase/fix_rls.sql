-- Allow authenticated users to insert their own badges
create policy "Users can insert their own badges"
on public.user_badges
for insert
to authenticated
with check (auth.uid() = user_id);

-- Ensure they can see them (already likely exists, but reinforcing)
-- create policy "Users can view their own badges" on public.user_badges for select using (auth.uid() = user_id);
