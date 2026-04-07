import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import jjBg from '../assets/jj-bg.png';
import logo from '../assets/logo.jpg';
import { CheckCircle, ShieldCheck, Send, Info, Trash2, Printer, LayoutDashboard, CreditCard, ExternalLink, Calendar } from 'lucide-react';

const SaaSContractForm = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const contractLinkId = queryParams.get('contrato_saas');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isValidLink, setIsValidLink] = useState(false);
    const [recipientName, setRecipientName] = useState('');
    const [sigUrls, setSigUrls] = useState({ url1: '', url2: '' });
    const [paymentLink, setPaymentLink] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    const [formData, setFormData] = useState({
        gymName: '',
        cnpjCpf: '',
        address: '',
        responsibleName1: '',
        responsibleCpf1: '',
        responsibleRg1: '',
        responsibleEnd1: '',
        responsibleCep1: '',
        responsibleName2: '',
        responsibleCpf2: '',
        responsibleRg2: '',
        responsibleEnd2: '',
        responsibleCep2: '',
        paymentDay: '05'
    });

    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    let isDrawing1 = false;
    let isDrawing2 = false;

    useEffect(() => {
        const validateLink = async () => {
            if (!contractLinkId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('saas_contract_links')
                .select('*')
                .eq('id', contractLinkId)
                .eq('status', 'pendente')
                .single();

            if (data) {
                setIsValidLink(true);
                setRecipientName(data.recipient_name);
                setFormData(prev => ({ ...prev, gymName: data.recipient_name }));
            }
            setLoading(false);
        };
        validateLink();
    }, [contractLinkId]);

    useEffect(() => {
        if (!isValidLink || submitted) return;

        const setupCanvas = (canvas, refIndex) => {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;

            const getPos = (e) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return { x: clientX - rect.left, y: clientY - rect.top };
            };

            const start = (e) => { 
                if (refIndex === 1) isDrawing1 = true; else isDrawing2 = true;
                const pos = getPos(e); 
                ctx.beginPath(); 
                ctx.moveTo(pos.x, pos.y); 
                if(e.cancelable) e.preventDefault(); 
            };
            
            const move = (e) => { 
                const drawing = refIndex === 1 ? isDrawing1 : isDrawing2;
                if (!drawing) return; 
                const pos = getPos(e); 
                ctx.lineTo(pos.x, pos.y); 
                ctx.stroke(); 
                if(e.cancelable) e.preventDefault(); 
            };
            
            const end = () => { if (refIndex === 1) isDrawing1 = false; else isDrawing2 = false; };

            canvas.addEventListener('mousedown', start);
            canvas.addEventListener('mousemove', move);
            window.addEventListener('mouseup', end);
            canvas.addEventListener('touchstart', start, { passive: false });
            canvas.addEventListener('touchmove', move, { passive: false });
            canvas.addEventListener('touchend', end);

            return () => {
                canvas.removeEventListener('mousedown', start);
                canvas.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', end);
                canvas.removeEventListener('touchstart', start);
                canvas.removeEventListener('touchmove', move);
                canvas.removeEventListener('touchend', end);
            };
        };

        const cleanup1 = setupCanvas(canvasRef1.current, 1);
        const cleanup2 = setupCanvas(canvasRef2.current, 2);

        return () => {
            if (cleanup1) cleanup1();
            if (cleanup2) cleanup2();
        };
    }, [isValidLink, submitted]);

    const clearCanvas = (refIndex) => {
        const canvas = refIndex === 1 ? canvasRef1.current : canvasRef2.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const isValidCNPJorCPF = (val) => {
        if (!val) return false;
        const clean = val.replace(/[^\d]+/g, '');
        if (clean.length <= 11) {
            if (clean === '' || clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;
            let add = 0;
            for (let i = 0; i < 9; i++) add += parseInt(clean.charAt(i)) * (10 - i);
            let rev = 11 - (add % 11);
            if (rev === 10 || rev === 11) rev = 0;
            if (rev !== parseInt(clean.charAt(9))) return false;
            add = 0;
            for (let i = 0; i < 10; i++) add += parseInt(clean.charAt(i)) * (11 - i);
            rev = 11 - (add % 11);
            if (rev === 10 || rev === 11) rev = 0;
            if (rev !== parseInt(clean.charAt(10))) return false;
            return true;
        } else {
            let cnpj = clean;
            if (cnpj === '' || cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
            let size = cnpj.length - 2;
            let numbers = cnpj.substring(0, size);
            let digits = cnpj.substring(size);
            let sum = 0;
            let pos = size - 7;
            for (let i = size; i >= 1; i--) {
                sum += numbers.charAt(size - i) * pos--;
                if (pos < 2) pos = 9;
            }
            let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
            if (result != digits.charAt(0)) return false;
            size = size + 1;
            numbers = cnpj.substring(0, size);
            sum = 0;
            pos = size - 7;
            for (let i = size; i >= 1; i--) {
                sum += numbers.charAt(size - i) * pos--;
                if (pos < 2) pos = 9;
            }
            result = sum % 11 < 2 ? 0 : 11 - sum % 11;
            if (result != digits.charAt(1)) return false;
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!termsAccepted) return alert("Você precisa confirmar que leu e aceita os termos do contrato de prestação de serviços.");

        if (!formData.gymName || formData.gymName.length < 5) return alert("Por favor, insira uma Razão Social válida (Mín. 5 caracteres).");
        if (!isValidCNPJorCPF(formData.cnpjCpf)) return alert("O CPF ou CNPJ da Academia (Sede) fornecido é inválido.");
        if (!formData.address || formData.address.length < 8) return alert("Insira um Endereço Completo válido para a Sede.");

        if (!formData.responsibleName1 || formData.responsibleName1.length < 5) return alert("Insira o Nome Completo real do Proprietário 1.");
        if (!formData.responsibleRg1 || formData.responsibleRg1.length < 5) return alert("Insira um RG válido para o Proprietário 1.");
        if (!isValidCNPJorCPF(formData.responsibleCpf1)) return alert("O CPF do Proprietário 1 é inválido. Coloque um CPF real.");
        if (!formData.responsibleEnd1 || formData.responsibleEnd1.length < 8) return alert("Insira um Endereço Pessoal completo para o Proprietário 1.");
        if (!formData.responsibleCep1 || formData.responsibleCep1.length < 8) return alert("Insira um CEP válido para o Proprietário 1.");

        if (formData.responsibleName2 || formData.responsibleCpf2 || formData.responsibleRg2) {
            if (!formData.responsibleName2 || formData.responsibleName2.length < 5) return alert("Insira o Nome Completo real do Proprietário 2.");
            if (!formData.responsibleRg2 || formData.responsibleRg2.length < 5) return alert("Insira um RG válido para o Proprietário 2.");
            if (!isValidCNPJorCPF(formData.responsibleCpf2)) return alert("O CPF do Proprietário 2 é inválido. Coloque um CPF real.");
            if (!formData.responsibleEnd2 || formData.responsibleEnd2.length < 8) return alert("Insira um Endereço Pessoal completo para o Proprietário 2.");
        }

        setSubmitting(true);

        try {
            const canvas1 = canvasRef1.current;
            const canvas2 = canvasRef2.current;
            
            const blob1 = await new Promise(resolve => canvas1.toBlob(resolve, 'image/png'));
            const blob2 = canvas2 ? await new Promise(resolve => canvas2.toBlob(resolve, 'image/png')) : null;

            const uploadSign = async (blob, index) => {
                if (!blob) return null;
                const fileName = `saas_sig_${index}_${Date.now()}.png`;
                const filePath = `registration-docs/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, blob);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
                return urlData.publicUrl;
            };

            const url1 = await uploadSign(blob1, 1);
            const url2 = await uploadSign(blob2, 2);
            setSigUrls({ url1, url2 });

            const { error: insertError } = await supabase.from('saas_agreements').insert([{
                link_id: contractLinkId,
                gym_name: formData.gymName,
                cnpj_cpf: formData.cnpjCpf,
                address: formData.address,
                responsible_name: formData.responsibleName1,
                responsible_cpf: formData.responsibleCpf1,
                rg_1: formData.responsibleRg1,
                address_1: formData.responsibleEnd1,
                cep_1: formData.responsibleCep1,
                responsible_name_2: formData.responsibleName2,
                responsible_cpf_2: formData.responsibleCpf2,
                rg_2: formData.responsibleRg2,
                address_2: formData.responsibleEnd2,
                cep_2: formData.responsibleCep2,
                payment_day: formData.paymentDay,
                signature_url: url1,
                signature_url_2: url2,
                ip_address: 'Formulário Digital B2B'
            }]);

            if (insertError) throw insertError;

            await supabase.from('saas_contract_links').update({
                status: 'assinado',
                used_at: new Date().toISOString()
            }).eq('id', contractLinkId);

            try {
                const mpResponse = await fetch('http://localhost:3000/create-saas-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gymName: formData.gymName, amountSetup: 1.00, amountMonthly: 1.00 })
                });
                const mpData = await mpResponse.json();
                if (mpData.init_point) setPaymentLink(mpData.init_point);
            } catch (mpErr) { console.error("Erro MP:", mpErr); }

            try {
                const names = formData.responsibleName2 ? `${formData.responsibleName1} e ${formData.responsibleName2}` : formData.responsibleName1;
                await fetch('http://localhost:3000/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '5511986423450',
                        message: `✅ *CONTRATO SaaS ASSINADO!* \nAcademia: *${formData.gymName}* \nResponsáveis: ${names}\nDia Vencimento: ${formData.paymentDay}\nValor Setup: R$ 3.250,00`
                    })
                });
            } catch (notifyErr) { console.error("Erro Notify:", notifyErr); }

            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            alert(`Erro: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const ContractText = () => (
        <div className="contract-content">
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.4rem' }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO E LICENCIAMENTO DE SOFTWARE</h2>
            
            <p><strong>CONTRATANTE:</strong> {formData.gymName || '[RAZÃO SOCIAL]'}, CNPJ/CPF nº {formData.cnpjCpf || '[PREENCHER]'}, com sede em {formData.address || '[ENDEREÇO DA SEDE]'}, neste ato representada por seus representantes legais:</p>
            
            <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                <li><strong>{formData.responsibleName1 || '[RESPONSÁVEL 1]'}</strong>, RG {formData.responsibleRg1 || '[RG]'}, CPF {formData.responsibleCpf1 || '[CPF]'}, residente em {formData.responsibleEnd1 || '[ENDEREÇO]'}, CEP {formData.responsibleCep1 || '[CEP]'};</li>
                {formData.responsibleName2 && (
                    <li><strong>{formData.responsibleName2 || '[SÓCIO 2]'}</strong>, RG {formData.responsibleRg2 || '[RG]'}, CPF {formData.responsibleCpf2 || '[CPF]'}, residente em {formData.responsibleEnd2 || '[ENDEREÇO]'}, CEP {formData.responsibleCep2 || '[CEP]'};</li>
                )}
            </ol>
            
            <p><strong>CONTRATADA:</strong> Vanderlei Dias Mendes, brasileiro, Desenvolvedor de Software, portador do CPF nº 072.501.549-74, com sede na Av. Osvaldo Valle Cordeiro 1260, AP 91 Torre 2, São Paulo/SP, doravante denominada <strong>CONTRATADA</strong>.</p>

            <p>As partes acima identificadas celebram o presente Contrato de Prestação de Serviços de Desenvolvimento, Licenciamento e Manutenção de Software (SaaS), que se regerá pelas seguintes cláusulas e condições:</p>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 1 - DO OBJETO</h3>
            <p>O presente contrato tem como objeto:</p>
            <ul style={{ paddingLeft: '20px' }}>
                <li>O desenvolvimento, parametrização e implementação do Sistema de Gestão Exclusivo para a academia Almeida JJ, englobando controle financeiro, gestão de alunos com CRUD completo, ficha de inscrição digital nativa, painel dashboard inteligente e servidor de disparos de WhatsApp integrado;</li>
                <li>O licenciamento de uso do software para a <strong>CONTRATANTE</strong>;</li>
                <li>A prestação contínua de serviços de hospedagem em nuvem, manutenção técnica e correções de retaguarda técnica (bugs).</li>
            </ul>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 2 - DOS VALORES E FORMA DE PAGAMENTO</h3>
            <p>Pela prestação dos serviços e licenciamento, a <strong>CONTRATANTE</strong> pagará à <strong>CONTRATADA</strong> os seguintes valores:</p>
            <p><strong>2.1. Taxa de Implementação (Setup):</strong> O valor fixo e único de R$ 3.250,00 (Três mil, duzentos e cinquenta reais), referente à programação, banco de dados, design da plataforma, design da ficha de matrícula exclusiva e infraestrutura de base. Forma de pagamento: 50% (cinquenta por cento) no aceite deste contrato e 50% (cinquenta por cento) na aprovação final do sistema, via transação PIX ou Cartão.</p>
            <p><strong>2.2. Taxa de Manutenção e Hospedagem (Mensalidade):</strong> O valor mensal de R$ 200,00 (Duzentos reais), referente ao licenciamento contínuo de uso do software, despesas técnicas com servidores de banco de dados, servidores de interface e suporte técnico preventivo. Vencimento: Todo <strong>dia {formData.paymentDay}</strong> de cada mês.</p>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 3 - DO PRAZO E DA RENOVAÇÃO</h3>
            <p><strong>3.1.</strong> O presente contrato é celebrado pelo prazo determinado de 12 (doze) meses, contados a partir da data da entrega oficial do sistema e seu pleno funcionamento em ambiente de produção.</p>
            <p><strong>3.2.</strong> Após os 12 (doze) meses iniciais, o contrato será prorrogado automaticamente por prazo indeterminado, podendo a mensalidade de R$ 200,00 sofrer reajuste anual pautado pelo índice IGPM ou IPCA acumulado no período.</p>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 4 - DO INADIMPLEMENTO E DAS PENALIDADES</h3>
            <p><strong>4.1. Multa por Atraso:</strong> Em caso de atraso superior a 5 (cinco) dias no pagamento da respectiva mensalidade:</p>
            <ul style={{ paddingLeft: '20px' }}>
                <li>Será cobrada multa moratória de 2% (dois por cento) sobre o valor nominal da parcela devida;</li>
                <li>Incidirão juros de mora de 1% (um por cento) ao mês, calculados de forma pro rata die.</li>
            </ul>
            <p><strong>4.2. Suspensão do Sistema:</strong> Caso a inadimplência perdure por tempo superior a 15 (quinze) dias corridos, a <strong>CONTRATADA</strong> reserva-se o direito de suspender o acesso da <strong>CONTRATANTE</strong> ao sistema eletrônico temporariamente, até a regularização integral dos débitos em aberto.</p>
            <p><strong>4.3. Multa Rescisória (Quebra de Fidelidade):</strong> Tendo em vista o investimento analítico e técnico inicial estruturado a longo prazo, caso a <strong>CONTRATANTE</strong> solicite formalmente o cancelamento e desativação do sistema antes de cumpridos os 12 (doze) meses estipulados na Cláusula 3, a <strong>CONTRATANTE</strong> incorrerá no pagamento de uma multa rescisória equivalente a 15% (quinze por cento) do valor total das mensalidades restantes para completar o período anual.</p>
            <p><strong>4.4. Rescisão sem Multa:</strong> Ultrapassado o período de 12 (doze) meses de vigência, a <strong>CONTRATANTE</strong> figurará livre para rescindir o presente instrumento a qualquer momento, isenta de multas rescisórias, bastando avisar com 30 (trinta) dias de antecedência.</p>
            <p><strong>4.5. Mau Uso e Quebra de Contrato:</strong> Em caso de infrações graves à Legislação Brasileira ou uso indevido do módulo de disparos de WhatsApp para o envio de mensagens caracterizadas como SPAM malicioso, a <strong>CONTRATADA</strong> poderá encerrar o contrato motivadamente, de maneira imediata, sem aviso prévio e isenta de devolução de quantias já pagas.</p>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 5 - DOS DIREITOS AUTORAIS E PROPRIEDADE INTELECTUAL</h3>
            <p><strong>5.1.</strong> Resta estritamente estabelecido que o código-fonte, a arquitetura relacional de banco de dados e as tecnologias agregadas (Design UX/UI, scripts automatizadores, etc.) desenvolvidas são de propriedade intelectual e patrimonial exclusiva da <strong>CONTRATADA</strong>.</p>
            <p><strong>5.2.</strong> A entrega delineada na Cláusula 1 engloba a cessão do Direito de Uso (Licenciamento Comercial de Software como Serviço) à <strong>CONTRATANTE</strong>. É expressamente vedado à <strong>CONTRATANTE</strong> copiar, revender, transferir a terceiros ou reivindicar registro autoral do software para si.</p>
            <p><strong>5.3.</strong> Em contradição, toda a massa de dados cadastrais (nomes, contatos, dados financeiros de alunos, assinaturas) colhida e alimentada dentro da plataforma é de inteira e exclusiva propriedade material da <strong>CONTRATANTE</strong>.</p>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 6 - SUPORTE TÉCNICO E BOAS PRÁTICAS</h3>
            <p><strong>6.1.</strong> A prestação contínua de Manutenção prevê garantia de engenharia contra falhas na execução funcional da ferramenta, bem como o custeio operacional do fornecimento dos servidores telemáticos vitais.</p>
            <p><strong>6.2. Acordo de Nível de Serviço (SLA):</strong> O amparo técnico fluirá de forma remota em dias úteis, no horário comercial (09h00 às 18h00 - Horário de Brasília). Manifestações que impactem a continuidade primária das operações (parada total do sistema) ostentarão tempo de primeira resposta não superior a 24 horas úteis.</p>
            <p><strong>6.3. Novos Módulos:</strong> Qualquer requisição técnica que abranja a idealização de características sistêmicas não previstas originariamente escapa ao orçamento aqui fixado, suscitando viabilidade e valoração em Orçamento Aditivo individual.</p>
            <p><strong>6.4. Isenção sobre Regulamentações de Terceiros (Meta/WhatsApp):</strong> A <strong>CONTRATADA</strong> concebe e fornece a ponte transacional entre o sistema e o dispositivo telefônico. No entanto, não exerce controle imperativo sobre regulamentos impostos pela empresa Meta. Por conseguinte, afasta-se de responsabilidade e ônus de ressarcimentos na eventualidade de o terminal celular da <strong>CONTRATANTE</strong> sofrer penalidades, interrupções ou banimentos causados por excesso volúmico de envios, denúncias de terceiros ou guinadas nas diretrizes globais daquela plataforma.</p>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 7 - PROTEÇÃO DE DADOS (LGPD)</h3>
            <p><strong>7.1.</strong> Conforme os ditames da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), a <strong>CONTRATANTE</strong> desponta categoricamente como Controladora dos dados pessoais de seus alunos, absorvendo para si o dever cível de colacionar o livre e manifesto consentimento obreiro e pautar a finalidade adequada da coleta antes de importá-los ou armazená-los na plataforma.</p>
            <p><strong>7.2.</strong> A <strong>CONTRATADA</strong> perfaz a figura de mera Operadora, abrigando matrizes instrumentais para viabilizar o processamento dos dados por intermédio da Controladora.</p>

            <h3 style={{ marginTop: '25px' }}>CLÁUSULA 8 - DISPOSIÇÕES GERAIS E FORO</h3>
            <p><strong>8.1.</strong> Por estarem assim alinhados aos justos e perfeitos termos de vontade, as partes firmam o presente contrato instrumental para que produza seus incontestes efeitos legais.</p>
            <p><strong>8.2.</strong> Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir pendências, divergências ou controvérsias decorrentes das estipulações deste contrato.</p>
            
            <p style={{ marginTop: '40px', textAlign: 'center' }}>São Paulo, {new Date().toLocaleDateString('pt-BR')}.</p>
        </div>
    );

    if (loading) return <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700' }}>Processando contrato integral...</div>;

    if (submitted) return (
        <div style={{ minHeight: '100vh', background: '#fff', color: '#000', padding: '40px 20px' }}>
            <style>{`@media print { .no-print { display: none !important; } .contract-content p, .contract-content li { font-size: 11pt; line-height: 1.5; } }`}</style>
            
            <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 40px', padding: '30px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '15px', textAlign: 'center' }}>
                <CheckCircle size={50} color="#16a34a" style={{ marginBottom: '15px', margin: '0 auto' }} />
                <h1 style={{ fontSize: '1.8rem', color: '#166534', marginBottom: '10px' }}>Contrato Assinado com Sucesso!</h1>
                <p style={{ color: '#14532d', marginBottom: '25px' }}>Todos os dados foram arquivados. Escolha uma opção abaixo:</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                    {paymentLink && (
                        <a href={paymentLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#009ee3', color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                            <CreditCard size={20} /> PAGAR SETUP (MERCADO PAGO) <ExternalLink size={16} />
                        </a>
                    )}
                    <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold' }}>
                        <Printer size={20} /> IMPRIMIR CONTRATO PDF
                    </button>
                    <button onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', color: '#475569', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>
                        <LayoutDashboard size={20} /> VOLTAR AO PAINEL
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'serif', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '1.4rem' }}>ALMEIDA JJ - SISTEMA DE GESTÃO</h1>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Formalização de Contrato Digital SaaS B2B</p>
                </div>

                <ContractText />

                <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <img src={sigUrls.url1} alt="Signature 1" style={{ maxHeight: '80px', marginBottom: '10px' }} />
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
                            <strong>{formData.responsibleName1}</strong><br />
                            <span style={{ fontSize: '0.8rem' }}>Contratante / Proprietário 1</span><br />
                            <span style={{ fontSize: '0.8rem' }}>CPF: {formData.responsibleCpf1} | RG: {formData.responsibleRg1}</span>
                        </div>
                    </div>
                    {formData.responsibleName2 && (
                        <div style={{ textAlign: 'center' }}>
                            <img src={sigUrls.url2} alt="Signature 2" style={{ maxHeight: '80px', marginBottom: '10px' }} />
                            <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
                                <strong>{formData.responsibleName2}</strong><br />
                                <span style={{ fontSize: '0.8rem' }}>Contratante / Proprietário 2</span><br />
                                <span style={{ fontSize: '0.8rem' }}>CPF: {formData.responsibleCpf2} | RG: {formData.responsibleRg2}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.7rem', color: '#999' }}>Documento assinado digitalmente em {new Date().toLocaleString('pt-BR')} via Autenticação IP: Formulário SaaS Almeida JJ.</p>
                </div>
            </div>
        </div>
    );

    const inputStyle = { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', marginBottom: '12px', fontSize: '0.9rem', outline: 'none' };
    const labelStyle = { fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px', display: 'block' };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', backgroundImage: `url(${jjBg})`, backgroundAttachment: 'fixed', padding: '40px 20px' }}>
            <div style={{ maxWidth: '950px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img src={logo} alt="Logo" style={{ width: '70px', borderRadius: '12px', marginBottom: '10px' }} />
                    <h1 style={{ fontWeight: '900', fontSize: '2.2rem', letterSpacing: '-1px' }}>CONTRATO DIGITAL <span style={{ color: '#ffd700' }}>SaaS</span></h1>
                    <p style={{ color: '#a1a1aa' }}>Academia Almeida JJ - Licenciamento e Gestão</p>
                </div>

                <div className="glass" style={{ padding: '30px', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <div style={{ 
                        background: 'rgba(0,0,0,0.4)', padding: '30px', borderRadius: '12px', 
                        height: '450px', overflowY: 'auto', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.95rem', color: '#e4e4e7', textAlign: 'justify', lineHeight: '1.6'
                    }}>
                        <ContractText />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#ffd700', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={20}/> Dados da Academia</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                <div><label style={labelStyle}>Razão / Fantasia (Academia)</label><input type="text" required value={formData.gymName} onChange={e=>setFormData({...formData, gymName: e.target.value})} style={inputStyle} /></div>
                                <div><label style={labelStyle}>CNPJ / CPF (Constituição)</label><input type="text" required value={formData.cnpjCpf} onChange={e=>setFormData({...formData, cnpjCpf: e.target.value})} style={inputStyle} /></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Endereço Completo da Sede</label>
                                    <input type="text" required value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                            {/* P1 */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1rem', borderBottom: '1px solid rgba(255,215,0,0.2)', paddingBottom: '5px' }}>Proprietário Titular (1)</h4>
                                <label style={labelStyle}>Nome Completo</label>
                                <input type="text" required value={formData.responsibleName1} onChange={e=>setFormData({...formData, responsibleName1: e.target.value})} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div><label style={labelStyle}>CPF</label><input type="text" required value={formData.responsibleCpf1} onChange={e=>setFormData({...formData, responsibleCpf1: e.target.value})} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>RG</label><input type="text" required value={formData.responsibleRg1} onChange={e=>setFormData({...formData, responsibleRg1: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <label style={labelStyle}>Endereço Pessoal</label>
                                <input type="text" required value={formData.responsibleEnd1} onChange={e=>setFormData({...formData, responsibleEnd1: e.target.value})} style={inputStyle} />
                                <label style={labelStyle}>CEP</label>
                                <input type="text" required value={formData.responsibleCep1} onChange={e=>setFormData({...formData, responsibleCep1: e.target.value})} style={inputStyle} />
                                
                                <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', fontWeight: 'bold' }}><span>ASSINATURA DIGITAL</span><button type="button" onClick={()=>clearCanvas(1)} style={{color:'#ef4444', border:'none', background:'none', cursor:'pointer'}}>LIMPAR</button></div>
                                    <canvas ref={canvasRef1} width={350} height={120} style={{ width: '100%', cursor: 'crosshair' }} />
                                </div>
                            </div>

                            {/* P2 */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
                                <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>Sócio Proprietário (2) - Opcional</h4>
                                <label style={labelStyle}>Nome Completo</label>
                                <input type="text" value={formData.responsibleName2} onChange={e=>setFormData({...formData, responsibleName2: e.target.value})} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div><label style={labelStyle}>CPF</label><input type="text" value={formData.responsibleCpf2} onChange={e=>setFormData({...formData, responsibleCpf2: e.target.value})} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>RG</label><input type="text" value={formData.responsibleRg2} onChange={e=>setFormData({...formData, responsibleRg2: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <label style={labelStyle}>Endereço Pessoal</label>
                                <input type="text" value={formData.responsibleEnd2} onChange={e=>setFormData({...formData, responsibleEnd2: e.target.value})} style={inputStyle} />
                                <label style={labelStyle}>CEP</label>
                                <input type="text" value={formData.responsibleCep2} onChange={e=>setFormData({...formData, responsibleCep2: e.target.value})} style={inputStyle} />
                                
                                <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', fontWeight: 'bold' }}><span>ASSINATURA DIGITAL</span><button type="button" onClick={()=>clearCanvas(2)} style={{color:'#ef4444', border:'none', background:'none', cursor:'pointer'}}>LIMPAR</button></div>
                                    <canvas ref={canvasRef2} width={350} height={120} style={{ width: '100%', cursor: 'crosshair' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,215,0,0.05)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '30px' }}>
                            <h3 style={{ color: '#ffd700', fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CreditCard size={20} /> Opção de Faturamento
                            </h3>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ ...labelStyle, fontSize: '0.9rem', color: '#fff' }}>Escolha o melhor dia para o vencimento mensal:</label>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                    {['05', '20'].map(day => (
                                        <button key={day} type="button" onClick={() => setFormData({...formData, paymentDay: day})}
                                            style={{ 
                                                flex: 1, padding: '15px', borderRadius: '10px', cursor: 'pointer',
                                                border: formData.paymentDay === day ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                                                background: formData.paymentDay === day ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.2)',
                                                color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                            }}
                                        >
                                            <Calendar size={18} /> Todo dia {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                • Pagamento Setup: <strong>R$ 3.250,00</strong> (Módulo Mercado Pago será liberado após o envio)<br />
                                • Mensalidade: <strong>R$ 200,00</strong> (Cobrada no dia {formData.paymentDay} de cada mês)
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,215,0,0.1)', borderRadius: '10px', border: '1px solid rgba(255,215,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => setTermsAccepted(!termsAccepted)}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: termsAccepted ? 'none' : '2px solid rgba(255,255,255,0.4)', background: termsAccepted ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {termsAccepted && <CheckCircle size={18} color="#fff" />}
                            </div>
                            <span style={{ color: '#e4e4e7', fontSize: '0.95rem' }}>
                                Declaro que li integralmente e concordo com todas as cláusulas e termos do Contrato de Prestação de Serviços (Cláusulas 1 a 8) dispostos acima.
                            </span>
                        </div>

                        <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', padding: '22px', background: '#ffd700', color: '#000', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {submitting ? 'PROCESSANDO DOCUMENTOS...' : <><Send size={20} style={{marginRight:'10px'}} /> Finalizar e Assinar Contrato</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SaaSContractForm;
