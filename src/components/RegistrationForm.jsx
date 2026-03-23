import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.jpg';

// Extracted styles to keep JSX clean
const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  boxSizing: 'border-box',
  fontSize: '16px',
  backgroundColor: '#fff',
  color: '#333',
  WebkitAppearance: 'none',
  appearance: 'none',
  outline: 'none'
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    cpf: '',
    phone: '',
    hasRestriction: 'nao',
    restrictionDesc: '',
    parentName: '',
    parentCpf: '',
    kinship: '',
    plan: 'mensal',
  });
  
  const [isMinor, setIsMinor] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const canvasRef = useRef(null);
  const rectRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Force light theme on body for WhatsApp in-app browser compatibility
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    const originalOverflow = document.body.style.overflowX;
    document.body.style.backgroundColor = '#f4f7f6';
    document.body.style.color = '#333';
    document.body.style.overflowX = 'auto';
    
    // Ensure viewport meta is correct for mobile
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

  // Signature Pad Logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    rectRef.current = rect;
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = rectRef.current;
    if (!rect) return;

    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (canvasRef.current && !submitted) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
    }
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let documentUrl = '';
    
    // Convert signature to blob and upload
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

    // Determine payment value based on plan selection (mimicking standard prices)
    const planValues = {
      'mensal': '120',
      'trimestral': '320',
      'anual': '1100'
    };

    // Insert to database (we append restriction info to address text since we don't have a specific column yet)
    let medicalInfo = formData.hasRestriction === 'sim' ? `Restrição Médica: ${formData.restrictionDesc}` : '';

    const { error } = await supabase
      .from('students')
      .insert([{ 
        name: formData.name, 
        phone: formData.phone,
        belt: 'Branca', // Default value
        plan: formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1),
        payment_value: planValues[formData.plan] || '120',
        birth_date: formData.birthDate,
        cpf: formData.cpf,
        parent_name: isMinor ? formData.parentName : '',
        parent_cpf: isMinor ? formData.parentCpf : '',
        address: medicalInfo, // Storing medical info here temporarily
        has_authorization: true,
        document_url: documentUrl, // Signature image URL!
        status: 'pendente',
        created_at: new Date().toISOString()
      }]);

    if (error) {
      alert(`Erro ao enviar cadastro: ${error.message}`);
      console.error(error);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
          <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>Matrícula enviada com sucesso!</h2>
          <p style={{ color: '#555', fontSize: '16px' }}>Os seus dados foram recebidos pela Almeida JJ. Entraremos em contato em breve para finalizar o processo.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <img src={logo} alt="Almeida JJ" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '15px' }} />
        </div>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginTop: '10px', marginBottom: '5px' }}>Ficha de Matrícula</h2>
        <p style={{ textAlign: 'center', color: '#555', fontSize: '15px', marginBottom: '20px' }}>Bem-vindo à Almeida JJ Brazilian Jiu Jitsu</p>

        <form onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <h3 style={{ textAlign: 'center', color: '#2c3e50', marginTop: '30px', marginBottom: '15px' }}>Dados Pessoais</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Nome Completo</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Data de Nascimento</label>
            <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>CPF</label>
            <input type="text" required placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Telefone / WhatsApp</label>
            <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
          </div>

          {/* Dados Médicos */}
          <h3 style={{ textAlign: 'center', color: '#2c3e50', marginTop: '30px', marginBottom: '15px' }}>Dados Médicos</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Possui alguma restrição médica?</label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label style={{ color: '#333' }}><input type="radio" name="restricao" value="sim" checked={formData.hasRestriction === 'sim'} onChange={e => setFormData({...formData, hasRestriction: e.target.value})} /> Sim</label>
              <label style={{ color: '#333' }}><input type="radio" name="restricao" value="nao" checked={formData.hasRestriction === 'nao'} onChange={e => setFormData({...formData, hasRestriction: e.target.value})} /> Não</label>
            </div>
          </div>
          
          {formData.hasRestriction === 'sim' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Qual?</label>
              <input type="text" placeholder="Descreva brevemente" value={formData.restrictionDesc} onChange={e => setFormData({...formData, restrictionDesc: e.target.value})} style={inputStyle} />
            </div>
          )}

          {/* Autorização do Responsável */}
          {isMinor && (
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderLeft: '5px solid #ffc107', borderRadius: '5px', marginTop: '20px', marginBottom: '20px' }}>
              <h3 style={{ color: '#d35400', marginTop: '0', textAlign: 'left' }}>Autorização do Responsável</h3>
              <p style={{ color: '#555', fontSize: '14px' }}><strong>Aviso:</strong> O aluno é menor de 18 anos. É obrigatório o preenchimento dos dados do responsável legal.</p>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Nome do Responsável Legal</label>
                <input type="text" required={isMinor} value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} style={inputStyle} />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>CPF do Responsável</label>
                <input type="text" required={isMinor} value={formData.parentCpf} onChange={e => setFormData({...formData, parentCpf: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Grau de Parentesco</label>
                <select required={isMinor} value={formData.kinship} onChange={e => setFormData({...formData, kinship: e.target.value})} style={inputStyle}>
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
          <h3 style={{ textAlign: 'center', color: '#2c3e50', marginTop: '30px', marginBottom: '15px' }}>Escolha do Plano</h3>
          <div style={{ marginBottom: '15px' }}>
            <select required value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} style={inputStyle}>
              <option value="">Selecione seu plano...</option>
              <option value="mensal">Mensal - R$ 120,00</option>
              <option value="trimestral">Trimestral - R$ 320,00</option>
              <option value="anual">Anual - R$ 1.100,00</option>
            </select>
          </div>

          {/* Assinatura */}
          <h3 style={{ textAlign: 'center', color: '#2c3e50', marginTop: '30px', marginBottom: '15px' }}>Assinatura Digital</h3>
          <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>Assine no quadro abaixo usando o mouse ou o dedo.</p>
          
          <canvas 
            ref={canvasRef}
            width={340} 
            height={150} 
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              border: '2px dashed #ccc',
              borderRadius: '5px',
              width: '100%',
              maxWidth: '100%',
              height: '150px',
              backgroundColor: '#f9f9f9',
              cursor: 'crosshair',
              touchAction: 'none',
              display: 'block'
            }}
          />
          <button type="button" onClick={clearSignature} style={{
            backgroundColor: '#e74c3c', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer', marginTop: '10px', fontSize: '14px'
          }}>
            Limpar Assinatura
          </button>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            backgroundColor: '#27ae60', color: 'white', padding: '15px', border: 'none', width: '100%', fontSize: '18px', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginTop: '30px', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'ENVIANDO...' : 'FINALIZAR MATRÍCULA'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Removed extracted styles from bottom to avoid hoisting issues

export default RegistrationForm;
