-- 1. Add activated_at column to user_badges
ALTER TABLE public.user_badges 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Ensure redeemed_at exists as well (if not already)
ALTER TABLE public.user_badges 
ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Update Update Policy
-- Drop existing first to avoid duplication conflicts
DROP POLICY IF EXISTS "Users can update their own badges" ON public.user_badges;

create policy "Users can update their own badges"
on public.user_badges
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
