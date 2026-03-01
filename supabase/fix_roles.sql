-- SCRIPT ROBUSTO PARA ASIGNAR ROLES
-- Este script crea el perfil si no existe, o lo actualiza si ya existe.

-- 1. Para GOBIERNO (Reemplaza el email)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'govt'
FROM auth.users
WHERE email = 'funcionario@gobierno.com' -- 👈 TU EMAIL AQUÍ
ON CONFLICT (id) DO UPDATE
SET role = 'govt';

-- 2. Para COMERCIO (Reemplaza email y ID de atracción)
INSERT INTO public.profiles (id, email, role, commerce_attraction_id)
SELECT id, email, 'commerce', 'AQUI_EL_UUID_DE_LA_ATRACCION' -- 👈 ID ATRACCIÓN AQUÍ
FROM auth.users
WHERE email = 'comercio@bar.com' -- 👈 TU EMAIL AQUÍ
ON CONFLICT (id) DO UPDATE
SET role = 'commerce',
    commerce_attraction_id = EXCLUDED.commerce_attraction_id;

-- 3. Para SUPERADMIN (Reemplaza el email)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'superadmin'
FROM auth.users
WHERE email = 'admin@super.com' -- 👈 TU EMAIL AQUÍ
ON CONFLICT (id) DO UPDATE
SET role = 'superadmin';
