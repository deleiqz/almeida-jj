-- 1. FAXINA DE GATILHOS ANTIGOS (Remove qualquer "Infiltrado" que cause duplicados ou linhas vazias)
DROP TRIGGER IF EXISTS sync_saas_to_airtable ON public.saas_agreements;
DROP TRIGGER IF EXISTS send_to_airtable ON public.saas_agreements;
DROP TRIGGER IF EXISTS tr_sync_saas ON public.saas_agreements;
DROP TRIGGER IF EXISTS tr_sync_airtable ON public.saas_agreements;
DROP FUNCTION IF EXISTS public.fn_sync_saas_to_airtable() CASCADE;

-- 2. CONFIGURAÇÃO DE STORAGE (Garantir acesso público ao PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to Contracts') THEN
        CREATE POLICY "Public Access to Contracts" ON storage.objects
        FOR SELECT TO public USING (bucket_id = 'contracts');
    END IF;
END $$;

-- 3. FUNÇÃO MESTRE DEFINITIVA: Sincronização e Upsert
CREATE OR REPLACE FUNCTION public.fn_sync_saas_to_airtable()
RETURNS TRIGGER AS $$
DECLARE
    v_payload JSONB;
    v_attachments JSONB;
    v_airtable_pat TEXT := 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
    v_base_id TEXT := 'app4o6LoQEhgWFGz1';
BEGIN
    -- Formata o objeto de anexo seguindo o padrão exato da API do Airtable
    IF NEW.contract_pdf_url IS NOT NULL AND NEW.contract_pdf_url != '' THEN
        v_attachments := jsonb_build_array(jsonb_build_object('url', NEW.contract_pdf_url));
    ELSE
        -- Se não tiver PDF ainda, manda apenas o array vazio (Airtable exige array para anexos)
        v_attachments := '[]'::jsonb;
    END IF;

    -- Constrói o Payload com suporte a UPSERT baseado no Link ID
    -- Garantimos que o 'Link ID' seja enviado como Texto e seja o campo de mesclagem
    v_payload := jsonb_build_object(
        'performUpsert', jsonb_build_object('fieldsToMergeOn', jsonb_build_array('Link ID')),
        'records', jsonb_build_array(
            jsonb_build_object(
                'fields', jsonb_build_object(
                    'Link ID', NEW.link_id::text,
                    'Nome Academia', COALESCE(NEW.gym_name, 'Academia Sem Nome'),
                    'Endereço Sede', COALESCE(NEW.address, ''),
                    'Dia Vencimento', COALESCE(NEW.payment_day::text, '20'),
                    'Valor Setup', 3250.00,
                    'Mensalidade', 200.00,
                    'Data Assinatura', TO_CHAR(NOW(), 'YYYY-MM-DD'),
                    'Status', 'Aguardando Pagamento',
                    'Anexo Contrato', v_attachments
                )
            )
        )
    );

    -- Envio Blindado: Tenta sincronizar, mas não cancela o salvamento se o Airtable estiver fora do ar.
    BEGIN
        PERFORM net.http_request(
            'PATCH'::text,
            ('https://api.airtable.com/v0/' || v_base_id || '/Contratos_SaaS')::text,
            jsonb_build_object('Authorization', 'Bearer ' || v_airtable_pat, 'Content-Type', 'application/json'),
            '{}'::jsonb,
            v_payload::text,
            7000
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Sincronização Airtable ignorada: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATIVAÇÃO DO GATILHO (Dispara no Insert e no Upgrade do PDF)
CREATE TRIGGER tr_sync_airtable
AFTER INSERT OR UPDATE OF contract_pdf_url ON public.saas_agreements
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_saas_to_airtable();

GRANT ALL ON public.saas_agreements TO anon, authenticated, service_role;

-- ✅ FIM DO SCRIPT ✅
