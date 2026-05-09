import React from 'react';
import { ShieldOff, AlertTriangle, Phone, Mail, Clock } from 'lucide-react';

const BlockedPage = () => {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '20px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated background pulse */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
        animation: 'pulse-glow 3s ease-in-out infinite'
      }} />

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .blocked-card {
          animation: fade-in-up 0.8s ease-out;
        }
        .blocked-icon {
          animation: icon-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="blocked-card" style={{
        maxWidth: '580px',
        width: '100%',
        background: 'rgba(15, 15, 15, 0.95)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '24px',
        padding: '50px 40px',
        textAlign: 'center',
        position: 'relative',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 80px rgba(239, 68, 68, 0.1), 0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Top danger stripe */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)',
          borderRadius: '24px 24px 0 0'
        }} />

        {/* Shield icon */}
        <div className="blocked-icon" style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px'
        }}>
          <ShieldOff size={45} color="#ef4444" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '900',
          color: '#ef4444',
          marginBottom: '8px',
          letterSpacing: '-0.5px',
          textTransform: 'uppercase'
        }}>
          Sistema Suspenso
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '30px',
          fontWeight: '500'
        }}>
          Acesso temporariamente bloqueado por inadimplência
        </p>

        {/* Info card */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '15px' }}>
            <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Conforme <strong style={{ color: '#ef4444' }}>Cláusula 4.2</strong> do Contrato de Prestação de Serviços SaaS assinado digitalmente, 
              o acesso ao sistema foi suspenso devido a <strong style={{ color: '#ef4444' }}>inadimplência superior a 15 dias corridos</strong>.
            </p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                Data da suspensão: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{today}</strong>
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', paddingLeft: '26px' }}>
              A suspensão será revertida automaticamente após a regularização integral dos débitos em aberto.
            </div>
          </div>
        </div>

        {/* Action section */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
            Para restabelecer o acesso, entre em contato:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a
              href="https://wa.me/5511986423450?text=Olá, gostaria de regularizar minha situação financeira referente ao sistema Almeida JJ."
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.95rem',
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 211, 102, 0.3)'; }}
            >
              <Phone size={18} />
              Regularizar via WhatsApp
            </a>

            <a
              href="mailto:vaandias@gmail.com?subject=Regularização Financeira - Sistema Almeida JJ"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <Mail size={18} />
              Contato por E-mail
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '20px'
        }}>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', lineHeight: '1.5' }}>
            Este bloqueio é respaldado pelo contrato firmado entre as partes conforme legislação vigente.
            <br />Foro de São Paulo/SP — Art. 8.2 do Instrumento Contratual.
          </p>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', marginTop: '10px' }}>
            © 2026 fdwords Elite Group. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage;
