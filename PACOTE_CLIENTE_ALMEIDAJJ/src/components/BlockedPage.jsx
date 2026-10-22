import React from 'react';
import { Lock, AlertTriangle, Phone } from 'lucide-react';

const BlockedPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: '#1e293b',
        borderRadius: '16px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #334155'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Lock size={32} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
          Acesso Temporariamente Suspenso
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
          O acesso a esta plataforma foi bloqueado por motivos administrativos ou pendência de manutenção. Entre em contato com o suporte para regularização.
        </p>

        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: '#38bdf8',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          <Phone size={18} />
          <span>Suporte Técnico: (11) 95131-3866</span>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage;
