import React, { useState, useEffect } from 'react';
import { Wrench, Zap, BarChart, HardHat, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import Modal from './Modal';

const defaultTasks = [
  { id: 1, title: "Manutenção de Esteiras", desc: "Lubrificação e check de motor.", priority: "Alta" },
  { id: 2, title: "Ar Condicionado", desc: "Limpeza de filtros da sala de crossfit.", priority: "Média" },
];

const defaultOpps = [
  { id: 1, title: "Novas Anilhas", desc: "Repor estoque desgastado.", value: "R$ 2.000,00" },
  { id: 2, title: "Sistema de Som", desc: "Upgrade para Bluetooth 5.0.", value: "R$ 800,00" },
];

const Maintenance = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('ag_maintenance_tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [opportunities, setOpportunities] = useState(() => {
    const saved = localStorage.getItem('ag_maintenance_opps');
    return saved ? JSON.parse(saved) : defaultOpps;
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('task'); // 'task' or 'opp'
  const [isEdit, setIsEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priorityOrValue, setPriorityOrValue] = useState('');

  useEffect(() => {
    localStorage.setItem('ag_maintenance_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ag_maintenance_opps', JSON.stringify(opportunities));
  }, [opportunities]);

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setIsEdit(true);
      setCurrentItem(item);
      setTitle(item.title);
      setDesc(item.desc);
      setPriorityOrValue(type === 'task' ? item.priority : item.value);
    } else {
      setIsEdit(false);
      setCurrentItem(null);
      setTitle('');
      setDesc('');
      setPriorityOrValue(type === 'task' ? 'Média' : '');
    }
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: isEdit ? currentItem.id : Date.now(),
      title,
      desc,
      ...(modalType === 'task' ? { priority: priorityOrValue } : { value: priorityOrValue })
    };

    if (modalType === 'task') {
      if (isEdit) setTasks(tasks.map(t => t.id === currentItem.id ? newItem : t));
      else setTasks([...tasks, newItem]);
    } else {
      if (isEdit) setOpportunities(opportunities.map(o => o.id === currentItem.id ? newItem : o));
      else setOpportunities([...opportunities, newItem]);
    }
    setModalOpen(false);
  };

  const handleDelete = (type, id) => {
    if (window.confirm("Certeza que deseja excluir este item?")) {
      if (type === 'task') setTasks(tasks.filter(t => t.id !== id));
      else setOpportunities(opportunities.filter(o => o.id !== id));
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'Alta') return 'var(--danger)';
    if (priority === 'Média') return 'var(--warning)';
    return 'var(--accent-primary)';
  };

  return (
    <div className="maintenance-content">
      <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Manutenção & Investimentos</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* TAREFAS DE MANUTENÇÃO */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <HardHat color="var(--warning)" /> Manutenção Preventiva
            </h3>
            <button onClick={() => openModal('task')} style={{ background: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
              <PlusCircle size={20} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>Nenhuma tarefa registrada.</span>}
            {tasks.map((task) => (
              <div key={task.id} style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}`, paddingLeft: '16px', margin: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {task.title}
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${getPriorityColor(task.priority)}`, color: getPriorityColor(task.priority) }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{task.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <button onClick={() => openModal('task', task)} style={{ background: 'transparent', color: 'var(--accent-primary)', padding: '4px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete('task', task.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPORTUNIDADES */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <BarChart color="var(--accent-secondary)" /> Oportunidades de Melhoria
            </h3>
            <button onClick={() => openModal('opp')} style={{ background: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
              <PlusCircle size={20} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {opportunities.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>Nenhuma oportunidade registrada.</span>}
            {opportunities.map((opt) => (
              <div key={opt.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--accent-secondary)' }}>{opt.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{opt.desc}</div>
                  {opt.value && <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>Investimento: {opt.value}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <button onClick={() => openModal('opp', opt)} style={{ background: 'transparent', color: 'var(--accent-primary)', padding: '4px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete('opp', opt.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal title={isEdit ? `Editar ${modalType === 'task' ? 'Tarefa' : 'Oportunidade'}` : `Nova ${modalType === 'task' ? 'Tarefa' : 'Oportunidade'}`} isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Título</label>
            <input 
              required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Descrição</label>
            <textarea 
              required value={desc} onChange={(e) => setDesc(e.target.value)} rows="3"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', resize: 'vertical' }}
            />
          </div>
          
          {modalType === 'task' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Prioridade</label>
              <select 
                value={priorityOrValue} onChange={(e) => setPriorityOrValue(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Valor do Investimento (Opcional)</label>
              <input 
                type="text" placeholder="Ex: R$ 1.500,00" value={priorityOrValue} onChange={(e) => setPriorityOrValue(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            {isEdit ? "Salvar Alterações" : "Adicionar"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
