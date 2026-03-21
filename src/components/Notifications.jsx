import React, { useState } from 'react';
import { Send, Users, CheckCircle, Search } from 'lucide-react';

const Notifications = ({ students }) => {
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    
    // In a real scenario, we'd use an API. 
    // Here we'll open WhatsApp for the FIRST selected student as a demo, 
    // or explain how to do bulk.
    // For full bulk without an API, we can generate a list of links.
    
    const confirmSend = window.confirm(`Deseja abrir o WhatsApp para ${filteredStudents.length} alunos?`);
    if (confirmSend) {
      filteredStudents.forEach((student, index) => {
        if (student.phone) {
          const phone = student.phone.replace(/\D/g, '');
          const url = `https://web.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`;
          // We can't open 100 tabs at once reliably. 
          // Usually we'd open them one by one or use a broadcast tool.
          setTimeout(() => {
            window.open(url, '_blank');
          }, index * 2000); // 2 second delay between tabs to avoid browser blocking
        }
      });
    }
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
            <button 
              onClick={handleSendAll}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
              <Send size={18} /> Enviar para Todos Selecionados
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '10px' }}>
            * Note: O navegador pode bloquear múltiplas abas. Recomendamos enviar em blocos pequenos.
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
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      background: student.status === 'pago' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: student.status === 'pago' ? '#10b981' : '#ef4444'
                    }}>
                      {student.status}
                    </span>
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
