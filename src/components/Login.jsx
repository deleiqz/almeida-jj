import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Mail, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isRegistering) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } else {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const roleLower = profile?.role?.toLowerCase() || 'employee';
      onLogin(data.user, roleLower);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
          <CheckCircle color="var(--accent-secondary)" size={60} style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '15px' }}>Verifique seu E-mail</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
            Enviamos um link de confirmação para <strong>{email}</strong>.<br/> 
            Por favor, confirme seu e-mail para ativar sua conta na Almeida JJ.
          </p>
          <button 
            onClick={() => { setIsRegistering(false); setSuccess(false); }}
            style={{ width: '100%', padding: '12px', background: 'var(--accent-primary)', color: 'black', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <img 
          src={logo} 
          alt="Almeida JJ Logo" 
          style={{ width: '80px', height: '80px', borderRadius: '15px', marginBottom: '20px', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} 
        />
        
        <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 800 }}>
          Almeida<span style={{ color: 'var(--accent-primary)' }}>JJ</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
          {isRegistering ? 'Criar nova conta de acesso' : 'Acesso Restrito'}
        </p>

        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
              <input 
                type="email" 
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '10px',
                  color: 'white',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '10px',
                  color: 'white',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          {isRegistering && (
             <div style={{ marginBottom: '30px', background: 'rgba(255,215,0,0.05)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--accent-primary)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', margin: 0 }}>
                  Nota: Novas contas entram automaticamente como <strong>Funcionário</strong>. O acesso Admin deve ser liberado pelo Master.
                </p>
             </div>
          )}

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--accent-primary)',
              color: 'black',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Processando...' : isRegistering ? <><UserPlus size={20} /> Cadastrar</> : <><LogIn size={20} /> Entrar</>}
          </button>

          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isRegistering ? <><ArrowLeft size={16} /> Voltar para Login</> : <>Não tem conta? Cadastre-se</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
