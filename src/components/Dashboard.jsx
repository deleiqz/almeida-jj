import React from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = ({ stats }) => {
  const cardData = [
    { title: "Total Alunos", value: stats.totalStudents, icon: <Users size={24} />, color: "var(--accent-primary)" },
    { title: "Receita Mensal", value: `R$ ${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: "var(--accent-secondary)" },
    { title: "Despesas", value: `R$ ${stats.totalExpenses.toLocaleString()}`, icon: <DollarSign size={24} />, color: "var(--danger)" },
    { title: "Pendentes/Atenção", value: stats.pendingStudents, icon: <AlertCircle size={24} />, color: "var(--warning)" },
  ];

  return (
    <div className="dashboard-content">
      <h2 style={{ marginBottom: '24px', fontWeight: '600' }} className="title-gradient">Visão Geral</h2>
      <div className="dashboard-grid">
        {cardData.map((card, i) => (
          <div key={i} className="glass card-stat">
            <div style={{ color: card.color }}>{card.icon}</div>
            <h3>{card.title}</h3>
            <div className="value">{card.value}</div>
          </div>
        ))}
      </div>
      
      <div className="glass" style={{ padding: '24px', marginTop: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Saúde Financeira</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(stats.paidStudents / stats.totalStudents) * 100}%`, 
              height: '100%', 
              background: 'var(--accent-secondary)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
            }}></div>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {Math.round((stats.paidStudents / stats.totalStudents) * 100)}% dos alunos em dia
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
