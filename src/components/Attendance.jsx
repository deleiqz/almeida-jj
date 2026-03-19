import React, { useState } from 'react';
import { Calendar, CheckCircle, Users } from 'lucide-react';

const Attendance = ({ students, classes, attendance, markAttendance }) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleMark = (studentId) => {
    if (selectedClassId) {
      markAttendance(studentId, selectedClassId);
    }
  };

  const isPresent = (studentId) => {
    return attendance.some(a => a.student_id === studentId && a.class_id === Number(selectedClassId) && a.date === date);
  };

  return (
    <div className="attendance-content">
      <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Chamada de Alunos</h2>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="var(--accent-primary)" /> Configuração
          </h3>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Selecione a Turma</label>
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}
            >
              <option value="">Selecione...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.time})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Data</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}
            />
          </div>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--accent-secondary)" /> Alunos
          </h3>
          
          {!selectedClassId ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Selecione uma turma para iniciar a chamada.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Presença</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>
                        {isPresent(student.id) ? (
                          <span style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <CheckCircle size={18} /> Presente
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleMark(student.id)}
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,215,0,0.1)', color: 'var(--accent-primary)' }}
                          >
                            Marcar Presença
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
