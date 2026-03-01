-- Actualizar restricción de roles para incluir 'superadmin'
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check CHECK (role IN ('tourist', 'commerce', 'govt', 'superadmin'));
