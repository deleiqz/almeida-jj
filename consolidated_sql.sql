-- ==========================================================
-- SCRIPT DE ESTABILIZAÇÃO DEFINITIVO: VERSÃO COMPATÍVEL
-- ==========================================================
-- 💡 Versão com argumentos posicionais para evitar erro "function does not exist"

-- 1. CONFIGURAÇÃO DE STORAGE
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

-- 2. FUNÇÃO MESTRE (Argumentos Posicionais - Máxima Compatibilidade)
CREATE OR REPLACE FUNCTION public.fn_sync_saas_to_airtable()
RETURNS TRIGGER AS $$
DECLARE
    v_payload JSONB;
    v_attachments JSONB;
    v_airtable_pat TEXT := 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
    v_base_id TEXT := 'app4o6LoQEhgWFGz1';
BEGIN
    -- Preparar anexo (PDF)
    IF NEW.contract_pdf_url IS NOT NULL AND NEW.contract_pdf_url != '' THEN
        v_attachments := jsonb_build_array(jsonb_build_object('url', NEW.contract_pdf_url));
    ELSE
        v_attachments := '[]'::jsonb;
    END IF;

    -- Construir Payload para UPSERT
    v_payload := jsonb_build_object(
        'performUpsert', jsonb_build_object('fieldsToMergeOn', jsonb_build_array('Link ID')),
        'records', jsonb_build_array(
            jsonb_build_object(
                'fields', jsonb_build_object(
                    'Link ID', NEW.link_id,
                    'Nome Academia', NEW.gym_name,
                    'Endereço Sede', NEW.address,
                    'Dia Vencimento', NEW.payment_day,
                    'Valor Setup', 3250.00,
                    'Mensalidade', 200.00,
                    'Data Assinatura', TO_CHAR(NOW(), 'YYYY-MM-DD'),
                    'Status', 'Aguardando Pagamento',
                    'Anexo Contrato', v_attachments
                )
            )
        )
    );

    -- Envio para o Airtable via PATCH (Usando argumentos posicionais)
    -- Assinatura: net.http_request(method, url, headers, params, body, timeout)
    BEGIN
        PERFORM net.http_request(
            'PATCH'::text,                                             -- method
            ('https://api.airtable.com/v0/' || v_base_id || '/Contratos_SaaS')::text, -- url
            jsonb_build_object('Authorization', 'Bearer ' || v_airtable_pat, 'Content-Type', 'application/json'), -- headers
            '{}'::jsonb,                                               -- params
            v_payload::text,                                           -- body
            7000                                                       -- timeout
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro Airtable ignorado para salvar no Supabase: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APLICAÇÃO DO GATILHO
DROP TRIGGER IF EXISTS tr_sync_airtable ON public.saas_agreements;
CREATE TRIGGER tr_sync_airtable
AFTER INSERT OR UPDATE OF contract_pdf_url ON public.saas_agreements
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_saas_to_airtable();

GRANT ALL ON public.saas_agreements TO anon, authenticated, service_role;
