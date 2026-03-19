import React, { useState } from 'react';
import { Award, Save } from 'lucide-react';

const BeltControl = ({ students, updateStudentBelt }) => {
  const belts = [
    { name: 'Branca', color: '#ffffff' },
    { name: 'Cinza', color: '#808080' },
    { name: 'Amarela', color: '#ffff00' },
    { name: 'Laranja', color: '#ffa500' },
    { name: 'Verde', color: '#008000' },
    { name: 'Azul', color: '#0000ff' },
    { name: 'Roxa', color: '#800080' },
    { name: 'Marrom', color: '#8b4513' },
    { name: 'Preta', color: '#000000' }
  ];

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newBelt, setNewBelt] = useState('');

  const handleUpdate = () => {
    if (selectedStudent && newBelt) {
      updateStudentBelt(selectedStudent.id, newBelt);
      setSelectedStudent(null);
      setNewBelt('');
    }
  };

  return (
    <div className="belt-control">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Controle de Faixas</h2>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <h3>Lista de Alunos</h3>
          <div className="table-container" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Faixa Atual</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${belts.find(b => b.name === student.belt)?.color || '#fff'}`
                      }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: belts.find(b => b.name === student.belt)?.color || '#fff' }}></div>
                        {student.belt}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => { setSelectedStudent(student); setNewBelt(student.belt); }}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Trocar Faixa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {selectedStudent ? (
            <div className="glass" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
              <h3 style={{ marginBottom: '20px' }}>Atualizar: {selectedStudent.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Selecione a Nova Faixa</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    {belts.map(belt => (
                      <button
                        key={belt.name}
                        onClick={() => setNewBelt(belt.name)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: `2px solid ${newBelt === belt.name ? 'var(--accent-primary)' : 'transparent'}`,
                          background: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: belt.color }}></div>
                        {belt.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleUpdate}
                  className="btn-primary" 
                  style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Save size={18} /> Salvar Alteração
                </button>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="glass" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Award size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
              <p>Selecione um aluno para gerenciar sua graduação.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeltControl;
