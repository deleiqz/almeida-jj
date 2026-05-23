import React, { useState, useEffect } from 'react';
import { Send, UserCheck, MessageSquare, List, CheckCircle, Clock, Share2, Clipboard, Search, AlertCircle, Trash2, ExternalLink, Loader2, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

const Notifications = ({ students, isDevMaster }) => {
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingQueue, setSendingQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [sentIds, setSentIds] = useState(new Set());
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [sendMode, setSendMode] = useState('local'); // Default to local for everyone
  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem('whatsapp_api_config');
    return saved ? JSON.parse(saved) : { instance: '', token: '', clientToken: '', localUrl: 'http://127.0.0.1:3005' };
  });
  const [isSendingAuto, setIsSendingAuto] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ online: false, connected: false, loading: false });

  // Save API config to localStorage
  const saveApiConfig = (newConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem('whatsapp_api_config', JSON.stringify(newConfig));
  };

  const checkConnection = async () => {
    if (sendMode !== 'local') return;
    setConnectionStatus(prev => ({ ...prev, loading: true }));
    try {
      const baseUrl = apiConfig.localUrl || 'http://127.0.0.1:3005';
      const response = await fetch(`${baseUrl}/status`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'x-api-key': import.meta.env.VITE_BRIDGE_SECURITY_KEY
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus({ online: true, connected: data.connected, loading: false });
      } else {
        setConnectionStatus({ online: false, connected: false, loading: false });
      }
    } catch (error) {
      setConnectionStatus({ online: false, connected: false, loading: false });
    }
  };

  useEffect(() => {
    if (sendMode === 'local') {
      checkConnection();
      const interval = setInterval(checkConnection, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [sendMode, apiConfig.localUrl]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && s.status === 'pago';
    if (filter === 'pending') return matchesSearch && (s.status === 'pendente' || s.status === 'vencido');
    if (filter === 'birthdays') {
      const today = new Date();
      return matchesSearch && s.birthDate && (() => {
        const bdate = new Date(s.birthDate + 'T00:00:00');
        return bdate.getMonth() === today.getMonth();
      })();
    }
    if (filter === 'near_due') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return matchesSearch && s.nextDue && (() => {
        const due = new Date(s.nextDue + 'T00:00:00');
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && s.status !== 'pago';
      })();
    }
    return matchesSearch && s.belt === filter;
  });

  const belts = [...new Set(students.map(s => s.belt))];

  const handleSendAll = () => {
    if (!message) return alert("Digite uma mensagem!");
    
    const confirmSend = window.confirm(`Deseja iniciar o disparo para ${filteredStudents.length} alunos?`);
    if (confirmSend) {
      setSendingQueue(filteredStudents);
      setCurrentIndex(0);
      if (sendMode !== 'manual') {
        // For auto-modes, we call sendNext with index 0 immediately
        sendNext(0, filteredStudents);
      }
    }
  };

  const formatMessage = (rawMessage, student) => {
    let formattedDate = '';
    if (student.nextDue) {
      const d = new Date(student.nextDue + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('pt-BR');
      }
    }
    return rawMessage
      .replace(/{nome}/g, student.name || '')
      .replace(/{plano}/g, student.plan || '')
      .replace(/{vencimento}/g, formattedDate || '')
      .replace(/{link_pagamento}/g, student.paymentLink || '');
  };

  const sendNext = async (indexOverride = null, queueOverride = null) => {
    const idx = indexOverride !== null ? indexOverride : currentIndex;
    const queue = queueOverride !== null ? queueOverride : sendingQueue;

    if (idx >= 0 && idx < queue.length) {
      const student = queue[idx];
      if (!student.phone) return skipNext(idx, queue);

      const phone = student.phone.replace(/\D/g, '');
      const fullPhone = `55${phone}`;
      const formattedMessage = formatMessage(message, student);

      if (sendMode === 'manual') {
        const url = `https://web.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(formattedMessage)}`;
        window.open(url, '_blank');
        updateProgress(student.id, idx, queue);
      } else if (sendMode === 'api') {
        if (!apiConfig.instance || !apiConfig.token) {
          alert("Configure a Instância e o Token da Z-API primeiro!");
          return cancelQueue();
        }

        setIsSendingAuto(true);
        try {
          const response = await fetch(`https://api.z-api.io/instances/${apiConfig.instance}/token/${apiConfig.token}/send-text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Client-Token': apiConfig.clientToken
            },
            body: JSON.stringify({
              phone: fullPhone,
              message: formattedMessage
            })
          });

          if (response.ok) {
            updateProgress(student.id, idx, queue);
            if (idx + 1 < queue.length) {
              setTimeout(() => sendNext(idx + 1, queue), 10000); // 10s delay
            } else {
              finishQueue();
            }
          } else {
            const err = await response.json();
            alert(`Erro na API: ${err.message || 'Erro desconhecido'}`);
            setIsSendingAuto(false);
          }
        } catch (error) {
          alert(`Erro de conexão: ${error.message}`);
          setIsSendingAuto(false);
        }
      } else if (sendMode === 'local') {
        const baseUrl = apiConfig.localUrl || 'http://127.0.0.1:3005';
        setIsSendingAuto(true);
        try {
          const response = await fetch(`${baseUrl}/send-message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
              'x-api-key': import.meta.env.VITE_BRIDGE_SECURITY_KEY
            },
            body: JSON.stringify({
              phone: fullPhone,
              message: formattedMessage
            })
          });

          if (response.ok) {
            updateProgress(student.id, idx, queue);
            if (idx + 1 < queue.length) {
              // Local server has its own delay, but we'll add 2s here just for safety
              setTimeout(() => sendNext(idx + 1, queue), 2000); 
            } else {
              finishQueue();
            }
          } else {
            const err = await response.json();
            alert(`Erro no Servidor Local: ${err.error || 'Verifique se o terminal está rodando'}`);
            setIsSendingAuto(false);
          }
        } catch (error) {
          alert(`Erro de conexão com o servidor local: ${error.message}. (O terminal no PC está aberto?)`);
          setIsSendingAuto(false);
        }
      }
    }
  };

  const updateProgress = (studentId, currentIdx, queue) => {
    setSentIds(prev => new Set(prev).add(studentId));
    if (sendMode === 'manual') {
      if (currentIdx + 1 < queue.length) {
        setCurrentIndex(currentIdx + 1);
      } else {
        finishQueue();
      }
    } else {
      setCurrentIndex(currentIdx + 1);
    }
  };

  const skipNext = (currentIdx, queue) => {
    const q = queue || sendingQueue;
    const idx = currentIdx !== null ? currentIdx : currentIndex;
    
    if (idx + 1 < q.length) {
      setCurrentIndex(idx + 1);
      if (sendMode !== 'manual' && isSendingAuto) {
         sendNext(idx + 1, q);
      }
    } else {
      finishQueue();
    }
  };

  const finishQueue = () => {
    alert("Disparo concluído!");
    setSendingQueue([]);
    setCurrentIndex(-1);
    setIsSendingAuto(false);
  };

  const cancelQueue = () => {
    setSendingQueue([]);
    setCurrentIndex(-1);
  };

  const copyAllNumbers = () => {
    const numbers = filteredStudents
      .map(s => (s.phone || '').replace(/\D/g, ''))
      .filter(p => p)
      .map(p => `55${p}`)
      .join('\n');
    
    if (!numbers) return alert("Nenhum número encontrado!");
    
    navigator.clipboard.writeText(numbers);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2000);
  };

  const sendSingle = (student) => {
    if (!message) return alert("Digite uma mensagem primeiro!");
    const phone = (student.phone || '').replace(/\D/g, '');
    const formattedMsg = formatMessage(message, student);
    const url = `https://web.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(formattedMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="notifications-container">
      <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Notificações via WhatsApp</h2>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
            {isDevMaster && (
              <>
                <button 
                  onClick={() => setSendMode('manual')}
                  style={{ 
                    background: 'none', border: 'none', color: sendMode === 'manual' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '8px 0', borderBottom: sendMode === 'manual' ? '2px solid var(--accent-primary)' : 'none',
                    cursor: 'pointer', fontWeight: sendMode === 'manual' ? 'bold' : 'normal'
                  }}
                >
                  Modo Manual (Abas)
                </button>
                <button 
                  onClick={() => setSendMode('api')}
                  style={{ 
                    background: 'none', border: 'none', color: sendMode === 'api' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '8px 0', borderBottom: sendMode === 'api' ? '2px solid var(--accent-primary)' : 'none',
                    cursor: 'pointer', fontWeight: sendMode === 'api' ? 'bold' : 'normal'
                  }}
                >
                  Modo Profissional (Z-API)
                </button>
              </>
            )}
            <button 
              onClick={() => setSendMode('local')}
              style={{ 
                background: 'none', border: 'none', color: sendMode === 'local' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '8px 0', borderBottom: sendMode === 'local' ? '2px solid var(--accent-primary)' : 'none',
                cursor: 'pointer', fontWeight: sendMode === 'local' ? 'bold' : 'normal',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              WhatsApp
              {sendMode === 'local' && (
                connectionStatus.loading ? <RefreshCw size={12} className="spin" /> : 
                connectionStatus.connected ? <ShieldCheck size={14} color="#10b981" /> : <ShieldAlert size={14} color="#ef4444" />
              )}
            </button>
          </div>

          {sendMode === 'api' && (
            <div className="glass" style={{ padding: '15px', marginBottom: '20px', background: 'rgba(255,215,0,0.02)', border: '1px dashed var(--accent-primary)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Configuração Z-API</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <input 
                  type="text" placeholder="Instance ID" 
                  value={apiConfig.instance}
                  onChange={(e) => saveApiConfig({...apiConfig, instance: e.target.value})}
                  style={{ padding: '8px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                />
                <input 
                  type="text" placeholder="Token" 
                  value={apiConfig.token}
                  onChange={(e) => saveApiConfig({...apiConfig, token: e.target.value})}
                  style={{ padding: '8px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                />
                <input 
                  type="text" placeholder="Client Token (Opcional)" 
                  value={apiConfig.clientToken}
                  onChange={(e) => saveApiConfig({...apiConfig, clientToken: e.target.value})}
                  style={{ padding: '8px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                />
              </div>
            </div>
          )}

          {sendMode === 'local' && isDevMaster && (
            <div className="glass" style={{ padding: '15px', marginBottom: '20px', background: 'rgba(16,185,129,0.02)', border: '1px dashed #10b981' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#10b981' }}>Configuração Servidor Local</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text" placeholder="URL do Servidor (Ex: http://192.168.1.10:3005)" 
                  value={apiConfig.localUrl}
                  onChange={(e) => saveApiConfig({...apiConfig, localUrl: e.target.value})}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                />
                <button 
                  onClick={checkConnection}
                  disabled={connectionStatus.loading}
                  style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <RefreshCw size={14} className={connectionStatus.loading ? 'spin' : ''} />
                  Testar
                </button>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                <a 
                  href={`${apiConfig.localUrl}/qr`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={12} /> Ver QR Code
                </a>
                <a 
                  href={`${apiConfig.localUrl}/`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={12} /> Status do Servidor
                </a>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                * Link do <strong>ngrok</strong> ou <strong>IP:3005</strong>. Cada mensagem tem delay de 10-15s para sua segurança.
              </p>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Modelos de Mensagem Rápidos</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button 
                type="button"
                onClick={() => setMessage('Olá, {nome}! Passando para lembrar que o vencimento da sua mensalidade do plano {plano} está próximo ({vencimento}). Você pode realizar o pagamento através do link: {link_pagamento} \n\nQualquer dúvida estamos à disposição! 🥋')}
                style={{ padding: '6px 12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: 'var(--accent-primary)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                💵 Lembrete de Mensalidade
              </button>
              <button 
                type="button"
                onClick={() => setMessage('Parabéns, {nome}! 🎂🥋\n\nA família Almeida JJ te deseja um feliz aniversário! Que seu novo ciclo seja de muita saúde, paz, conquistas e evolução nos treinos. Oss!')}
                style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                🎂 Parabéns Aniversário
              </button>
              <button 
                type="button"
                onClick={() => setMessage('Seja muito bem-vindo(a) à Almeida JJ, {nome}! 🥋\n\nFicamos felizes com a sua matrícula no plano {plano}. Nos vemos no tatame! Oss!')}
                style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                👋 Boas-vindas
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '-8px', marginBottom: '12px' }}>
              * Variáveis automáticas: <strong>{'{nome}'}</strong>, <strong>{'{plano}'}</strong>, <strong>{'{vencimento}'}</strong>, <strong>{'{link_pagamento}'}</strong>
            </p>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Mensagem para Disparo</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite aqui a mensagem que deseja enviar..."
              style={{ 
                width: '100%', 
                height: '150px', 
                padding: '15px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.1)',
                resize: 'none',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Selecionados: <strong>{filteredStudents.length}</strong> alunos
              </div>
              <button 
                onClick={copyAllNumbers}
                className="glass"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.8rem', padding: '8px 16px', border: '1px solid var(--card-border)', 
                  background: copiedNumbers ? 'rgba(16,185,129,0.1)' : 'transparent', 
                  color: copiedNumbers ? '#10b981' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {copiedNumbers ? <CheckCircle size={14} /> : <Clipboard size={14} />}
                {copiedNumbers ? 'Números Copiados!' : 'Copiar Números'}
              </button>
            </div>

            {currentIndex === -1 ? (
              <button 
                onClick={handleSendAll}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
              >
                <Send size={18} /> Iniciar Disparo Sequencial
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={cancelQueue}
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={sendNext}
                  className="btn-primary"
                  disabled={isSendingAuto}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', opacity: isSendingAuto ? 0.7 : 1 }}
                >
                  <Send size={18} /> {sendMode === 'api' ? (isSendingAuto ? 'Enviando...' : 'Iniciar Envio Automático') : `Enviar Próximo (${currentIndex + 1}/${sendingQueue.length})`}
                </button>
              </div>
            )}
          </div>

          {currentIndex !== -1 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <div style={{ color: 'var(--accent-primary)' }}>
                  Enviando para: <strong>{sendingQueue[currentIndex]?.name}</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {Math.round(((currentIndex + 1) / sendingQueue.length) * 100)}%
                </div>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${((currentIndex + 1) / sendingQueue.length) * 100}%`, 
                  height: '100%', 
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 10px var(--accent-primary)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          )}
          
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
            * O modo sequencial evita que o navegador bloqueie as janelas e permite que você controle o tempo de envio.
          </p>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Filtros de Pesquisa</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nome..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '10px 10px 10px 40px', 
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ 
                padding: '10px', borderRadius: '8px', textAlign: 'left',
                background: filter === 'all' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                color: filter === 'all' ? 'var(--accent-primary)' : 'white',
                border: 'none', cursor: 'pointer'
              }}
            >
              Todos os Alunos
            </button>
            <button 
              onClick={() => setFilter('active')}
              style={{ 
                padding: '10px', borderRadius: '8px', textAlign: 'left',
                background: filter === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                color: filter === 'active' ? '#10b981' : 'white',
                border: 'none', cursor: 'pointer'
              }}
            >
              Alunos Ativos (Em dia)
            </button>
            <button 
              onClick={() => setFilter('pending')}
              style={{ 
                padding: '10px', borderRadius: '8px', textAlign: 'left',
                background: filter === 'pending' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                color: filter === 'pending' ? '#ef4444' : 'white',
                border: 'none', cursor: 'pointer'
              }}
            >
              Pendentes / Vencidos
            </button>
            <button 
              onClick={() => setFilter('birthdays')}
              style={{ 
                padding: '10px', borderRadius: '8px', textAlign: 'left',
                background: filter === 'birthdays' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                color: filter === 'birthdays' ? '#10b981' : 'white',
                border: 'none', cursor: 'pointer'
              }}
            >
              🎂 Aniversariantes do Mês
            </button>
            <button 
              onClick={() => setFilter('near_due')}
              style={{ 
                padding: '10px', borderRadius: '8px', textAlign: 'left',
                background: filter === 'near_due' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                color: filter === 'near_due' ? 'var(--accent-primary)' : 'white',
                border: 'none', cursor: 'pointer'
              }}
            >
              ⏳ Vencimentos Próximos (7 dias)
            </button>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Filtrar por Faixa</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {belts.map(belt => (
                  <button 
                    key={belt}
                    onClick={() => setFilter(belt)}
                    style={{ 
                      padding: '8px', borderRadius: '6px', fontSize: '0.75rem',
                      background: filter === belt ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                      color: filter === belt ? 'var(--accent-primary)' : 'white',
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    {belt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass" style={{ marginTop: '24px', padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Alunos na Fila de Envio</h3>
        <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1a1a1a', zIndex: 1 }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>WhatsApp</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>{student.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{student.phone}</td>
                   <td style={{ padding: '12px' }}>
                    {sentIds.has(student.id) ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <CheckCircle size={14} /> ENVIADO
                      </span>
                    ) : currentIndex !== -1 && sendingQueue[currentIndex]?.id === student.id ? (
                      <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <Loader2 size={14} className="spin" /> ENVIANDO...
                      </span>
                    ) : (
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                        background: student.status === 'pago' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: student.status === 'pago' ? '#10b981' : '#ef4444'
                      }}>
                        {student.status.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => sendSingle(student)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '5px' }}
                      title="Enviar Novamente"
                    >
                      <Send size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
