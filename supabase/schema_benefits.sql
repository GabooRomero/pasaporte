-- 4. Benefits Table (FOMO Comercial)
create table public.benefits (
  id uuid not null default gen_random_uuid(),
  attraction_id text not null references public.attractions(id) on delete cascade,
  commerce_name text not null, -- e.g. "Cervecería Hércules"
  short_description text not null, -- e.g. "Pinta Gratis"
  long_description text, -- e.g. "Canjeable con la compra de una hamburguesa"
  valid_hours int default 24, -- Duration of the promo after unlocking (e.g. 24 hours)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

-- RLS Policies for Benefits
alter table public.benefits enable row level security;

create policy "Benefits are viewable by everyone" on public.benefits
  for select using (true);

-- Mock Data for Benefits
insert into public.benefits (attraction_id, commerce_name, short_description, long_description, valid_hours)
values 
('glaciar', 'Bar de Hielo', 'Shot de Vodka Gratis', 'Válido presentando esta insignia. Solo una vez por persona.', 4),
('cataratas', 'Parrilla La Selva', '20% de Descuento', 'En parrillada libre. No acumulable.', 12);
