import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, DollarSign, CreditCard, Activity, ShieldOff, ShieldCheck, AlertTriangle } from 'lucide-react';

const Settings = ({ settings, updateSettings }) => {
  const [links, setLinks] = useState({
    pix: '',
    credito: '',
    debito: '',
    totalpass: '',
    gympass: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const isSystemBlocked = settings?.system_blocked === 'true' || settings?.system_blocked === true;

  useEffect(() => {
    if (settings.payment_links) {
      setLinks({
        pix: settings.payment_links.pix || '',
        credito: settings.payment_links.credito || '',
        debito: settings.payment_links.debito || '',
        totalpass: settings.payment_links.totalpass || '',
        gympass: settings.payment_links.gympass || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings('payment_links', links);
    setIsSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="settings-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Configurações do Sistema</h2>
        <button 
          className="btn-primary" 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#ffd700' }}>
            <LinkIcon size={20} /> Links de Pagamento Globais
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Estes links serão mostrados aos alunos no final da matrícula pública (`/?registro`) de acordo com o método escolhido.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <DollarSign size={16} /> Chave Pix (ou Link Copia e Cola)
              </label>
              <input 
                type="text" 
                value={links.pix}
                onChange={(e) => setLinks({...links, pix: e.target.value})}
                placeholder="Ex: 00020126... ou email@pix.com"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  <CreditCard size={16} /> Link de Cartão (Crédito)
                </label>
                <input 
                  type="text" 
                  value={links.credito}
                  onChange={(e) => setLinks({...links, credito: e.target.value})}
                  placeholder="Ex: https://mpago.la/..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  <CreditCard size={16} /> Link de Cartão (Débito)
                </label>
                <input 
                  type="text" 
                  value={links.debito}
                  onChange={(e) => setLinks({...links, debito: e.target.value})}
                  placeholder="Ex: https://mpago.la/..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                />
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  <Activity size={16} /> Link/Instruções Totalpass
                </label>
                <input 
                  type="text" 
                  value={links.totalpass}
                  onChange={(e) => setLinks({...links, totalpass: e.target.value})}
                  placeholder="Instruções ou Link de Check-in"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  <Activity size={16} /> Link/Instruções Gympass
                </label>
                <input 
                  type="text" 
                  value={links.gympass}
                  onChange={(e) => setLinks({...links, gympass: e.target.value})}
                  placeholder="Instruções ou Link de Check-in"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', opacity: 0.7 }}>
          <h3 style={{ marginBottom: '15px' }}>Outras Configurações</h3>
          <p style={{ fontSize: '0.85rem' }}>Em breve: Configurações de e-mail e notificações WhatsApp.</p>
        </div>
      </div>

        {/* SYSTEM BLOCK - DANGER ZONE */}
        <div className="glass" style={{ 
          padding: '24px', 
          border: isSystemBlocked ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(239, 68, 68, 0.15)',
          background: isSystemBlocked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', 
            color: isSystemBlocked ? '#ef4444' : '#f59e0b' 
          }}>
            {isSystemBlocked ? <ShieldOff size={22} /> : <AlertTriangle size={22} />}
            Zona de Perigo — Bloqueio do Sistema
          </h3>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
            {isSystemBlocked 
              ? '⛔ O sistema está BLOQUEADO. Todos os usuários (exceto você) estão vendo a tela de suspensão por inadimplência. O cliente não consegue acessar nenhuma funcionalidade.'
              : 'Ative o bloqueio para suspender o acesso do cliente ao sistema. Conforme Cláusula 4.2 do contrato, após 15 dias de inadimplência a CONTRATADA pode suspender o sistema.'
            }
          </p>

          {isSystemBlocked && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShieldOff size={24} color="#ef4444" />
              <div>
                <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.95rem' }}>SISTEMA SUSPENSO</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                  O cliente está vendo a página de bloqueio com referência à Cláusula 4.2
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={async () => {
              const newState = !isSystemBlocked;
              const action = newState ? 'BLOQUEAR' : 'DESBLOQUEAR';
              const confirmMsg = newState 
                ? '⚠️ ATENÇÃO: Isso vai BLOQUEAR o acesso de TODOS os usuários do sistema (exceto você). O cliente verá uma tela de suspensão por inadimplência.\n\nTem certeza?'
                : '✅ Isso vai RESTAURAR o acesso ao sistema para todos os usuários.\n\nConfirma?';
              
              if (!window.confirm(confirmMsg)) return;
              
              setIsBlocking(true);
              await updateSettings('system_blocked', newState ? 'true' : 'false');
              setIsBlocking(false);
              alert(newState ? '🔒 Sistema BLOQUEADO com sucesso.' : '🔓 Sistema DESBLOQUEADO com sucesso.');
            }}
            disabled={isBlocking}
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '1rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              border: 'none',
              background: isSystemBlocked 
                ? 'linear-gradient(135deg, #16a34a, #15803d)' 
                : 'linear-gradient(135deg, #dc2626, #991b1b)',
              color: 'white',
              boxShadow: isSystemBlocked 
                ? '0 4px 15px rgba(22, 163, 74, 0.3)'
                : '0 4px 15px rgba(220, 38, 38, 0.3)'
            }}
          >
            {isBlocking ? 'Processando...' : isSystemBlocked ? (
              <><ShieldCheck size={20} /> Desbloquear Sistema</>
            ) : (
              <><ShieldOff size={20} /> Bloquear Sistema por Inadimplência</>
            )}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '12px', textAlign: 'center' }}>
            Base legal: Cláusula 4.2 — Contrato SaaS de Prestação de Serviços
          </p>
        </div>
    </div>
  );
};

export default Settings;
