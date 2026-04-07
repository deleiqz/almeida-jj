-- 1. Habilitar a extensão pg_net (se ainda não estiver ativa)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Função Mestre de Sincronização (Piloto Automático)
-- Esta função será chamada automaticamente pelo banco de dados sempre que um novo contrato for inserido.
CREATE OR REPLACE FUNCTION public.fn_sync_saas_to_airtable()
RETURNS TRIGGER AS $$
DECLARE
    v_airtable_pat TEXT := 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
    v_base_id TEXT := 'app4o6LoQEhgWFGz1';
    v_current_month_year TEXT;
BEGIN
    -- Definir Mês/Ano atual para a primeira mensalidade
    v_current_month_year := TO_CHAR(NOW(), 'MM/YYYY');

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
                        'Status', 'Aguardando Pagamento Setup'
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
    -- Fallback silencioso (não impede o registro na Supabase se a rede falhar)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar o Gatilho (Trigger)
DROP TRIGGER IF EXISTS tr_sync_airtable ON public.saas_agreements;
CREATE TRIGGER tr_sync_airtable
    AFTER INSERT ON public.saas_agreements
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_sync_saas_to_airtable();

GRANT ALL ON public.saas_agreements TO anon, authenticated, service_role;
