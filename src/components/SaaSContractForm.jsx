import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import jjBg from '../assets/jj-bg.png';
import logo from '../assets/logo.jpg';
import { CheckCircle, ShieldCheck, PenTool, Send, Info } from 'lucide-react';

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
        responsibleName: '',
        responsibleCpf: '',
        address: ''
    });

    const canvasRef = useRef(null);
    let isDrawing = false;

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

    // Canvas drawing logic
    useEffect(() => {
        if (!isValidLink || submitted) return;
        const canvas = canvasRef.current;
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

        const start = (e) => { isDrawing = true; const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); if(e.cancelable) e.preventDefault(); };
        const move = (e) => { if (!isDrawing) return; const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); if(e.cancelable) e.preventDefault(); };
        const end = () => { isDrawing = false; };

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
    }, [isValidLink, submitted]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Get Signature Blob
            const canvas = canvasRef.current;
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const fileName = `saas_signature_${Date.now()}.png`;
            const filePath = `registration-docs/${fileName}`;

            // 2. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, blob);
            
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);

            // 3. Insert Agreement
            const { error: insertError } = await supabase.from('saas_agreements').insert([{
                link_id: contractLinkId,
                gym_name: formData.gymName,
                cnpj_cpf: formData.cnpjCpf,
                responsible_name: formData.responsibleName,
                responsible_cpf: formData.responsibleCpf,
                address: formData.address,
                signature_url: urlData.publicUrl,
                ip_address: 'Formulário Digital'
            }]);

            if (insertError) throw insertError;

            // 4. Update Link Status
            await supabase.from('saas_contract_links').update({
                status: 'assinado',
                used_at: new Date().toISOString()
            }).eq('id', contractLinkId);

            // 5. Notify Vanderlei (WhatsApp) - Via Bridge local
            try {
                await fetch('http://localhost:3000/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '5511986423450', // Número do Vanderlei
                        message: `✅ *CONTRATO ASSINADO!* \nA academia *${formData.gymName}* acabou de assinar o contrato de SaaS. \n\nResponsável: ${formData.responsibleName}`
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

    if (loading) return <div className="loading">Validando convite...</div>;

    if (!isValidLink && !submitted) return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <div className="glass" style={{ padding: '40px', maxWidth: '500px' }}>
                <h1 style={{ color: '#ef4444' }}>Link de Contrato Inválido</h1>
                <p>Este link expirou ou já foi utilizado para assinatura.</p>
                <button onClick={() => window.location.href = '/'} className="btn-secondary" style={{ marginTop: '20px' }}>Voltar ao Início</button>
            </div>
        </div>
    );

    if (submitted) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${jjBg})`, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass" style={{ padding: '50px', maxWidth: '600px', textAlign: 'center' }}>
                <CheckCircle size={80} color="#ffd700" style={{ marginBottom: '20px' }} />
                <h1 style={{ marginBottom: '15px' }}>Contrato Assinado com Sucesso!</h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '30px' }}>
                    Parabéns! O contrato de prestação de serviços de software para a <strong>{formData.gymName}</strong> foi formalizado com sucesso. Nosso desenvolvedor será notificado imediatamente para prosseguir com a ativação total das funcionalidades.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button onClick={() => window.print()} className="btn-secondary">Imprimir Cópia</button>
                  <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ background: '#ffd700', color: '#000' }}>Ir para o Sistema</button>
                </div>
            </div>
        </div>
    );

    const inputStyle = {
        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', color: 'white', marginBottom: '15px', fontSize: '0.95rem'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', backgroundImage: `url(${jjBg})`, backgroundSize: '800px', backgroundAttachment: 'fixed', padding: '40px 20px' }}>
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img src={logo} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '15px', marginBottom: '15px' }} />
                    <h1 style={{ fontWeight: '800', letterSpacing: '-1px' }}>CONTRATO DIGITAL <span style={{ color: '#ffd700' }}>SaaS</span></h1>
                    <p style={{ color: '#a1a1aa' }}>Prestação de Serviços de Desenvolvimento e Licenciamento</p>
                </div>

                <div className="glass" style={{ padding: '40px', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#ffd700' }}>
                        <ShieldCheck size={24} />
                        <span style={{ fontWeight: '600' }}>Documento Formal Digitalizado</span>
                    </div>

                    {/* Contract Content */}
                    <div className="contract-box" style={{ 
                        background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '12px', 
                        height: '400px', overflowY: 'auto', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.9rem', lineHeight: '1.6', color: '#e4e4e7', whiteSpace: 'pre-wrap'
                    }}>
                        <h2 style={{ textAlign: 'center', color: '#fff', marginBottom: '20px' }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO E LICENCIAMENTO DE SOFTWARE</h2>
                        
                        <p><strong>CONTRATANTE:</strong> {formData.gymName || '[NOME DA ACADEMIA]'}, CNPJ/CPF nº {formData.cnpjCpf || '[CNPJ/CPF]'}, com sede em {formData.address || '[ENDEREÇO]'}, neste ato representada por seu representante legal {formData.responsibleName || '[NOME DO RESPONSÁVEL]'}, portador(a) do CPF nº {formData.responsibleCpf || '[CPF]'}, doravante denominada <strong>CONTRATANTE</strong>.</p>
                        
                        <p><strong>CONTRATADA:</strong> Vanderlei Dias Mendes, brasileiro, Desenvolvedor de Software, portador do CPF nº 072.501.549-74, com sede na Av Osvaldo Valle Cordeiro 1260, AP 91 Torre 2, São Paulo/SP, doravante denominada <strong>CONTRATADA</strong>.</p>
                        
                        <p>As partes acima identificadas celebram o presente Contrato de Prestação de Serviços de Desenvolvimento, Licenciamento e Manutenção de Software (SaaS), que se regerá pelas seguintes cláusulas e condições:</p>
                        
                        <h3>CLÁUSULA 1 - DO OBJETO</h3>
                        <p>1. O desenvolvimento, parametrização e implementação do Sistema de Gestão Exclusivo para a academia Almeida JJ...</p>
                        <p>2. O licenciamento de uso do software para a CONTRATANTE.</p>
                        <p>3. A prestação contínua de serviços de hospedagem, manutenção técnica e correções de bugs (SaaS).</p>

                        <h3>CLÁUSULA 2 - DOS VALORES E FORMA DE PAGAMENTO</h3>
                        <p>2.1. Taxa de Implementação (Setup): R$ 3.250,00 (Três mil, duzentos e cinquenta reais).</p>
                        <p>2.2. Taxa de Manutenção e Hospedagem (Mensalidade): R$ 200,00 (Duzentos reais).</p>

                        <h3>CLÁUSULA 3 - DO PRAZO E DA RENOVAÇÃO</h3>
                        <p>3.1. O presente contrato é celebrado pelo prazo de 12 (doze) meses, renováveis automaticamente.</p>
                        
                        <p><em>[O documento completo será arquivado após a assinatura digital]</em></p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#ffd700' }}>Dados para o Contrato</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Razão Social / Nome Fantasia</label>
                                <input type="text" required value={formData.gymName} onChange={e => setFormData({...formData, gymName: e.target.value})} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>CNPJ ou CPF (Contratante)</label>
                                <input type="text" required value={formData.cnpjCpf} onChange={e => setFormData({...formData, cnpjCpf: e.target.value})} style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Endereço Completo da Sede</label>
                            <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={inputStyle} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Nome do Responsável Legal</label>
                                <input type="text" required value={formData.responsibleName} onChange={e => setFormData({...formData, responsibleName: e.target.value})} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>CPF do Responsável</label>
                                <input type="text" required value={formData.responsibleCpf} onChange={e => setFormData({...formData, responsibleCpf: e.target.value})} style={inputStyle} />
                            </div>
                        </div>

                        {/* Signature Pad */}
                        <div style={{ marginTop: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#ffd700', fontWeight: '600' }}>Assinatura Digital (Contratante)</label>
                                <button type="button" onClick={clearCanvas} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>Limpar Assinatura</button>
                            </div>
                            <div style={{ background: '#fff', borderRadius: '12px', padding: '10px', height: '180px' }}>
                                <canvas ref={canvasRef} width={window.innerWidth > 800 ? 750 : window.innerWidth - 80} height={160} style={{ width: '100%', height: '100%', cursor: 'crosshair' }} />
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: '10px', textAlign: 'center' }}>
                                <Info size={12} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                Ao assinar e clicar em enviar, você concorda com todos os termos e cláusulas citados acima.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="btn-primary" 
                            style={{ width: '100%', marginTop: '30px', padding: '15px', background: '#ffd700', color: '#000', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {submitting ? 'PROCESSANDO...' : <><Send size={20} /> ASSINAR E ATIVAR SOFTWARE</>}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                    Desenvolvido por fdwords Elite Group © 2026
                </div>
            </div>
        </div>
    );
};

export default SaaSContractForm;
