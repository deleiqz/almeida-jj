import React, { useState } from 'react';
import { Check, Calendar } from 'lucide-react';

const Attendance = ({ students, classes, attendance, enrollments, markAttendance }) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const enrolledStudentIds = enrollments
    .filter(e => e.class_id === selectedClassId)
    .map(e => e.student_id);

  const studentsInClass = students.filter(s => enrolledStudentIds.includes(s.id));

  const isPresent = (studentId) => {
    return attendance.some(a => a.student_id === studentId && a.class_id === selectedClassId && a.date === date);
  };

  const handleMark = (studentId) => {
    if (!isPresent(studentId)) {
      markAttendance(studentId, selectedClassId);
    }
  };

  return (
    <div className="attendance">
      <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Chamada Diária</h2>

      <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Selecionar Turma</label>
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
            >
              <option value="">Selecione uma turma...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.time})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Data</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
        </div>
      </div>

      {selectedClassId ? (
        <div className="glass" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Alunos Matriculados ({studentsInClass.length})</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {classes.find(c => c.id === selectedClassId)?.name} - {date}
            </span>
          </div>
          
          {studentsInClass.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {studentsInClass.map(student => (
                <div 
                  key={student.id} 
                  className="glass" 
                  style={{ 
                    padding: '12px 20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderLeft: `4px solid ${isPresent(student.id) ? 'var(--accent-primary)' : 'transparent'}`
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>{student.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Faixa {student.belt}</div>
                  </div>
                  <button 
                    onClick={() => handleMark(student.id)}
                    disabled={isPresent(student.id)}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      border: 'none', 
                      background: isPresent(student.id) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                      color: isPresent(student.id) ? 'black' : 'var(--text-secondary)',
                      cursor: isPresent(student.id) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Check size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Nenhum aluno matriculado nesta turma ainda.
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px' }} className="glass">
          <Calendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ color: 'var(--text-secondary)' }}>Selecione uma turma para realizar a chamada.</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;
