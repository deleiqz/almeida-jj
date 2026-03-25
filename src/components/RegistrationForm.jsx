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
    plan: 'mensal',
    subPlan: 'evolucao',
    paymentMethod: 'pix',
    imageAuth: true,
    marketingAuth: true
  });
  
  const [isMinor, setIsMinor] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newStudentId, setNewStudentId] = useState(null);
  
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const isDrawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Force dark theme on body
  useEffect(() => {
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
      const dob = new Date(formData.birthDate);
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

    const planValues = { 'mensal': '120', 'trimestral': '320', 'anual': '1100' };
    let medicalInfo = formData.hasRestriction === 'sim' ? `Restrição Médica: ${formData.restrictionDesc}` : '';

    const { data: insertedData, error } = await supabase
      .from('students')
      .insert([{ 
        name: formData.name, 
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        belt: 'Branca',
        plan: formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1),
        sub_plan: formData.subPlan,
        payment_value: planValues[formData.plan] || '120',
        payment_method: formData.paymentMethod,
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
      setNewStudentId(insertedData.id);
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
    const whatsappMsg = encodeURIComponent(`Olá! Seu cadastro na Almeida JJ foi concluído com sucesso. 🥋\n\nVocê pode visualizar e baixar seu contrato assinado aqui: ${contractUrl}`);
    const whatsappLink = `https://wa.me/${formData.phone.replace(/\D/g, '')}?text=${whatsappMsg}`;

    return (
      <div style={{ ...pageStyle, alignItems: 'center' }}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '50px 30px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: '2rem' }}>✅</span>
          </div>
          <h2 style={{ color: '#10b981', marginBottom: '15px', fontSize: '1.6rem' }}>Matrícula Enviada!</h2>
          <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6', marginBottom: '30px' }}>
            Os seus dados foram recebidos pela <span style={{ color: '#ffd700', fontWeight: '700' }}>Almeida JJ</span>. Seja bem-vindo!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href={contractUrl} target="_blank" rel="noreferrer" style={{
              background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', padding: '14px', border: '1px solid #ffd700', borderRadius: '12px', textDecoration: 'none', fontWeight: '700'
            }}>
              📄 Ver Meu Contrato Assinado
            </a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" style={{
              background: '#25d366', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', textDecoration: 'none', fontWeight: '700'
            }}>
              💬 Receber Cópia no WhatsApp
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { value: 'mensal', label: 'Mensal', price: 'R$ 120' },
              { value: 'trimestral', label: 'Trimestral', price: 'R$ 320' },
              { value: 'anual', label: 'Anual', price: 'R$ 1.100' }
            ].map(plan => (
              <button
                key={plan.value}
                type="button"
                onClick={() => setFormData({...formData, plan: plan.value})}
                style={{
                  padding: '16px 8px',
                  borderRadius: '12px',
                  border: formData.plan === plan.value ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                  background: formData.plan === plan.value ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: formData.plan === plan.value ? '#ffd700' : '#a1a1aa',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>{plan.label}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{plan.price}</div>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Plano de Treino</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, subPlan: 'evolucao'})}
                style={{
                  padding: '12px', borderRadius: '10px', border: formData.subPlan === 'evolucao' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                  background: formData.subPlan === 'evolucao' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: formData.subPlan === 'evolucao' ? '#ffd700' : '#a1a1aa',
                  fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
                }}
              >
                🏁 Plano Evolução
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, subPlan: 'performance'})}
                style={{
                  padding: '12px', borderRadius: '10px', border: formData.subPlan === 'performance' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                  background: formData.subPlan === 'performance' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: formData.subPlan === 'performance' ? '#ffd700' : '#a1a1aa',
                  fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
                }}
              >
                ⚡ Plano Performance
              </button>
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
            </select>
          </div>

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
              {responsibilityTerm
                .replace(/{{name}}/g, formData.name || 'o aluno')
                .replace(/{{phone}}/g, formData.phone || 'não informado')
                .replace(/{{medicalInfo}}/g, formData.hasRestriction === 'sim' ? formData.restrictionDesc : 'Nenhuma restrição informada')
                .split('\n').map((line, i) => <p key={i} style={{ marginBottom: '8px' }}>{line.replace(/#/g, '').replace(/\*\*/g, '')}</p>)
              }
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
            © {new Date().getFullYear()} Almeida JJ • Sistema de Gestão
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
