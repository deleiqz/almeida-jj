import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle, Upload, Shield } from 'lucide-react';
import logo from '../assets/logo.jpg';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    belt: 'Branca',
    plan: 'Mensal',
    amount: '150',
    birthDate: '',
    address: '',
    cpf: '',
    rg: '',
    parentName: '',
    parentCpf: '',
    hasAuthorization: false
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [isMinor, setIsMinor] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBirthDateChange = (e) => {
    const date = e.target.value;
    setFormData({ ...formData, birthDate: date });
    
    if (date) {
      const birth = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setIsMinor(age < 18);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let documentUrl = '';
    if (documentFile) {
      const fileExt = documentFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `registration-docs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, documentFile);
      
      if (uploadError) {
        console.error("Erro ao subir documento:", uploadError);
      } else {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        documentUrl = urlData.publicUrl;
      }
    }
    
    const { error } = await supabase
      .from('students')
      .insert([{ 
        name: formData.name, 
        phone: formData.phone,
        belt: formData.belt,
        plan: formData.plan,
        payment_value: formData.amount,
        birth_date: formData.birthDate,
        address: formData.address,
        cpf: formData.cpf,
        rg: formData.rg,
        parent_name: formData.parentName,
        parent_cpf: formData.parentCpf,
        has_authorization: formData.hasAuthorization,
        document_url: documentUrl,
        status: 'pendente',
        created_at: new Date().toISOString()
      }]);

    if (error) {
      alert("Erro ao enviar cadastro. Por favor, tente novamente.");
      console.error(error);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="glass" style={{ padding: '40px', borderRadius: '20px', maxWidth: '400px' }}>
          <CheckCircle size={64} color="var(--accent-secondary)" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Cadastro Enviado!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Obrigado por se interessar pela Almeida JJ. Entraremos em contato em breve!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
        <img src={logo} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '12px' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Almeida<span style={{ color: 'var(--accent-primary)' }}>JJ</span></h1>
      </div>

      <div className="glass" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '500px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Formulário de Cadastro</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: João Silva"
            />
          </div>

          <div className="form-group">
            <label>WhatsApp (com DDD)</label>
            <input 
              type="tel" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Ex: 11999999999"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input 
                type="date" 
                required 
                value={formData.birthDate}
                onChange={handleBirthDateChange}
              />
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input 
                type="text" 
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Endereço Completo</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Rua, Número, Bairro, Cidade"
            />
          </div>

          {isMinor && (
            <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--accent-primary)', background: 'rgba(255, 215, 0, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--accent-primary)' }}>
                <Shield size={20} />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Responsável (Aluno Menor)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label>Nome do Responsável</label>
                  <input 
                    type="text" 
                    required={isMinor}
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>CPF do Responsável</label>
                  <input 
                    type="text" 
                    required={isMinor}
                    value={formData.parentCpf}
                    onChange={(e) => setFormData({...formData, parentCpf: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Faixa Atual</label>
              <select 
                value={formData.belt}
                onChange={(e) => setFormData({...formData, belt: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="Branca">Branca</option>
                <option value="Cinza">Cinza</option>
                <option value="Amarela">Amarela</option>
                <option value="Laranja">Laranja</option>
                <option value="Verde">Verde</option>
                <option value="Azul">Azul</option>
                <option value="Roxa">Roxa</option>
                <option value="Marrom">Marrom</option>
                <option value="Preta">Preta</option>
              </select>
            </div>
            <div className="form-group">
              <label>Plano de Interesse</label>
              <select 
                value={formData.plan}
                onChange={(e) => setFormData({...formData, plan: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Documento de Identidade / Autorização (Foto)</label>
            <div style={{ 
              border: '2px dashed rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              padding: '20px', 
              textAlign: 'center',
              cursor: 'pointer',
              background: documentFile ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
            }} onClick={() => document.getElementById('file-upload').click()}>
              <input 
                id="file-upload"
                type="file" 
                accept="image/*" 
                onChange={(e) => setDocumentFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <Upload size={24} style={{ marginBottom: '8px', color: documentFile ? '#10b981' : 'var(--text-secondary)' }} />
              <div style={{ fontSize: '0.9rem' }}>
                {documentFile ? documentFile.name : 'Clique para anexar documento'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input 
              type="checkbox" 
              required 
              checked={formData.hasAuthorization}
              onChange={(e) => setFormData({...formData, hasAuthorization: e.target.checked})}
              id="auth-check"
            />
            <label htmlFor="auth-check" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Confirmo que as informações são verdadeiras e aceito os termos da academia.
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px' }}
          >
            {loading ? 'Enviando...' : <><Send size={18} /> Enviar Cadastro</>}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} Almeida Jiu-Jitsu. Todos os direitos reservados.
      </p>
    </div>
  );
};

export default RegistrationForm;
