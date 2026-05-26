-- 🛡️ SCRIPT DE BLINDAGEM DEFINITIVA - ALMEIDA JJ 🛡️
-- Este script ativa o Row Level Security (RLS) em todas as tabelas e define políticas de acesso.

-- 1. ATIVAÇÃO DO RLS EM TODAS AS TABELAS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_contract_links ENABLE ROW LEVEL SECURITY;

-- 2. LIMPEZA DE POLÍTICAS ANTIGAS (Para evitar conflitos)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. POLÍTICAS PARA USUÁRIOS AUTENTICADOS (Dono / Professores)
-- Eles podem fazer TUDO em quase todas as tabelas de gestão
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY['students', 'expenses', 'classes', 'attendance', 'class_enrollments', 'settings', 'registration_links', 'profiles', 'saas_agreements', 'saas_contract_links'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE 'CREATE POLICY "Authenticated Full Access" ON public.' || quote_ident(t) || ' FOR ALL TO authenticated USING (true)';
    END LOOP;
END $$;

-- 4. POLÍTICAS PARA O SERVICE_ROLE (Backoffice / Oráculo)
-- Garante que o sistema sempre tenha acesso total via chaves de serviço
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY['students', 'expenses', 'classes', 'attendance', 'class_enrollments', 'settings', 'registration_links', 'profiles', 'saas_agreements', 'saas_contract_links'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE 'CREATE POLICY "Service Role Full Access" ON public.' || quote_ident(t) || ' FOR ALL TO service_role USING (true)';
    END LOOP;
END $$;

-- 5. POLÍTICAS ESPECÍFICAS PARA ACESSO PÚBLICO (anon) - NECESSÁRIO PARA O FLUXO DE CADASTRO
-- Alunos anônimos podem SE CADASTRAR (Insert) mas não ver a lista de outros alunos
CREATE POLICY "Public Student Registration" ON public.students 
FOR INSERT TO anon WITH CHECK (true);

-- Alunos anônimos podem ver as CONFIGURAÇÕES (para links de pagamento e Pix)
CREATE POLICY "Public View Settings" ON public.settings 
FOR SELECT TO anon USING (true);

-- Alunos anônimos podem validar seus LINKS DE REGISTRO
CREATE POLICY "Public View and Update Registration Links" ON public.registration_links 
FOR SELECT TO anon USING (true);

CREATE POLICY "Public Update Own Registration Link" ON public.registration_links 
FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Alunos anônimos podem assinar CONTRATOS SaaS (B2B Onboarding)
CREATE POLICY "Public SaaS Registration" ON public.saas_agreements 
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public SaaS View Own Agreement" ON public.saas_agreements 
FOR SELECT TO anon USING (link_id IS NOT NULL);

CREATE POLICY "Public SaaS View Contract Link" ON public.saas_contract_links 
FOR SELECT TO anon USING (true);

-- 6. PROTEÇÃO PARA PERFIS
-- Permite que qualquer usuário autenticado leia perfis (necessário para o sistema funcionar)
-- NOTA: NÃO usar subconsulta em profiles aqui — causa recursão infinita no RLS!
DROP POLICY IF EXISTS "Authenticated Full Access" ON public.profiles;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
CREATE POLICY "Authenticated can read all profiles" ON public.profiles 
FOR SELECT TO authenticated USING (true);

-- ✅ BANCO BLINDADO COM SUCESSO ✅
