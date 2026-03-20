import React, { useState } from 'react';
import { Plus, Users, Clock } from 'lucide-react';
import Modal from './Modal';

const ClassList = ({ classes, enrollments, addClass }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', time: '', instructor: '', capacity: 20 });

  const handleSubmit = (e) => {
    e.preventDefault();
    addClass(newClass);
    setModalOpen(false);
    setNewClass({ name: '', time: '', instructor: '', capacity: 20 });
  };

  const getEnrollmentCount = (classId) => {
    return enrollments.filter(e => e.class_id === classId).length;
  };

  return (
    <div className="class-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Gestão de Turmas</h2>
        <button className="btn-primary" onClick={() => setModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Nova Turma
        </button>
      </div>

      <div className="dashboard-grid">
        {classes.map(c => {
          const count = getEnrollmentCount(c.id);
          const cap = c.capacity || 20;
          const percentage = (count / cap) * 100;
          
          return (
            <div key={c.id} className="card glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>{c.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Clock size={16} /> {c.time}
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Users size={16} /> 
                  <span style={{ fontSize: '0.9rem' }}>Instrutor: {c.instructor}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ocupação</span>
                  <span style={{ color: percentage >= 100 ? '#ff4d4d' : 'white', fontWeight: 'bold' }}>
                    {count} / {cap} alunos
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(percentage, 100)}%`, 
                    background: percentage >= 90 ? '#ff4d4d' : 'var(--accent-primary)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal title="Cadastrar Nova Turma" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome da Turma</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Jiu-Jitsu Iniciante"
              value={newClass.name}
              onChange={(e) => setNewClass({...newClass, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Horário</label>
              <input 
                required
                type="text" 
                placeholder="Ex: 19:00"
                value={newClass.time}
                onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Capacidade</label>
              <input 
                required
                type="number" 
                value={newClass.capacity}
                onChange={(e) => setNewClass({...newClass, capacity: Number(e.target.value)})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Instrutor</label>
            <input 
              required
              type="text" 
              value={newClass.instructor}
              onChange={(e) => setNewClass({...newClass, instructor: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Salvar Turma</button>
        </form>
      </Modal>
    </div>
  );
};

export default ClassList;
