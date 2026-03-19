import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Mail, UserPlus, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Login = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (signUpError) throw signUpError;
        setSuccess(true);
      } else if (view === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setSuccess(true);
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          if (authError.message === 'Invalid login credentials') {
            throw new Error('E-mail ou senha incorretos.');
          }
          throw authError;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single();

        const roleLower = profile?.role?.toLowerCase() || 'employee';
        onLogin(data.user, roleLower, profile?.full_name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
          <CheckCircle color="var(--accent-secondary)" size={60} style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '15px' }}>{view === 'forgot' ? 'E-mail Enviado' : 'Verifique seu E-mail'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
            {view === 'forgot' 
              ? `Enviamos as instruções para recuperar sua senha para ${email}.`
              : `Enviamos um link de confirmação para ${email}. Verifique sua caixa de entrada para ativar sua conta na Almeida JJ.`
            }
          </p>
          <button 
            onClick={() => { setView('login'); setSuccess(false); }}
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
          {view === 'register' ? 'Criar nova conta' : view === 'forgot' ? 'Recuperar Senha' : 'Acesso Restrito'}
        </p>

        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
          {view === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <LogIn style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
                <input 
                  type="text" 
                  placeholder="Ex: João Almeida"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
          )}

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

          {view !== 'forgot' && (
            <div style={{ marginBottom: '10px' }}>
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
          )}

          {view === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button 
                type="button" 
                onClick={() => setView('forgot')}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {view === 'register' && (
             <div style={{ marginBottom: '30px', marginTop: '20px', background: 'rgba(255,215,0,0.05)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--accent-primary)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', margin: 0 }}>
                  Nota: Novas contas entram automaticamente como <strong>Funcionário</strong>.
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
            {loading ? 'Processando...' : 
             view === 'register' ? <><UserPlus size={20} /> Cadastrar</> : 
             view === 'forgot' ? <><Mail size={20} /> Recuperar Senha</> : 
             <><LogIn size={20} /> Entrar</>}
          </button>

          <button 
            type="button"
            onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(null); }}
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
            {view === 'login' ? 'Não tem conta? Cadastre-se' : <><ArrowLeft size={16} /> Voltar para Login</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
