import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import Modal from './Modal';

const StudentList = ({ students, addStudent }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', status: 'pago', nextDue: '', amount: 150, belt: 'Branca', phone: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addStudent({ ...newStudent, lastPayment: new Date().toISOString().split('T')[0] });
    setModalOpen(false);
    setNewStudent({ name: '', status: 'pago', nextDue: '', amount: 150, belt: 'Branca', phone: '' });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="student-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Gestão de Alunos</h2>
        <button 
          className="btn-primary" 
          onClick={() => setModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} /> Novo Aluno
        </button>
      </div>

      <div className="glass" style={{ padding: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar aluno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 12px 12px 40px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px',
              color: 'white',
              outline: 'none'
            }} 
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Próximo Venc.</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{student.phone || '-'}</td>
                  <td>
                    <span className={`badge badge-${student.status === 'pago' ? 'paid' : student.status === 'pendente' ? 'pending' : 'overdue'}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td>{student.nextDue}</td>
                  <td>R$ {student.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title="Cadastrar Novo Aluno" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome Completo</label>
            <input 
              required
              type="text" 
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Telefone / WhatsApp</label>
            <input 
              type="text" 
              placeholder="(11) 99999-9999"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Status</label>
              <select 
                value={newStudent.status}
                onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Faixa</label>
              <select 
                value={newStudent.belt}
                onChange={(e) => setNewStudent({...newStudent, belt: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
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
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Valor (R$)</label>
              <input 
                type="number" 
                value={newStudent.amount}
                onChange={(e) => setNewStudent({...newStudent, amount: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Próximo Vencimento</label>
              <input 
                required
                type="date" 
                value={newStudent.nextDue}
                onChange={(e) => setNewStudent({...newStudent, nextDue: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Confirmar Cadastro</button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentList;
