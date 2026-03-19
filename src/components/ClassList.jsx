import React, { useState } from 'react';
import { Calendar, Plus, Clock, User } from 'lucide-react';
import Modal from './Modal';

const ClassList = ({ classes, addClass }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', time: '', instructor: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addClass(newClass);
    setModalOpen(false);
    setNewClass({ name: '', time: '', instructor: '' });
  };

  return (
    <div className="class-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Gestão de Turmas</h2>
        <button 
          className="btn-primary" 
          onClick={() => setModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Nova Turma
        </button>
      </div>

      <div className="dashboard-grid">
        {classes.map(c => (
          <div key={c.id} className="glass card-stat" style={{ textAlign: 'left', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ background: 'rgba(255,215,0,0.1)', padding: '10px', borderRadius: '12px' }}>
                <Calendar size={24} color="var(--accent-primary)" />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold', background: 'rgba(255,215,0,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                Ativa
              </span>
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{c.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <Clock size={16} /> {c.time}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <User size={16} /> {c.instructor || 'A definir'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal title="Cadastrar Nova Turma" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px' }}>Nome da Turma</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Jiu-Jitsu Kids"
              value={newClass.name}
              onChange={(e) => setNewClass({...newClass, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Horário</label>
              <input 
                required
                type="time" 
                value={newClass.time}
                onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Instrutor</label>
              <input 
                type="text" 
                placeholder="Nome do Prof."
                value={newClass.instructor}
                onChange={(e) => setNewClass({...newClass, instructor: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Confirmar Turma</button>
        </form>
      </Modal>
    </div>
  );
};

export default ClassList;
