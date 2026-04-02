-- 1. Criar Tabela de Links de Registro (Rastreamento)
CREATE TABLE IF NOT EXISTS public.registration_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id),
    recipient_name TEXT,
    recipient_phone TEXT,
    status TEXT DEFAULT 'enviado', -- 'enviado' ou 'finalizado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    student_id UUID REFERENCES public.students(id)
);

-- 2. Ativar Segurança (RLS) em TODAS as tabelas (Blindagem contra aviso do Supabase)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para Tabela de ALUNOS (students)
DROP POLICY IF EXISTS "Public registration" ON public.students;
CREATE POLICY "Public registration" ON public.students
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can see students" ON public.students;
CREATE POLICY "Authenticated users can see students" ON public.students
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can update students" ON public.students;
CREATE POLICY "Authenticated users can update students" ON public.students
    FOR UPDATE TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete students" ON public.students;
CREATE POLICY "Authenticated users can delete students" ON public.students
    FOR DELETE TO authenticated
    USING (true);

-- 4. Políticas para Tabela de LINKS (registration_links)
DROP POLICY IF EXISTS "Employees can see their own links" ON public.registration_links;
CREATE POLICY "Employees can see their own links" ON public.registration_links
    FOR SELECT TO authenticated
    USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Admins can see all links" ON public.registration_links;
CREATE POLICY "Admins can see all links" ON public.registration_links
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'admin' OR profiles.role = 'master' OR profiles.role = 'dono')
        )
    );

DROP POLICY IF EXISTS "Employees can insert links" ON public.registration_links;
CREATE POLICY "Employees can insert links" ON public.registration_links
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- Permitir que o formulário anônimo atualize o status para 'finalizado'
DROP POLICY IF EXISTS "Public update status" ON public.registration_links;
CREATE POLICY "Public update status" ON public.registration_links
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Perfil Público (profiles) - Necessário para o login funcionar com RLS
DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
CREATE POLICY "Users can see their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
CREATE POLICY "Admins can see all profiles" ON public.profiles FOR SELECT TO authenticated USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'master', 'dono'))
);
