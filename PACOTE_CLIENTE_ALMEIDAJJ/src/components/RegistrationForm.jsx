import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.jpg';
import jjBg from '../assets/jj-bg.png';
import { responsibilityTerm } from '../lib/contractTemplates';

// Validador oficial de CPF
const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
  return true;
};

// Dark theme input style matching the main app
const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid rgba(255, 215, 0, 0.15)',
  borderRadius: '10px',
  boxSizing: 'border-box',
  fontSize: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: '#fff',
  WebkitAppearance: 'none',
  appearance: 'none',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  fontFamily: "'Outfit', sans-serif"
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '500',
  color: '#a1a1aa',
  fontSize: '0.9rem'
};

const sectionTitleStyle = {
  textAlign: 'center',
  color: '#ffd700',
  marginTop: '30px',
  marginBottom: '15px',
  fontSize: '1.1rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const PRICES = {
  individual: {
    evolucao: { mensal: 189, trimestral: 537, semestral: 1014, anual: 1919 },
    performance: { mensal: 229, trimestral: 651, semestral: 1230, anual: 2316 }
  },
  familia: {
    evolucao: {
      2: { mensal: 340, trimestral: 966, semestral: 1825, anual: 3454 },
      3: { mensal: 481, trimestral: 1369, semestral: 2585, anual: 4893 },
      4: { mensal: 604, trimestral: 1718, semestral: 3244, anual: 6140 },
      5: { mensal: 708, trimestral: 2013, semestral: 3802, anual: 7196 },
      6: { mensal: 793, trimestral: 2255, semestral: 4258, anual: 8059 },
      7: { mensal: 860, trimestral: 2443, semestral: 4613, anual: 8731 },
      8: { mensal: 907, trimestral: 2577, semestral: 4867, anual: 9211 },
      9: { mensal: 935, trimestral: 2658, semestral: 5019, anual: 9499 },
      10: { mensal: 945, trimestral: 2685, semestral: 5070, anual: 9595 }
    },
    performance: {
      2: { mensal: 412, trimestral: 1171, semestral: 2214, anual: 4168 },
      3: { mensal: 583, trimestral: 1660, semestral: 3136, anual: 5905 },
      4: { mensal: 732, trimestral: 2083, semestral: 3936, anual: 7411 },
      5: { mensal: 858, trimestral: 2441, semestral: 4612, anual: 8685 },
      6: { mensal: 961, trimestral: 2734, semestral: 5166, anual: 9727 },
      7: { mensal: 1041, trimestral: 2962, semestral: 5596, anual: 10537 },
      8: { mensal: 1099, trimestral: 3124, semestral: 5904, anual: 11116 },
      9: { mensal: 1133, trimestral: 3222, semestral: 6088, anual: 11464 },
      10: { mensal: 1145, trimestral: 3255, semestral: 6150, anual: 11580 }
    }
  }
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    hasRestriction: 'nao',
    restrictionDesc: '',
    parentName: '',
    parentCpf: '',
    kinship: '',
    agreedToTerms: false,
    planType: 'individual', // 'individual' or 'familia'
    plan: 'mensal',
    subPlan: 'evolucao',
    paymentMethod: 'pix',
    imageAuth: true,
    marketingAuth: true,
    familyCount: 2,
    dependents: []
  });
  
  const [isMinor, setIsMinor] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newStudentId, setNewStudentId] = useState(null);
  const [paymentLinks, setPaymentLinks] = useState({});
  const [generatedPaymentUrl, setGeneratedPaymentUrl] = useState('');

  const getPaymentUrl = (method) => {
    let url = paymentLinks?.[method];
    if (!url && (method === 'credito' || method === 'debito')) {
      return 'https://link.mercadopago.com.br/almeidajjcamps';
    }
    if (url && !url.startsWith('http')) {
      return `https://${url}`;
    }
    return url || '';
  };

  const getCurrentPrice = (planType = formData.planType, subPlan = formData.subPlan, plan = formData.plan, familyCount = formData.familyCount || 2) => {
    if (planType === 'familia') {
      return PRICES.familia[subPlan][familyCount]?.[plan] || PRICES.familia[subPlan][2][plan];
    }
    return PRICES.individual[subPlan][plan];
  };
  
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const isDrawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [refId, setRefId] = useState(null);

  // Force dark theme on body and read URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('ref');

    // Fallback: check hash for UUID or 'ref=' format
    if (!ref && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash.includes('ref=')) {
        ref = new URLSearchParams(hash.split('?')[1] || hash).get('ref');
      } else {
        // Assume direct UUID in hash like /?registro#UUID
        ref = hash.split(/[?&]/)[0];
      }
    }

    // Validate UUID format before setting
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (ref && uuidRegex.test(ref)) {
      console.log("Capturou ID de rastreio:", ref);
      setRefId(ref);
    }

    // Fetch payment settings
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').eq('key', 'payment_links').single();
      if (data) setPaymentLinks(data.value);
    };
    fetchSettings();

    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    const originalOverflow = document.body.style.overflowX;
    document.body.style.backgroundColor = '#000';
    document.body.style.color = '#fff';
    document.body.style.overflowX = 'auto';
    
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
      document.body.style.overflowX = originalOverflow;
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  // Calculate age when birthDate changes
  useEffect(() => {
    if (formData.birthDate) {
      const dob = new Date(formData.birthDate + 'T00:00:00');
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        setIsMinor(age < 18);
      }
    }
  }, [formData.birthDate]);

  // Initialize high-DPI canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.clientWidth;
    const displayHeight = 180;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffd700';
    ctx.imageSmoothingEnabled = true;
  };

  useEffect(() => {
    if (!submitted) {
      const timer = setTimeout(setupCanvas, 100);
      window.addEventListener('resize', setupCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', setupCanvas);
      };
    }
  }, [submitted]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    pointsRef.current = [pos];
    isDrawingRef.current = true;
    setIsDrawing(true);

    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const pos = getPos(e);
    const pts = pointsRef.current;
    pts.push(pos);

    const ctx = canvasRef.current.getContext('2d');

    if (pts.length >= 3) {
      const p0 = pts[pts.length - 3];
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      ctx.beginPath();
      ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      ctx.stroke();
    } else if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    pointsRef.current = [];
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      alert("Você precisa ler e aceitar o Termo de Responsabilidade.");
      return;
    }

    if (!validateCPF(formData.cpf)) {
      alert("O CPF do aluno é inválido. Por favor, digite um CPF real.");
      return;
    }
    
    if (isMinor && !validateCPF(formData.parentCpf)) {
      alert("O CPF do responsável é inválido. Por favor, digite um CPF real.");
      return;
    }

    setLoading(true);
    let documentUrl = '';
    
    const canvas = canvasRef.current;
    if (canvas) {
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      
      if (canvas.toDataURL() !== blank.toDataURL()) {
        try {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          const fileName = `signature_${Date.now()}.png`;
          const filePath = `registration-docs/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, blob);
          
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
            documentUrl = urlData.publicUrl;
          }
        } catch (err) {
          console.error("Erro ao subir assinatura:", err);
        }
      }
    }

    const paymentValue = getCurrentPrice().toString();
    let medicalInfo = formData.hasRestriction === 'sim' ? `Restrição Médica: ${formData.restrictionDesc}` : '';
    if (formData.planType === 'familia' && formData.dependents?.length > 0) {
      const depString = formData.dependents.map((d, i) => `Dependente ${i + 2}: ${d.name} (${d.birthDate})`).join(' | ');
      medicalInfo = medicalInfo ? `${medicalInfo} || ${depString}` : depString;
    }

    let dynamicPaymentLink = '';
    // OPÇÃO 2 ATIVADA (Chave de produção da Almeida JJ configurada):
    // Gera preferência dinâmica com o valor correto do plano selecionado.
    if (formData.paymentMethod === 'credito' || formData.paymentMethod === 'debito') {
      try {
        let totalAmount = getCurrentPrice();
        if (formData.planType !== 'familia' && formData.plan !== 'anual') {
          totalAmount += 150; // Matrícula is only charged for individual non-anual plans
        }
        const planLabel = `${formData.planType === 'familia' ? `Família (${formData.familyCount || 2} Pessoas)` : 'Individual'} - ${formData.subPlan.charAt(0).toUpperCase() + formData.subPlan.slice(1)} (${formData.plan.toUpperCase()})`;
        
        const mpResponse = await fetch('/api/mercado-pago-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            studentName: formData.name, 
            planName: planLabel, 
            amount: totalAmount,
            externalReference: formData.cpf
          })
        });
        const mpData = await mpResponse.json();
        if (mpData.init_point) {
          dynamicPaymentLink = mpData.init_point;
        }
      } catch (err) {
        console.error("Erro ao gerar link dinâmico do Mercado Pago:", err);
      }
    }

    const finalPaymentLink = dynamicPaymentLink || getPaymentUrl(formData.paymentMethod);

    const { data: insertedData, error } = await supabase
      .from('students')
      .insert([{ 
        name: formData.name, 
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        belt: 'Branca',
        plan: formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1),
        sub_plan: `${formData.planType === 'familia' ? `Família (${formData.familyCount || 2} Pessoas) - ` : ''}${formData.subPlan.charAt(0).toUpperCase() + formData.subPlan.slice(1)}`,
        payment_value: paymentValue,
        payment_method: formData.paymentMethod === 'credito' ? 'Cartão de Crédito' : formData.paymentMethod === 'debito' ? 'Cartão de Débito' : formData.paymentMethod.charAt(0).toUpperCase() + formData.paymentMethod.slice(1),
        payment_link: finalPaymentLink,
        birth_date: formData.birthDate,
        cpf: formData.cpf,
        parent_name: isMinor ? formData.parentName : '',
        parent_cpf: isMinor ? formData.parentCpf : '',
        medical_info: medicalInfo,
        has_authorization: formData.imageAuth,
        marketing_auth: formData.marketingAuth,
        document_url: documentUrl,
        status: 'pendente',
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      alert(`Erro ao enviar cadastro: ${error.message}`);
      console.error(error);
    } else {
      // Mark link as finalized if it came from a reference
      if (refId) {
        try {
          const updateData = { 
            status: 'finalizado', 
            completed_at: new Date().toISOString(),
            recipient_phone: formData.phone
          };
          
          // Only add student_id if we successfully retrieved it (might be null due to RLS)
          if (insertedData?.id) {
            updateData.student_id = insertedData.id;
          }
          
          const { error: updateError } = await supabase
            .from('registration_links')
            .update(updateData)
            .eq('id', refId);
            
          if (updateError) console.error("Erro ao atualizar status do link:", updateError);
        } catch (err) {
          console.error("Falha no rastreio:", err);
        }
      }
      setNewStudentId(insertedData.id);
      setGeneratedPaymentUrl(finalPaymentLink);
      setSubmitted(true);
    }
    setLoading(false);
  };

  // ── PAGE WRAPPER STYLE ──
  const pageStyle = {
    minHeight: '100vh',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url(${jjBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '30px 15px',
    fontFamily: "'Outfit', sans-serif",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  };

  // ── GLASS CARD STYLE ──
  const cardStyle = {
    maxWidth: '560px',
    width: '100%',
    background: 'rgba(18, 18, 18, 0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 215, 0, 0.12)',
    borderRadius: '20px',
    padding: '35px 30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
  };

  if (submitted) {
    const contractUrl = `${window.location.origin}/?contrato=${newStudentId}`;
    const planValue = getCurrentPrice();
    const pixKey = paymentLinks.pix || 'almeidajjcamps@gmail.com';
    
    const whatsappMsg = encodeURIComponent(
      `Olá! Meu cadastro na Almeida JJ foi concluído. 🥋\n\n` +
      `*Resumo da Matrícula:*\n` +
      `• Aluno: ${formData.name}\n` +
      `• Plano: ${formData.plan.toUpperCase()}\n` +
      `• Valor: R$ ${planValue},00\n` +
      `• Chave Pix: ${pixKey}\n\n` +
      `*Contrato Digital:* ${contractUrl}\n\n` +
      `Favor enviar o comprovante após o pagamento. 🥊`
    );
    const whatsappLink = `https://wa.me/${formData.phone.replace(/\D/g, '')}?text=${whatsappMsg}`;
    
    const selectedMethod = formData.paymentMethod;
    const paymentUrl = generatedPaymentUrl || getPaymentUrl(selectedMethod);

    return (
      <div style={{ ...pageStyle, alignItems: 'center' }}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <span style={{ fontSize: '1.5rem' }}>🥋</span>
          </div>
          <h2 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1.4rem' }}>Cadastro Recebido!</h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '25px' }}>
            Para confirmar sua matrícula e garantir os bônus, realize o pagamento agora via <strong>{selectedMethod.toUpperCase()}</strong>:
          </p>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.1)', marginBottom: '25px' }}>
            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '8px' }}>Valor a Pagar</div>
            <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: '800' }}>R$ {planValue},00</div>
            {formData.planType !== 'familia' && formData.plan !== 'anual' && <div style={{ fontSize: '0.75rem', color: '#ffd700', marginTop: '4px' }}>+ R$ 150,00 (Matrícula)</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedMethod === 'pix' ? (
              <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
                <p style={{ color: '#000', fontSize: '0.8rem', margin: '0 0 10px', fontWeight: 'bold' }}>Chave Pix / Copia e Cola:</p>
                <div style={{ 
                  background: '#f4f4f4', padding: '10px', borderRadius: '8px', color: '#333', fontSize: '0.7rem', 
                  wordBreak: 'break-all', marginBottom: '10px', border: '1px solid #ddd'
                }}>
                  {paymentUrl || 'almeidajjcamps@gmail.com'}
                </div>
                {paymentUrl && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(paymentUrl || 'almeidajjcamps@gmail.com');
                      alert('Chave Pix copiada!');
                    }}
                    style={{ background: '#000', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', width: '100%', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Copiar Código Pix
                  </button>
                )}
                {!paymentUrl && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('almeidajjcamps@gmail.com');
                      alert('Chave Pix copiada!');
                    }}
                    style={{ background: '#000', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', width: '100%', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Copiar Chave Pix
                  </button>
                )}
              </div>
            ) : (
              paymentUrl && (
                <a href={paymentUrl} target="_blank" rel="noreferrer" style={{
                  background: '#ffd700', color: '#000', padding: '16px', border: 'none', borderRadius: '12px', textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem'
                }}>
                  💳 PAGAR AGORA COM CARTÃO
                </a>
              )
            )}

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
            
            <a href={contractUrl} target="_blank" rel="noreferrer" style={{
              background: 'rgba(255, 215, 0, 0.05)', color: '#ffd700', padding: '12px', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem'
            }}>
              📄 Ver Meu Contrato
            </a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" style={{
              background: '#25d366', color: '#fff', padding: '12px', border: 'none', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem'
            }}>
              💬 Confirmar pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src={logo} alt="Almeida JJ" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '16px', border: '2px solid #ffd700', boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)' }} />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '1.6rem', marginTop: '12px', marginBottom: '4px', fontWeight: 800, textTransform: 'uppercase', color: '#fff' }}>
          Almeida<span style={{ color: '#ffd700' }}>JJ</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '25px' }}>Ficha de Matrícula • Brazilian Jiu Jitsu</p>
        
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)', marginBottom: '25px' }}></div>

        <form onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <h3 style={sectionTitleStyle}>Dados Pessoais</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Nome Completo</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} placeholder="Ex: João da Silva" />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Data de Nascimento</label>
            <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} style={{...inputStyle, colorScheme: 'dark'}} />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>CPF</label>
            <input type="text" required placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Telefone / WhatsApp</label>
            <input type="tel" required placeholder="(11) 99999-9999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '0.8rem', marginTop: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.marketingAuth} onChange={e => setFormData({...formData, marketingAuth: e.target.checked})} style={{ accentColor: '#ffd700' }} />
              Autorizo receber mensagens e promoções da academia.
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>E-mail</label>
            <input type="email" required placeholder="seu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Endereço Completo</label>
            <input type="text" required placeholder="Rua, Número, Bairro, Cidade" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={inputStyle} />
          </div>

          {/* Dados Médicos */}
          <h3 style={sectionTitleStyle}>Dados Médicos</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Possui alguma restrição médica?</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="restricao" value="sim" checked={formData.hasRestriction === 'sim'} onChange={e => setFormData({...formData, hasRestriction: e.target.value})} style={{ accentColor: '#ffd700' }} /> Sim
              </label>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="restricao" value="nao" checked={formData.hasRestriction === 'nao'} onChange={e => setFormData({...formData, hasRestriction: e.target.value})} style={{ accentColor: '#ffd700' }} /> Não
              </label>
            </div>
          </div>
          
          {formData.hasRestriction === 'sim' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Qual?</label>
              <input type="text" placeholder="Descreva brevemente" value={formData.restrictionDesc} onChange={e => setFormData({...formData, restrictionDesc: e.target.value})} style={inputStyle} />
            </div>
          )}

          {/* Autorização do Responsável */}
          {isMinor && (
            <div style={{ background: 'rgba(255, 215, 0, 0.05)', padding: '20px', borderLeft: '3px solid #ffd700', borderRadius: '10px', marginTop: '20px', marginBottom: '20px' }}>
              <h3 style={{ color: '#ffd700', marginTop: '0', textAlign: 'left', fontSize: '1rem', marginBottom: '10px' }}>⚠️ Autorização do Responsável</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '15px' }}>O aluno é <strong style={{ color: '#fbbf24' }}>menor de 18 anos</strong>. É obrigatório o preenchimento dos dados do responsável legal.</p>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Nome do Responsável Legal</label>
                <input type="text" required={isMinor} value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} style={inputStyle} />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>CPF do Responsável</label>
                <input type="text" required={isMinor} value={formData.parentCpf} onChange={e => setFormData({...formData, parentCpf: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '5px' }}>
                <label style={labelStyle}>Grau de Parentesco</label>
                <select required={isMinor} value={formData.kinship} onChange={e => setFormData({...formData, kinship: e.target.value})} style={{...inputStyle, colorScheme: 'dark'}}>
                  <option value="">Selecione...</option>
                  <option value="pai">Pai</option>
                  <option value="mae">Mãe</option>
                  <option value="avo">Avô/Avó</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
          )}

          {/* Escolha do Plano */}
          <h3 style={sectionTitleStyle}>Escolha do Plano</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, planType: 'individual'})}
              style={{
                padding: '16px', borderRadius: '12px', border: formData.planType === 'individual' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                background: formData.planType === 'individual' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                color: formData.planType === 'individual' ? '#ffd700' : '#a1a1aa',
                fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              👤 Individual
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, planType: 'familia'})}
              style={{
                padding: '16px', borderRadius: '12px', border: formData.planType === 'familia' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                background: formData.planType === 'familia' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                color: formData.planType === 'familia' ? '#ffd700' : '#a1a1aa',
                fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              👨‍👩‍👧‍👦 Família (2 pessoas)
            </button>
          </div>

          {formData.planType === 'familia' && (
            <div style={{ background: 'rgba(255, 215, 0, 0.05)', padding: '20px', border: '1px solid rgba(255, 215, 0, 0.15)', borderRadius: '15px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Quantidade de Pessoas no Plano Família</label>
                <select 
                  value={formData.familyCount || 2} 
                  onChange={e => {
                    const count = parseInt(e.target.value);
                    const newDeps = [...(formData.dependents || [])];
                    while (newDeps.length < count - 1) {
                      newDeps.push({ name: '', birthDate: '' });
                    }
                    setFormData({
                      ...formData, 
                      familyCount: count,
                      dependents: newDeps.slice(0, count - 1)
                    });
                  }} 
                  style={{
                    ...inputStyle,
                    background: '#1a1a1a',
                    color: '#fff',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffd700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                    colorScheme: 'dark'
                  }}
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n} style={{ background: '#1a1a1a', color: '#fff' }}>
                      {n} Pessoas ({n === 2 ? '10%' : n === 3 ? '15%' : n === 4 ? '20%' : n === 5 ? '25%' : n === 6 ? '30%' : n === 7 ? '35%' : n === 8 ? '40%' : n === 9 ? '45%' : '50%'} de desc.)
                    </option>
                  ))}
                </select>
              </div>

              {(formData.dependents || []).map((dep, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', border: '1px dashed rgba(255, 215, 0, 0.15)', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ color: '#ffd700', fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px' }}>🧑‍🧑‍🧒 Dependente {idx + 2}</div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={labelStyle}>Nome Completo</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Nome do dependente" 
                      value={dep.name} 
                      onChange={e => {
                        const newDeps = [...formData.dependents];
                        newDeps[idx].name = e.target.value;
                        setFormData({...formData, dependents: newDeps});
                      }} 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Data de Nascimento</label>
                    <input 
                      type="date" 
                      required 
                      value={dep.birthDate} 
                      onChange={e => {
                        const newDeps = [...formData.dependents];
                        newDeps[idx].birthDate = e.target.value;
                        setFormData({...formData, dependents: newDeps});
                      }} 
                      style={{...inputStyle, colorScheme: 'dark'}} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, subPlan: 'evolucao'})}
              style={{
                padding: '16px', borderRadius: '12px', border: formData.subPlan === 'evolucao' ? '3px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                background: formData.subPlan === 'evolucao' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                color: formData.subPlan === 'evolucao' ? '#ffd700' : '#a1a1aa',
                fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🏁</span>
              Evolução
              <span style={{ fontSize: '0.65rem', fontWeight: '400', opacity: 0.7 }}>Período: Manhã/Tarde ou Tarde/Noite</span>
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, subPlan: 'performance'})}
              style={{
                padding: '16px', borderRadius: '12px', border: formData.subPlan === 'performance' ? '3px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                background: formData.subPlan === 'performance' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                color: formData.subPlan === 'performance' ? '#ffd700' : '#a1a1aa',
                fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              Performance
              <span style={{ fontSize: '0.65rem', fontWeight: '400', opacity: 0.7 }}>Treino livre em todos os horários</span>
            </button>
          </div>

          {/* Duração do Plano */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            {(() => {
              const durations = [
                { id: 'mensal', label: 'Mensal', price: getCurrentPrice(formData.planType, formData.subPlan, 'mensal') },
                { id: 'trimestral', label: 'Trimestral', price: getCurrentPrice(formData.planType, formData.subPlan, 'trimestral') },
                { id: 'semestral', label: 'Semestral', price: getCurrentPrice(formData.planType, formData.subPlan, 'semestral') },
                { id: 'anual', label: 'Anual', price: getCurrentPrice(formData.planType, formData.subPlan, 'anual'), promo: true }
              ];

              return durations.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setFormData({...formData, plan: d.id})}
                  style={{
                    padding: '16px 12px', borderRadius: '12px', border: formData.plan === d.id ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                    background: formData.plan === d.id ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    color: formData.plan === d.id ? '#ffd700' : '#fff',
                    cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{d.label}</div>
                  <div style={{ fontSize: '1rem', color: '#ffd700', fontWeight: '800', marginTop: '4px' }}>R$ {d.price},00</div>
                  {d.promo && (
                    <div style={{ 
                      position: 'absolute', top: '0', right: '0', background: '#ffd700', color: '#000', 
                      fontSize: '0.6rem', fontWeight: '900', padding: '2px 8px', borderRadius: '0 0 0 8px'
                    }}>BRINDE KIMONO</div>
                  )}
                </button>
              ));
            })()}
          </div>

          {formData.plan === 'anual' && (
            <div style={{ background: 'rgba(255, 215, 0, 0.08)', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,215,0,0.2)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#ffd700', lineHeight: '1.4' }}>
                ⭐ <strong>Benefícios Anual:</strong> Isenção de matrícula + {formData.planType === 'familia' ? '02 Kimonos Profissionais + 2 Faixas' : '01 Kimono Profissional + Faixa + 01 Aula Particular (45 min)'} + Bioimpedância a cada 2 meses.
              </p>
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Matrícula</label>
            <div style={{ color: (formData.planType === 'familia' || formData.plan === 'anual') ? '#10b981' : '#fff', fontWeight: '700', fontSize: '1.1rem' }}>
              {(formData.planType === 'familia' || formData.plan === 'anual') ? 'ISENTA 🎁' : 'R$ 150,00'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Forma de Pagamento</label>
            <select 
              value={formData.paymentMethod} 
              onChange={e => setFormData({...formData, paymentMethod: e.target.value})} 
              style={{
                ...inputStyle,
                background: '#1a1a1a',
                color: '#fff',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffd700\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              <option value="pix" style={{ background: '#1a1a1a', color: '#fff' }}>Pix</option>
              <option value="debito" style={{ background: '#1a1a1a', color: '#fff' }}>Débito</option>
              <option value="credito" style={{ background: '#1a1a1a', color: '#fff' }}>Crédito</option>
              <option value="dinheiro" style={{ background: '#1a1a1a', color: '#fff' }}>Dinheiro</option>
              <option value="gympass" style={{ background: '#1a1a1a', color: '#fff' }}>Gympass</option>
              <option value="totalpass" style={{ background: '#1a1a1a', color: '#fff' }}>Totalpass</option>
            </select>
          </div>

          {(formData.paymentMethod === 'gympass' || formData.paymentMethod === 'totalpass') && (
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Token de Verificação ({formData.paymentMethod === 'gympass' ? 'Gympass' : 'Totalpass'})</label>
              <input 
                type="text" 
                placeholder="Ex: 12345678" 
                value={formData.restrictionDesc} // Reusing field for brevity in this manual register
                onChange={e => setFormData({...formData, restrictionDesc: e.target.value})} 
                style={inputStyle} 
              />
            </div>
          )}

          <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px' }}>
            <label style={{...labelStyle, color: '#ffd700'}}>DIREITO DE IMAGEM</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={formData.imageAuth === true} onChange={() => setFormData({...formData, imageAuth: true})} style={{ accentColor: '#ffd700' }} /> Autorizo
              </label>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={formData.imageAuth === false} onChange={() => setFormData({...formData, imageAuth: false})} style={{ accentColor: '#ffd700' }} /> Não autorizo
              </label>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: '10px' }}>
              Autorizo o uso de minha imagem em fotos e vídeos para fins de divulgação da academia.
            </p>
          </div>
          {/* Termo de Responsabilidade */}
          <div style={{ marginBottom: '30px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.1)' }}>
            <h3 style={{ ...sectionTitleStyle, color: '#ffd700', marginTop: '0', fontSize: '1rem', marginBottom: '15px' }}>📜 Termo de Responsabilidade</h3>
            <div style={{ 
              maxHeight: '150px', overflowY: 'auto', paddingRight: '10px', fontSize: '0.8rem', color: '#a1a1aa', lineHeight: '1.5',
              textAlign: 'justify', marginBottom: '15px'
            }}>
              {(() => {
                const now = new Date();
                const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                const isMinorVal = isMinor; // assuming isMinor is available from state/effect
                
                let text = responsibilityTerm;
                const replacements = {
                  name: formData.name || '________________',
                  birthDate: formData.birthDate ? new Date(formData.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : '________________',
                  phone: formData.phone || '________________',
                  email: formData.email || '________________',
                  address: formData.address || '________________',
                  parent_name_or_self: isMinorVal ? (formData.parentName || '________________') : (formData.name || '________________'),
                  parent_cpf_or_self: isMinorVal ? (formData.parentCpf || '________________') : (formData.cpf || '________________'),
                  day: now.getDate(),
                  month: months[now.getMonth()]
                };

                Object.keys(replacements).forEach(key => {
                   text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(replacements[key]));
                });

                return text.split('\n').map((line, i) => (
                  <p key={i} style={{ marginBottom: '8px' }}>
                    {line.replace(/#/g, '').replace(/\*\*/g, '')}
                  </p>
                ));
              })()}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
              <input 
                type="checkbox" 
                checked={formData.agreedToTerms} 
                onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})} 
                style={{ width: '20px', height: '20px', accentColor: '#ffd700' }} 
              />
              Li e Aceito o Termo de Responsabilidade
            </label>
          </div>

          {/* Assinatura */}
          <h3 style={sectionTitleStyle}>Assinatura Digital</h3>
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa', textAlign: 'center', marginBottom: '12px' }}>Assine no quadro abaixo usando o mouse ou o dedo.</p>
          
          <div style={{ width: '100%' }}>
            <canvas 
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                border: '2px dashed rgba(255, 215, 0, 0.25)',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                cursor: 'crosshair',
                touchAction: 'none',
                display: 'block',
                width: '100%'
              }}
            />
          </div>
          <button type="button" onClick={clearSignature} style={{
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 16px', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif"
          }}>
            Limpar Assinatura
          </button>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            background: loading ? 'rgba(255, 215, 0, 0.5)' : 'linear-gradient(135deg, #ffd700, #fbbf24)',
            color: '#000',
            padding: '16px',
            border: 'none',
            width: '100%',
            fontSize: '1.1rem',
            fontWeight: '800',
            borderRadius: '12px',
            cursor: loading ? 'wait' : 'pointer',
            marginTop: '30px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)',
            transition: 'all 0.2s ease',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {loading ? 'ENVIANDO...' : '🥋 FINALIZAR MATRÍCULA'}
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: '15px' }}>
            © 2026 fdwords Elite Group. All rights reserved.
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
