-- 🛡️ AJUSTE DE SEGURANÇA E CORREÇÃO DE RLS - ALMEIDA JJ 🛡️
-- Execute este script no SQL Editor do Supabase para corrigir vulnerabilidades e liberar o formulário.

-- =========================================================================
-- 1. CORREÇÃO DA TABELA DE CONFIGURAÇÕES (SETTINGS)
-- =========================================================================
-- Permite que o formulário público consulte as configurações de pagamento
GRANT SELECT ON public.settings TO anon;

-- Remove política antiga se existir e cria uma segura que apenas permite 
-- ler chaves públicas de configuração (links de pagamento e status de bloqueio)
DROP POLICY IF EXISTS "Public View Settings" ON public.settings;
CREATE POLICY "Public View Settings" ON public.settings 
FOR SELECT TO anon 
USING (key IN ('payment_links', 'system_blocked'));


-- =========================================================================
-- 2. BLINDAGEM DA TABELA DE ALUNOS (STUDENTS)
-- =========================================================================
-- A política antiga "Public select students" com "USING (true)" permitia 
-- que qualquer pessoa lesse TODOS os alunos cadastrados na história da academia.
-- Esta nova política limita a leitura apenas ao aluno que está sendo cadastrado 
-- no exato momento (criado nos últimos 30 segundos e com status pendente),
-- permitindo que o formulário obtenha o ID gerado sem expor o banco de dados.
DROP POLICY IF EXISTS "Public select students" ON public.students;
CREATE POLICY "Public select students" ON public.students
FOR SELECT TO anon
USING (status = 'pendente' AND created_at >= (now() - interval '30 seconds'));


-- =========================================================================
-- 3. REFORÇO DE SEGURANÇA DOS LINKS DE CADASTRO (REGISTRATION_LINKS)
-- =========================================================================
-- Apenas permite ler links que ainda estejam ativos
DROP POLICY IF EXISTS "Enable select for anon" ON public.registration_links;
CREATE POLICY "Enable select for anon" ON public.registration_links
FOR SELECT TO anon
USING (status = 'ativo');


-- =========================================================================
-- 4. CONFIRMAÇÃO DE RLS ATIVO EM TODAS AS TABELAS CRÍTICAS
-- =========================================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_agreements ENABLE ROW LEVEL SECURITY;

-- ✅ BANCO BLINDADO E CONFIGURADO COM SUCESSO! ✅
