import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import jjBg from '../assets/jj-bg.png';
import logo from '../assets/logo.jpg';
import { CheckCircle, ShieldCheck, Send, Info, Trash2 } from 'lucide-react';

const SaaSContractForm = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const contractLinkId = queryParams.get('contrato_saas');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isValidLink, setIsValidLink] = useState(false);
    const [recipientName, setRecipientName] = useState('');
    
    const [formData, setFormData] = useState({
        gymName: '',
        cnpjCpf: '',
        address: '',
        responsibleName1: '',
        responsibleCpf1: '',
        responsibleName2: '',
        responsibleCpf2: ''
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

    // Canvas drawing logic for both pads
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
            
            const end = () => { 
                if (refIndex === 1) isDrawing1 = false; else isDrawing2 = false; 
            };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.responsibleName1 || !formData.responsibleCpf1) {
            alert("Por favor, preencha os dados do primeiro responsável.");
            return;
        }

        setSubmitting(true);

        try {
            // 1. Get Signatures Blobs
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

            // 2. Insert Agreement
            const { error: insertError } = await supabase.from('saas_agreements').insert([{
                link_id: contractLinkId,
                gym_name: formData.gymName,
                cnpj_cpf: formData.cnpjCpf,
                address: formData.address,
                responsible_name: formData.responsibleName1,
                responsible_cpf: formData.responsibleCpf1,
                responsible_name_2: formData.responsibleName2,
                responsible_cpf_2: formData.responsibleCpf2,
                signature_url: url1,
                signature_url_2: url2,
                ip_address: 'Formulário Digital B2B'
            }]);

            if (insertError) throw insertError;

            // 3. Update Link Status
            await supabase.from('saas_contract_links').update({
                status: 'assinado',
                used_at: new Date().toISOString()
            }).eq('id', contractLinkId);

            // 4. Notify Vanderlei (WhatsApp)
            try {
                const names = formData.responsibleName2 
                    ? `${formData.responsibleName1} e ${formData.responsibleName2}` 
                    : formData.responsibleName1;

                await fetch('http://localhost:3000/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '5511986423450',
                        message: `✅ *CONTRATO SaaS ASSINADO!* \nA academia *${formData.gymName}* formalizou a parceria. \n\nResponsáveis: ${names}\nValor Setup: R$ 3.250,00\nMensalidade: R$ 200,00`
                    })
                });
            } catch (notifyErr) {
                console.error("Erro ao notificar WhatsApp:", notifyErr);
            }

            setSubmitted(true);
        } catch (err) {
            alert(`Erro ao assinar contrato: ${err.message}`);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700' }}>
            <div className="animate-pulse">Validando contrato oficial...</div>
        </div>
    );

    if (!isValidLink && !submitted) return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <div className="glass" style={{ padding: '40px', maxWidth: '500px' }}>
                <h1 style={{ color: '#ef4444' }}>Contrato Indisponível</h1>
                <p>Este link expirou, foi revogado ou já foi assinado pelos proprietários.</p>
                <button onClick={() => window.location.href = '/'} className="btn-secondary" style={{ marginTop: '20px' }}>Voltar ao Início</button>
            </div>
        </div>
    );

    if (submitted) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${jjBg})`, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass" style={{ padding: '50px', maxWidth: '600px', textAlign: 'center' }}>
                <CheckCircle size={80} color="#ffd700" style={{ marginBottom: '20px' }} />
                <h1 style={{ marginBottom: '15px' }}>Formalização Concluída!</h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '30px' }}>
                    O contrato da <strong>{formData.gymName}</strong> foi assinado digitalmente por ambos os proprietários e arquivado com sucesso. O sistema será ativado em breve.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button onClick={() => window.print()} className="btn-secondary">Gerar PDF/Imprimir</button>
                  <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ background: '#ffd700', color: '#000' }}>Acessar Dashboard</button>
                </div>
            </div>
        </div>
    );

    const inputStyle = {
        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', color: 'white', marginBottom: '15px', fontSize: '0.95rem', outline: 'none'
    };

    const labelStyle = { fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '5px', display: 'block' };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', backgroundImage: `url(${jjBg})`, backgroundSize: '800px', backgroundAttachment: 'fixed', padding: '40px 20px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img src={logo} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '15px', marginBottom: '15px' }} />
                    <h1 style={{ fontWeight: '800', letterSpacing: '-1px', fontSize: '2.2rem' }}>CONTRATO DIGITAL <span style={{ color: '#ffd700' }}>SaaS</span></h1>
                    <p style={{ color: '#a1a1aa' }}>Prestação de Serviços de Desenvolvimento e Licenciamento de Software</p>
                </div>

                <div className="glass" style={{ padding: '40px', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#ffd700' }}>
                        <ShieldCheck size={24} />
                        <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Válido como Documento Jurídico Digital</span>
                    </div>

                    {/* Contract Content - FULL TEXT */}
                    <div className="contract-box" style={{ 
                        background: 'rgba(0,0,0,0.3)', padding: '40px', borderRadius: '12px', 
                        height: '500px', overflowY: 'auto', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.95rem', lineHeight: '1.7', color: '#e4e4e7', textAlign: 'justify'
                    }}>
                        <h2 style={{ textAlign: 'center', color: '#fff', marginBottom: '30px', fontSize: '1.2rem' }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO E LICENCIAMENTO DE SOFTWARE</h2>
                        
                        <p><strong>CONTRATANTE:</strong> {formData.gymName || '[RAZÃO SOCIAL]'}, CNPJ/CPF nº {formData.cnpjCpf || '[PREENCHER]'}, com sede em {formData.address || '[ENDEREÇO COMPLETO]'}, neste ato representada por seus representantes legais <strong>{formData.responsibleName1 || '[RESPONSÁVEL 1]'}</strong> e <strong>{formData.responsibleName2 || '[RESPONSÁVEL 2]'}</strong>, doravante denominada <strong>CONTRATANTE</strong>.</p>
                        
                        <p><strong>CONTRATADA:</strong> Vanderlei Dias Mendes, brasileiro, Desenvolvedor de Software, portador do CPF nº 072.501.549-74, com sede na Av. Osvaldo Valle Cordeiro 1260, AP 91 Torre 2, São Paulo/SP, doravante denominada <strong>CONTRATADA</strong>.</p>
                        
                        <p>As partes acima identificadas celebram o presente Contrato de Prestação de Serviços de Desenvolvimento, Licenciamento e Manutenção de Software (SaaS), que se regerá pelas seguintes cláusulas e condições:</p>
                        
                        <h3 style={{ color: '#fff', marginTop: '25px' }}>CLÁUSULA 1 - DO OBJETO</h3>
                        <p>O presente contrato tem como objeto:</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>O desenvolvimento, parametrização e implementação do Sistema de Gestão Exclusivo para a academia Almeida JJ, englobando controle financeiro, gestão de alunos com CRUD completo, ficha de inscrição digital nativa, painel dashboard inteligente e servidor de disparos de WhatsApp integrado;</li>
                            <li>O licenciamento de uso do software para a <strong>CONTRATANTE</strong>;</li>
                            <li>A prestação contínua de serviços de hospedagem em nuvem, manutenção técnica e correções de retaguarda técnica (bugs).</li>
                        </ul>

                        <h3 style={{ color: '#fff', marginTop: '25px' }}>CLÁUSULA 2 - DOS VALORES E FORMA DE PAGAMENTO</h3>
                        <p>Pela prestação dos serviços e licenciamento, a <strong>CONTRATANTE</strong> pagará à <strong>CONTRATADA</strong> os seguintes valores:</p>
                        <p><strong>2.1. Taxa de Implementação (Setup):</strong> O valor fixo e único de R$ 3.250,00 (Três mil, duzentos e cinquenta reais), referente à programação, banco de dados, design da plataforma, design da ficha de matrícula exclusiva e infraestrutura de base. Forma de pagamento: 50% no aceite deste contrato e 50% na aprovação final do sistema.</p>
                        <p><strong>2.2. Taxa de Manutenção e Hospedagem (Mensalidade):</strong> O valor mensal de R$ 200,00 (Duzentos reais), referente ao licenciamento contínuo de uso do software e suporte técnico preventivo.</p>

                        <h3 style={{ color: '#fff', marginTop: '25px' }}>CLÁUSULA 3 - DO PRAZO E DA RENOVAÇÃO</h3>
                        <p><strong>3.1.</strong> O presente contrato é celebrado pelo prazo determinado de 12 (doze) meses, contados a partir da data da entrega oficial do sistema.</p>
                        <p><strong>3.2.</strong> Após o período inicial, o contrato será prorrogado automaticamente por prazo indeterminado.</p>

                        <h3 style={{ color: '#fff', marginTop: '25px' }}>CLÁUSULA 4 - DO INADIMPLEMENTO E DAS PENALIDADES</h3>
                        <p><strong>4.1. Multa por Atraso:</strong> Atraso superior a 5 dias acarretará multa de 2% e juros de 1% ao mês.</p>
                        <p><strong>4.2. Suspensão:</strong> Caso a inadimplência perdure por mais de 15 dias, a CONTRATADA reserva-se o direito de suspender o acesso ao sistema.</p>
                        <p><strong>4.3. Multa Rescisória:</strong> Cancelamento antes de 12 meses implica em multa de 15% sobre as parcelas restantes.</p>

                        <h3 style={{ color: '#fff', marginTop: '25px' }}>CLÁUSULA 5 - DIREITOS AUTORAIS E LGPD</h3>
                        <p><strong>5.1.</strong> O código-fonte e tecnologias são de propriedade da CONTRATADA. Os dados dos alunos são de propriedade exclusiva da CONTRATANTE.</p>
                        <p><strong>5.2.</strong> Ambas as partes comprometem-se a zelar pela Lei Geral de Proteção de Dados (LGPD).</p>

                        <h3 style={{ color: '#fff', marginTop: '25px' }}>CLÁUSULA 6 - SUPORTE E BOAS PRÁTICAS</h3>
                        <p><strong>6.1.</strong> O suporte técnico será remoto em dias úteis, horário comercial.</p>
                        <p><strong>6.2.</strong> A CONTRATADA não se responsabiliza por banimentos de WhatsApp causados por mau uso da ferramenta de disparos.</p>

                        <h3 style={{ color: '#fff', marginTop: '25px' }}>CLÁUSULA 8 - DO FORO</h3>
                        <p><strong>8.1.</strong> Fica eleito o foro da Comarca de São Paulo/SP para dirimir controvérsias.</p>
                        
                        <p style={{ marginTop: '30px', textAlign: 'center' }}>São Paulo, {new Date().getDate()} de {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][new Date().getMonth()]} de 2026.</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '20px', color: '#ffd700', fontSize: '1.2rem' }}>Dados Básicos da Academia</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Razão Social / Nome Fantasia</label>
                                    <input type="text" required value={formData.gymName} onChange={e => setFormData({...formData, gymName: e.target.value})} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>CNPJ ou CPF (Contratante)</label>
                                    <input type="text" required value={formData.cnpjCpf} onChange={e => setFormData({...formData, cnpjCpf: e.target.value})} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Endereço Completo da Sede</label>
                                <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={inputStyle} />
                            </div>
                        </div>

                        {/* Two Owners Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                            {/* OWNER 1 */}
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#ffd700', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>1</div>
                                    Proprietário Titular
                                </h4>
                                <label style={labelStyle}>Nome Completo</label>
                                <input type="text" required value={formData.responsibleName1} onChange={e => setFormData({...formData, responsibleName1: e.target.value})} style={inputStyle} placeholder="Ex: João Silva" />
                                
                                <label style={labelStyle}>CPF do Responsável</label>
                                <input type="text" required value={formData.responsibleCpf1} onChange={e => setFormData({...formData, responsibleCpf1: e.target.value})} style={inputStyle} placeholder="000.000.000-00" />
                                
                                <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', background: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>
                                        <span>Assinatura Digital</span>
                                        <button type="button" onClick={() => clearCanvas(1)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}><Trash2 size={12}/> Limpar</button>
                                    </div>
                                    <canvas ref={canvasRef1} width={400} height={140} style={{ width: '100%', height: '140px', cursor: 'crosshair' }} />
                                </div>
                            </div>

                            {/* OWNER 2 */}
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#ffd700', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>2</div>
                                    Sócio Proprietário
                                </h4>
                                <label style={labelStyle}>Nome Completo</label>
                                <input type="text" value={formData.responsibleName2} onChange={e => setFormData({...formData, responsibleName2: e.target.value})} style={inputStyle} placeholder="Ex: Maria Santos" />
                                
                                <label style={labelStyle}>CPF do Responsável</label>
                                <input type="text" value={formData.responsibleCpf2} onChange={e => setFormData({...formData, responsibleCpf2: e.target.value})} style={inputStyle} placeholder="000.000.000-00" />
                                
                                <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', background: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>
                                        <span>Assinatura Digital</span>
                                        <button type="button" onClick={() => clearCanvas(2)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}><Trash2 size={12}/> Limpar</button>
                                    </div>
                                    <canvas ref={canvasRef2} width={400} height={140} style={{ width: '100%', height: '140px', cursor: 'crosshair' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,215,0,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '30px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#dcfce7', textAlign: 'center', fontWeight: '500' }}>
                                <Info size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#ffd700' }} />
                                Ao assinar e clicar em enviar, os contratantes confirmam a validade jurídica deste instrumento conforme a Medida Provisória nº 2.200-2/2001.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="btn-primary" 
                            style={{ 
                                width: '100%', padding: '20px', background: '#ffd700', color: '#000', 
                                fontWeight: '900', fontSize: '1.1rem', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', gap: '12px', transition: 'all 0.3s ease' 
                            }}
                        >
                            {submitting ? 'PROCESSANDO ASSINATURAS...' : <><Send size={22} /> FINALIZAR CONTRATO E ATIVAR SISTEMA</>}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                    Desenvolvido por <strong>fdwords Elite Group</strong> • Tecnologia Segura e Criptografada © 2026
                </div>
            </div>
        </div>
    );
};

export default SaaSContractForm;
