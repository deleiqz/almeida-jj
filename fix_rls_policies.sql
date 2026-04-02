-- 1. Permite que o formulário veja qual o ID do aluno que ele acabou de criar
-- Sem isso, o formulário não consegue "linkar" o aluno ao convite
DROP POLICY IF EXISTS "Public select students" ON students;
CREATE POLICY "Public select students" 
ON students 
FOR SELECT 
TO anon 
USING (true);

-- 2. Reforça as permissões da tabela de links para garantir que o formulário mude o status
DROP POLICY IF EXISTS "Enable select for anon" ON registration_links;
CREATE POLICY "Enable select for anon" 
ON registration_links 
FOR SELECT 
TO anon 
USING (true);

DROP POLICY IF EXISTS "Enable update for anon" ON registration_links;
CREATE POLICY "Enable update for anon" 
ON registration_links 
FOR UPDATE 
TO anon 
USING (true)
WITH CHECK (true);

-- 3. Limpeza de políticas duplicadas que podem causar conflito
DROP POLICY IF EXISTS "Public update status" ON registration_links;
DROP POLICY IF EXISTS "Public select links" ON registration_links;
DROP POLICY IF EXISTS "Public select registration_links" ON registration_links;
