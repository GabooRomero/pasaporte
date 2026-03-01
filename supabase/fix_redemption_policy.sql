-- Solo ejecutar esto para habilitar los permisos de actualización
-- Esto permite que "Canjear ahora" guarde el cambio en la base de datos

create policy "Users can update their own badges"
on public.user_badges
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
