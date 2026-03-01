-- 1. Profiles Table (Extends Supabase Auth)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to automatically create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Attractions Table (Replaces our Mock Data)
create table public.attractions (
  id text not null, -- Manual ID like 'glaciar', 'cataratas'
  name text not null,
  description text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

alter table public.attractions enable row level security;

create policy "Attractions are viewable by everyone."
  on attractions for select
  using ( true );

-- 3. User Badges Table (The "Passport")
create table public.user_badges (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  attraction_id text not null references public.attractions(id) on delete cascade,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id),
  unique(user_id, attraction_id) -- Prevent duplicate badges for same location
);

alter table public.user_badges enable row level security;

create policy "Users can view their own badges."
  on user_badges for select
  using ( auth.uid() = user_id );

create policy "Users can create their own badges (for now)."
  on user_badges for insert
  with check ( auth.uid() = user_id );

-- Insert Initial Data (Our previous Mock Data)
insert into public.attractions (id, name, description, image_url)
values
  ('glaciar', 'Glaciar Perito Moreno', 'Una de las maravillas naturales más impactantes de Argentina, ubicada en el Parque Nacional Los Glaciares.', 'https://images.unsplash.com/photo-1517232828383-0599c9c3817f?auto=format&fit=crop&w=800&q=80'),
  ('cataratas', 'Cataratas del Iguazú', 'El sistema de cascadas más grande del mundo, una fuerza de la naturaleza en la selva misionera.', 'https://images.unsplash.com/photo-1522606822283-e02fb4b8d781?auto=format&fit=crop&w=800&q=80'),
  ('obelisco', 'Obelisco de Buenos Aires', 'El histórico monumento ícono de Buenos Aires, ubicado en el corazón de la Avenida 9 de Julio.', 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?auto=format&fit=crop&w=800&q=80');
