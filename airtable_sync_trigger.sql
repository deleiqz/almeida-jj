-- ==========================================================
-- SCRIPT MESTRE: ALMEIDA JJ - SINCRONIZAÇÃO AIRTABLE 2.0
-- ==========================================================
-- 💡 Use este script em UMA ÚNICA ABA no SQL Editor do Supabase.
-- Depois de rodar, você pode fechar todas as outras abas de SQL.

-- 1. Habilitar a extensão pg_net (vital para o "Piloto Automático")
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Garantir que a coluna de PDF existe
ALTER TABLE public.saas_agreements ADD COLUMN IF NOT EXISTS contract_pdf_url TEXT;

-- 3. Função Mestre de Sincronização
-- Resolve: Nome, Documentos, Pagamento Inicial e Link do Contrato (PDF) no Airtable.
CREATE OR REPLACE FUNCTION public.fn_sync_saas_to_airtable()
RETURNS TRIGGER AS $$
DECLARE
    v_airtable_pat TEXT := 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
    v_base_id TEXT := 'app4o6LoQEhgWFGz1';
    v_current_month_year TEXT;
    v_attachments JSONB;
BEGIN
    -- Definir Mês/Ano atual para controle de faturamento
    v_current_month_year := TO_CHAR(NOW(), 'MM/YYYY');

    -- Preparar o PDF para o formato de Attachment do Airtable
    -- O Airtable espera: [{"url": "link-do-pdf"}]
    IF NEW.contract_pdf_url IS NOT NULL AND NEW.contract_pdf_url != '' THEN
        v_attachments := jsonb_build_array(jsonb_build_object('url', NEW.contract_pdf_url));
    ELSE
        v_attachments := '[]'::jsonb;
    END IF;

    -- A. Enviar para a Tabela Principal: Contratos_SaaS
    PERFORM net.http_post(
        url := 'https://api.airtable.com/v0/' || v_base_id || '/Contratos_SaaS',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_airtable_pat,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'records', jsonb_build_array(
                jsonb_build_object(
                    'fields', jsonb_build_object(
                        'Nome Academia', NEW.gym_name,
                        'CNPJ/CPF', NEW.cnpj_cpf,
                        'Responsavel 1', NEW.responsible_name,
                        'CPF Proprietário', NEW.responsible_cpf,
                        'Endereço Sede', NEW.address,
                        'Dia Vencimento', NEW.payment_day,
                        'Valor Setup', 3250.00,
                        'Mensalidade', 200.00,
                        'Data Assinatura', TO_CHAR(NOW(), 'YYYY-MM-DD'),
                        'Status', 'Aguardando Pagamento Setup',
                        'Anexo Contrato', v_attachments
                    )
                )
            )
        )
    );

    -- B. Lançar a primeira fatura na Tabela: Pagamentos_Mensais
    PERFORM net.http_post(
        url := 'https://api.airtable.com/v0/' || v_base_id || '/Pagamentos_Mensais',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_airtable_pat,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'records', jsonb_build_array(
                jsonb_build_object(
                    'fields', jsonb_build_object(
                        'Nome Academia', NEW.gym_name,
                        'Mês/Ano', v_current_month_year,
                        'Valor', 200.00,
                        'Status', 'Pendente',
                        'Tipo', 'Mensalidade'
                    )
                )
            )
        )
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback: Se der erro no Airtable, o registro ainda é salvo no Supabase
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Aplicar o Gatilho (Trigger) na tabela
DROP TRIGGER IF EXISTS tr_sync_airtable ON public.saas_agreements;
CREATE TRIGGER tr_sync_airtable
    AFTER INSERT ON public.saas_agreements
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_sync_saas_to_airtable();

-- 5. Ajustar Permissões
GRANT ALL ON public.saas_agreements TO anon, authenticated, service_role;

-- ✅ FIM DO SCRIPT ✅
