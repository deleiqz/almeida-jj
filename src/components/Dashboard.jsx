import { Users, DollarSign, TrendingUp, AlertCircle, Share2, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

const Dashboard = ({ stats, role }) => {
  const [copied, setCopied] = useState(false);

  const cardData = [
    { title: "Total Alunos", value: stats.totalStudents, icon: <Users size={24} />, color: "var(--accent-primary)" },
    { title: "Receita Mensal", value: ['admin', 'master'].includes(role) ? `R$ ${stats.totalRevenue.toLocaleString()}` : '***', icon: <TrendingUp size={24} />, color: "var(--accent-secondary)" },
    { title: "Despesas", value: ['admin', 'master'].includes(role) ? `R$ ${stats.totalExpenses.toLocaleString()}` : '***', icon: <DollarSign size={24} />, color: "var(--danger)" },
    { title: "Pendentes/Atenção", value: stats.pendingStudents, icon: <AlertCircle size={24} />, color: "var(--warning)" },
  ];

  const copyRegistrationLink = () => {
    const url = window.location.origin + window.location.pathname + '?registro';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontWeight: '600', margin: 0 }} className="title-gradient">Visão Geral</h2>
        <button 
          onClick={copyRegistrationLink}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem', background: copied ? 'var(--accent-secondary)' : '' }}
        >
          {copied ? <><ClipboardCheck size={18} /> Link Copiado!</> : <><Share2 size={18} /> Link de Cadastro (Zap)</>}
        </button>
      </div>
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${stats.totalStudents > 0 ? (stats.paidStudents / stats.totalStudents) * 100 : 0}%`, 
              height: '100%', 
              background: 'var(--accent-secondary)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
            }}></div>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {stats.totalStudents > 0 ? Math.round((stats.paidStudents / stats.totalStudents) * 100) : 0}% dos alunos em dia
          </span>
        </div>

        {['admin', 'master'].includes(role) && stats.revenueByMethod && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Recebimentos por Método</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {Object.entries(stats.revenueByMethod).map(([method, amount]) => (
                <div key={method} className="glass" style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{method}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>R$ {amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
