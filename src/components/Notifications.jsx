import React, { useState } from 'react';
import { Send, Users, CheckCircle, Search } from 'lucide-react';

const Notifications = ({ students }) => {
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingQueue, setSendingQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [sentIds, setSentIds] = useState(new Set());

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && s.status === 'pago';
    if (filter === 'pending') return matchesSearch && (s.status === 'pendente' || s.status === 'vencido');
    return matchesSearch && s.belt === filter;
  });

  const belts = [...new Set(students.map(s => s.belt))];

  const handleSendAll = () => {
    if (!message) return alert("Digite uma mensagem!");
    
    const confirmSend = window.confirm(`Deseja iniciar o disparo para ${filteredStudents.length} alunos?`);
    if (confirmSend) {
      setSendingQueue(filteredStudents);
      setCurrentIndex(0);
    }
  };

  const sendNext = () => {
    if (currentIndex >= 0 && currentIndex < sendingQueue.length) {
      const student = sendingQueue[currentIndex];
      if (student.phone) {
        const phone = student.phone.replace(/\D/g, '');
        const url = `https://web.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        
        setSentIds(prev => new Set(prev).add(student.id));
        
        if (currentIndex + 1 < sendingQueue.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          alert("Disparo concluído!");
          setSendingQueue([]);
          setCurrentIndex(-1);
        }
      }
    }
  };

  const cancelQueue = () => {
    setSendingQueue([]);
    setCurrentIndex(-1);
  };

  const sendSingle = (student) => {
    if (!message) return alert("Digite uma mensagem primeiro!");
    const phone = student.phone.replace(/\D/g, '');
    const url = `https://web.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="notifications-container">
      <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Notificações via WhatsApp</h2>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Selecionados: <strong>{filteredStudents.length}</strong> alunos
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
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                >
                  <Send size={18} /> Enviar Próximo ({currentIndex + 1}/{sendingQueue.length})
                </button>
              </div>
            )}
          </div>
          {currentIndex !== -1 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--accent-primary)' }}>
                Enviando para: <strong>{sendingQueue[currentIndex]?.name}</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${((currentIndex + 1) / sendingQueue.length) * 100}%`, 
                  height: '100%', 
                  background: 'var(--accent-primary)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
            * O modo sequencial evita que o WhatsApp Web trave ou que o navegador bloqueie as abas.
          </p>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Filtros</h3>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Buscar aluno..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%' }}
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
              Alunos Ativos (Pagos)
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
              Alunos Pendentes/Vencidos
            </button>
            
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>Por Faixa</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {belts.map(belt => (
                  <button 
                    key={belt}
                    onClick={() => setFilter(belt)}
                    style={{ 
                      padding: '8px', borderRadius: '6px', fontSize: '0.8rem',
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
        <h3>Lista de Destinatários</h3>
        <div className="table-container" style={{ marginTop: '16px', maxHeight: '400px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.phone}</td>
                  <td>
                    {sentIds.has(student.id) ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                        <CheckCircle size={14} /> Enviado
                      </span>
                    ) : (
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        background: student.status === 'pago' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: student.status === 'pago' ? '#10b981' : '#ef4444'
                      }}>
                        {student.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => sendSingle(student)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer' }}
                      title="Enviar Individual"
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
