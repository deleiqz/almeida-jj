import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, DollarSign, CreditCard, Activity } from 'lucide-react';

const Settings = ({ settings, updateSettings }) => {
  const [links, setLinks] = useState({
    pix: '',
    credito: '',
    debito: '',
    totalpass: '',
    gympass: ''
  });
  const [isSaving, setIsSaving] = useState(false);

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
    </div>
  );
};

export default Settings;
