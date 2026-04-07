-- 1. Adicionar coluna de URL do PDF (se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saas_agreements' AND column_name='contract_pdf_url') THEN
        ALTER TABLE public.saas_agreements ADD COLUMN contract_pdf_url TEXT;
    END IF;
END $$;

-- 2. Atualizar Função de Sincronização para incluir Anexo
CREATE OR REPLACE FUNCTION public.fn_sync_saas_to_airtable()
RETURNS TRIGGER AS $$
DECLARE
    v_airtable_pat TEXT := 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
    v_base_id TEXT := 'app4o6LoQEhgWFGz1';
    v_current_month_year TEXT;
    v_attachments JSONB := '[]'::jsonb;
BEGIN
    -- Definir Mês/Ano atual
    v_current_month_year := TO_CHAR(NOW(), 'MM/YYYY');

    -- Se tiver URL do PDF, formatar para o Airtable
    IF NEW.contract_pdf_url IS NOT NULL AND NEW.contract_pdf_url != '' THEN
        v_attachments := jsonb_build_array(jsonb_build_object('url', NEW.contract_pdf_url));
    END IF;

    -- A. Enviar para a Tabela Contratos_SaaS
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

    -- B. Enviar a Primeira Mensalidade para a Tabela Pagamentos_Mensais
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
