import React, { useState } from 'react';
import { PlusCircle, FileText, Edit2, Trash2 } from 'lucide-react';
import Modal from './Modal';

const ExpenseList = ({ expenses, addExpense, updateExpense, deleteExpense }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newExpense, setNewExpense] = useState({ type: '', amount: '', dueDate: '', status: 'pendente' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateExpense(editingId, newExpense);
      } else {
        await addExpense(newExpense);
      }
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar despesa:", err);
      alert("Erro ao salvar despesa. Verifique os dados e tente novamente.");
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setNewExpense({ type: '', amount: '', dueDate: '', status: 'pendente' });
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditMode(true);
    setEditingId(expense.id);
    setNewExpense({ 
      type: expense.type, 
      amount: expense.amount, 
      dueDate: expense.dueDate, 
      status: expense.status 
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Você tem certeza que deseja excluir esta despesa?")) {
      deleteExpense(id);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="expense-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Contas e Despesas</h2>
        <button 
          className="btn-primary" 
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger)' }}
        >
          <PlusCircle size={18} /> Registrar Conta
        </button>
      </div>

      <div className="dashboard-grid">
        {expenses.map(expense => (
          <div key={expense.id} className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--accent-primary)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{expense.type}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${expense.status === 'pago' || expense.status === 'paga' ? 'paid' : 'pending'}`}>
                  {(expense.status || 'pendente').toUpperCase()}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => openEditModal(expense)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '4px' }} title="Editar">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(expense.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px' }}>R$ {Number(expense.amount).toLocaleString()}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Vencimento: {expense.dueDate}</div>
          </div>
        ))}
      </div>

      <Modal title={isEditMode ? "Editar Despesa" : "Registrar Nova Despesa"} isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tipo de Despesa (ex: Água, Internet)</label>
            <input 
              required
              type="text" 
              placeholder="ex: Conta de Luz"
              value={newExpense.type}
              onChange={(e) => setNewExpense({...newExpense, type: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Valor (R$)</label>
              <input 
                required
                type="number" 
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Status</label>
              <select 
                value={newExpense.status}
                onChange={(e) => setNewExpense({...newExpense, status: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Data de Vencimento</label>
            <input 
              required
              type="date" 
              value={newExpense.dueDate}
              onChange={(e) => setNewExpense({...newExpense, dueDate: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px', background: 'var(--danger)' }}>
            {isEditMode ? "Salvar Alterações" : "Registrar Conta"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ExpenseList;
