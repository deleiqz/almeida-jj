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
        paymentDay: '05' // Default 05
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

    // Canvas drawing logic
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.responsibleName1 || !formData.responsibleCpf1) {
            alert("Por favor, preencha os dados do primeiro responsável.");
            return;
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

            // Insert Agreement
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

            // Mark link as signed
            await supabase.from('saas_contract_links').update({
                status: 'assinado',
                used_at: new Date().toISOString()
            }).eq('id', contractLinkId);

            // Generate Mercado Pago Link
            try {
                const mpResponse = await fetch('http://localhost:3000/create-saas-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gymName: formData.gymName,
                        amount: 3250.00
                    })
                });
                const mpData = await mpResponse.json();
                if (mpData.init_point) setPaymentLink(mpData.init_point);
            } catch (mpErr) {
                console.error("Erro ao gerar pagamento MP:", mpErr);
            }

            // WhatsApp Notify
            try {
                const names = formData.responsibleName2 
                    ? `${formData.responsibleName1} e ${formData.responsibleName2}` 
                    : formData.responsibleName1;

                await fetch('http://localhost:3000/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: '5511986423450',
                        message: `✅ *CONTRATO SaaS ASSINADO!* \nAcademia: *${formData.gymName}* \nResponsáveis: ${names}\nDia Vencimento: ${formData.paymentDay}\nValor Setup: R$ 3.250,00`
                    })
                });
            } catch (notifyErr) {
                console.error("Erro ao notificar WhatsApp:", notifyErr);
            }

            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            alert(`Erro ao assinar contrato: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const ContractText = () => (
        <>
            <h2 style={{ textAlign: 'center', color: submitted ? '#000' : '#fff', marginBottom: '30px', fontSize: '1.4rem' }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO E LICENCIAMENTO DE SOFTWARE</h2>
            
            <p><strong>CONTRATANTE:</strong> {formData.gymName || '[RAZÃO SOCIAL]'}, CNPJ/CPF nº {formData.cnpjCpf || '[PREENCHER]'}, com sede em {formData.address || '[ENDEREÇO DA SEDE]'}, neste ato representada por seus representantes legais:</p>
            
            <ol style={{ paddingLeft: '20px' }}>
                <li><strong>{formData.responsibleName1 || '[RESPONSÁVEL 1]'}</strong>, RG {formData.responsibleRg1 || '[RG]'}, CPF {formData.responsibleCpf1 || '[CPF]'}, residente em {formData.responsibleEnd1 || '[ENDEREÇO]'}, CEP {formData.responsibleCep1 || '[CEP]'};</li>
                {formData.responsibleName2 && (
                    <li><strong>{formData.responsibleName2 || '[SÓCIO 2]'}</strong>, RG {formData.responsibleRg2 || '[RG]'}, CPF {formData.responsibleCpf2 || '[CPF]'}, residente em {formData.responsibleEnd2 || '[ENDEREÇO]'}, CEP {formData.responsibleCep2 || '[CEP]'};</li>
                )}
            </ol>
            
            <p><strong>CONTRATADA:</strong> Vanderlei Dias Mendes, portador do CPF nº 072.501.549-74, Av. Osvaldo Valle Cordeiro 1260, São Paulo/SP.</p>

            <h3 style={{ color: submitted ? '#000' : '#fff', marginTop: '25px' }}>CLÁUSULA 2 - VALORES E PAGAMENTO</h3>
            <p><strong>2.1. Taxa de Implementação:</strong> R$ 3.250,00 (Três mil, duzentos e cinquenta reais).</p>
            <p><strong>2.2. Mensalidade:</strong> R$ 200,00 (Duzentos reais), com vencimento todo <strong>dia {formData.paymentDay}</strong> de cada mês.</p>
            
            <p style={{ marginTop: '40px', textAlign: 'center' }}>São Paulo, {new Date().toLocaleDateString('pt-BR')}.</p>
        </>
    );

    if (loading) return <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700' }}>Processando...</div>;

    if (submitted) return (
        <div style={{ minHeight: '100vh', background: '#fff', color: '#000', padding: '40px 20px' }}>
            <style>{`@media print { .no-print { display: none !important; } }`}</style>
            
            <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 40px', padding: '30px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                    <CheckCircle size={50} color="#16a34a" style={{ marginBottom: '15px' }} />
                    <h1 style={{ fontSize: '1.8rem', color: '#166534', marginBottom: '10px' }}>Pronto! Contrato Formalizado</h1>
                    <p style={{ color: '#14532d', marginBottom: '25px' }}>O contrato da {formData.gymName} foi assinado. Finalize com o pagamento do setup abaixo:</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        {paymentLink && (
                            <a href={paymentLink} target="_blank" rel="noreferrer" style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', background: '#009ee3', 
                                color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', 
                                textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,158,227,0.3)' 
                            }}>
                                <CreditCard size={20} /> PAGAR SETUP (MERCADO PAGO) <ExternalLink size={16} />
                            </a>
                        )}
                        <button onClick={() => window.print()} style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', 
                            color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold' 
                        }}>
                            <Printer size={20} /> IMPRIMIR CONTRATO
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'serif' }}>
                <ContractText />
                <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <img src={sigUrls.url1} alt="Signature 1" style={{ maxHeight: '80px', marginBottom: '10px' }} />
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
                            <strong>{formData.responsibleName1}</strong><br />
                            <span style={{ fontSize: '0.8rem' }}>CPF: {formData.responsibleCpf1}</span><br />
                            <span style={{ fontSize: '0.8rem' }}>RG: {formData.responsibleRg1}</span>
                        </div>
                    </div>
                    {formData.responsibleName2 && (
                        <div style={{ textAlign: 'center' }}>
                            <img src={sigUrls.url2} alt="Signature 2" style={{ maxHeight: '80px', marginBottom: '10px' }} />
                            <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
                                <strong>{formData.responsibleName2}</strong><br />
                                <span style={{ fontSize: '0.8rem' }}>CPF: {formData.responsibleCpf2}</span><br />
                                <span style={{ fontSize: '0.8rem' }}>RG: {formData.responsibleRg2}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const inputStyle = {
        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', color: 'white', marginBottom: '12px', fontSize: '0.9rem', outline: 'none'
    };

    const labelStyle = { fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px', display: 'block' };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', backgroundImage: `url(${jjBg})`, backgroundAttachment: 'fixed', padding: '40px 20px' }}>
            <div style={{ maxWidth: '950px', margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img src={logo} alt="Logo" style={{ width: '70px', borderRadius: '12px', marginBottom: '10px' }} />
                    <h1 style={{ fontWeight: '900', fontSize: '2rem' }}>CONTRATO DIGITAL <span style={{ color: '#ffd700' }}>SaaS</span></h1>
                </div>

                <div className="glass" style={{ padding: '30px', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <div style={{ 
                        background: 'rgba(0,0,0,0.4)', padding: '25px', borderRadius: '12px', 
                        height: '350px', overflowY: 'auto', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.9rem', color: '#e4e4e7', textAlign: 'justify'
                    }}>
                        <ContractText />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* ACADEMIA */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ color: '#ffd700', fontSize: '1.1rem', marginBottom: '15px' }}>Dados da Academia</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                <div><label style={labelStyle}>Razão / Fantasia</label><input type="text" required value={formData.gymName} onChange={e=>setFormData({...formData, gymName: e.target.value})} style={inputStyle} /></div>
                                <div><label style={labelStyle}>CNPJ / CPF</label><input type="text" required value={formData.cnpjCpf} onChange={e=>setFormData({...formData, cnpjCpf: e.target.value})} style={inputStyle} /></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Endereço Completo da Sede</label>
                                    <input type="text" required value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {/* PROPRIETÁRIOS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                            {/* P1 */}
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: '10px' }}>Proprietário 1</h4>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}><span>ASSINATURA</span><button type="button" onClick={()=>clearCanvas(1)} style={{color:'#f00', border:'none', background:'none'}}>LIMPAR</button></div>
                                    <canvas ref={canvasRef1} width={300} height={100} style={{ width: '100%', cursor: 'crosshair' }} />
                                </div>
                            </div>

                            {/* P2 */}
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: '10px' }}>Proprietário 2 (Opcional)</h4>
                                <input type="text" placeholder="Nome Completo" value={formData.responsibleName2} onChange={e=>setFormData({...formData, responsibleName2: e.target.value})} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div><input type="text" placeholder="CPF" value={formData.responsibleCpf2} onChange={e=>setFormData({...formData, responsibleCpf2: e.target.value})} style={inputStyle} /></div>
                                    <div><input type="text" placeholder="RG" value={formData.responsibleRg2} onChange={e=>setFormData({...formData, responsibleRg2: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <input type="text" placeholder="Endereço Pessoal" value={formData.responsibleEnd2} onChange={e=>setFormData({...formData, responsibleEnd2: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="CEP" value={formData.responsibleCep2} onChange={e=>setFormData({...formData, responsibleCep2: e.target.value})} style={inputStyle} />
                                
                                <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}><span>ASSINATURA</span><button type="button" onClick={()=>clearCanvas(2)} style={{color:'#f00', border:'none', background:'none'}}>LIMPAR</button></div>
                                    <canvas ref={canvasRef2} width={300} height={100} style={{ width: '100%', cursor: 'crosshair' }} />
                                </div>
                            </div>
                        </div>

                        {/* PAGAMENTO SECTION */}
                        <div style={{ background: 'rgba(255,215,0,0.05)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '30px' }}>
                            <h3 style={{ color: '#ffd700', fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CreditCard size={20} /> Configuração de Pagamento
                            </h3>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ ...labelStyle, fontSize: '0.9rem', color: '#fff' }}>Dia de Vencimento da Mensalidade:</label>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    {['05', '20'].map(day => (
                                        <button 
                                            key={day}
                                            type="button"
                                            onClick={() => setFormData({...formData, paymentDay: day})}
                                            style={{ 
                                                flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                                border: formData.paymentDay === day ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                                                background: formData.paymentDay === day ? 'rgba(255,215,0,0.2)' : 'rgba(0,0,0,0.2)',
                                                color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                            }}
                                        >
                                            <Calendar size={16} /> Dia {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
                                • Valor Setup: <strong>R$ 3.250,00</strong> (Pago após a assinatura)<br />
                                • Valor Mensalidade: <strong>R$ 200,00</strong> (Início após entrega)
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', padding: '20px', background: '#ffd700', color: '#000', fontWeight: 'bold' }}>
                            {submitting ? 'PROCESSANDO...' : 'ASSINAR E GERAR PAGAMENTO'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SaaSContractForm;
