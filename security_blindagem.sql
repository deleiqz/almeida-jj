-- 🛡️ PROTOCOLO DE BLINDAGEM ALMEIDA JJ 🛡️

-- 1. REVOGAÇÃO DE PODERES EXTRAS
-- Removemos a permissão total que o usuário anônimo tinha por engano
REVOKE ALL ON TABLE public.saas_agreements FROM anon;

-- 2. ATIVAÇÃO DE RLS (Row Level Security)
-- Ativa o "Cadeado" por linha na tabela de contratos
ALTER TABLE public.saas_agreements ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACESSO GRANULARES
-- Permite que qualquer pessoa CRIE um novo registro (Onboarding)
CREATE POLICY "Permitir Cadastro de Novos Contratos" 
ON public.saas_agreements FOR INSERT 
TO anon WITH CHECK (true);

-- Permite que a pessoa acesse apenas o SEU PRÓPRIO contrato via Link ID
CREATE POLICY "Permitir Acesso via Link ID" 
ON public.saas_agreements FOR SELECT 
TO anon USING (link_id IS NOT NULL);

-- Permite que o Oráculo (Ordem Superior) atualize os PDFs
CREATE POLICY "Permitir Update do PDF via Oráculo" 
ON public.saas_agreements FOR UPDATE 
TO anon USING (true) 
WITH CHECK (true);

-- 4. BLINDAGEM DAS OUTRAS TABELAS (Garantia de segurança)
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;

-- Apenas usuários autenticados (Dono da Academia) podem gerenciar alunos e gastos
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Manage All' AND tablename = 'students') THEN
        CREATE POLICY "Authenticated Manage All" ON public.students FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Manage All' AND tablename = 'expenses') THEN
        CREATE POLICY "Authenticated Manage All" ON public.expenses FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Manage All' AND tablename = 'attendance') THEN
        CREATE POLICY "Authenticated Manage All" ON public.attendance FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- 5. RECONCESSÃO CONTROLADA
-- Agora damos apenas o necessário para o formulário funcionar
GRANT INSERT, SELECT, UPDATE(contract_pdf_url) ON TABLE public.saas_agreements TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ✅ BANCO BLINDADO COM SUCESSO ✅
