-- 1. Remove a política recursiva que estava bloqueando o login
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;

-- 2. Permite que os usuários leiam QUALQUER perfil (necessário para listar quem é quem)
CREATE POLICY "Admins can see all profiles" ON public.profiles 
FOR SELECT TO authenticated USING (true);

-- 3. Atualiza o perfil do Breno para Dono
UPDATE public.profiles 
SET role = 'dono' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'breno@almeidajj.com');
