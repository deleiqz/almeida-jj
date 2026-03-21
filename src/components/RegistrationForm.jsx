import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.jpg';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    belt: 'Branca',
    plan: 'Mensal',
    amount: '150'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('students')
      .insert([{ 
        name: formData.name, 
        phone: formData.phone,
        belt: formData.belt,
        plan: formData.plan,
        payment_value: formData.amount,
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
