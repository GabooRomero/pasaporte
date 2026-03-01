-- Add role and commerce_attraction_id columns to profiles table
-- Enforce role types: 'tourist', 'commerce', 'govt'

ALTER TABLE public.profiles 
ADD COLUMN role text DEFAULT 'tourist' CHECK (role IN ('tourist', 'commerce', 'govt')),
ADD COLUMN commerce_attraction_id text REFERENCES public.attractions(id);

-- Create an index on role for faster filtering if needed
CREATE INDEX idx_profiles_role ON public.profiles(role);
