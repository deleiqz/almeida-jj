import { Users, DollarSign, TrendingUp, AlertCircle, Share2, ClipboardCheck, Calendar, Clock, AlertTriangle, Download, Database } from 'lucide-react';
import { useState } from 'react';

const Dashboard = ({ getStats, role, userEmail, students = [], expenses = [] }) => {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const stats = getStats(dateFilter);
  const normalizedRole = (role || '').toLowerCase().trim();
  const safeUserEmail = (userEmail || '').toLowerCase().trim();
  const isDevMaster = safeUserEmail === 'vaandias@gmail.com' || safeUserEmail.includes('vaandias');
  const isAdmin = normalizedRole.includes('admin') || normalizedRole.includes('master') || normalizedRole.includes('dono') || isDevMaster;

  const allCardData = [
    { title: "Total Alunos", value: stats.totalStudents, icon: <Users size={24} />, color: "var(--accent-primary)" },
    { title: "Receita Mensal", value: `R$ ${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: "var(--accent-secondary)", adminOnly: true },
    { title: "Despesas", value: `R$ ${stats.totalExpenses.toLocaleString()}`, icon: <DollarSign size={24} />, color: "var(--danger)", adminOnly: true },
    { title: "Pendentes/Atenção", value: stats.pendingStudents, icon: <AlertCircle size={24} />, color: "var(--warning)" },
  ];
  const cardData = allCardData.filter(c => !c.adminOnly || isAdmin);

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const isDueSoon = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return d >= today && d <= sevenDaysFromNow;
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return d < today;
  };

  const upcomingReceipts = students?.filter(s => s.status === 'pendente' && isDueSoon(s.nextDue)) || [];
  const overdueStudents = students?.filter(s => s.status === 'vencido' || (s.status === 'pendente' && isOverdue(s.nextDue))) || [];
  const upcomingExpenses = isAdmin ? (expenses?.filter(e => e.status !== 'pago' && isDueSoon(e.dueDate)) || []) : [];
  const overdueExpenses = isAdmin ? (expenses?.filter(e => e.status !== 'pago' && isOverdue(e.dueDate)) || []) : [];

  const exportToCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === 'students') {
      const headers = ["Nome", "Telefone", "Faixa", "Status", "Vencimento", "Valor", "Plano", "Metodo", "CPF", "Endereco", "Data Nasc"];
      csvContent += headers.join(",") + "\n";
      
      students.forEach(s => {
        const row = [
          s.name, s.phone, s.belt, s.status, s.nextDue, s.amount, 
          s.plan, s.paymentMethod, s.cpf, s.address, s.birthDate
        ].map(val => `"${val || ''}"`);
        csvContent += row.join(",") + "\n";
      });
    } else {
      const headers = ["Tipo", "Valor", "Vencimento", "Status"];
      csvContent += headers.join(",") + "\n";
      
      expenses.forEach(e => {
        const row = [e.type, e.amount, e.dueDate, e.status].map(val => `"${val || ''}"`);
        csvContent += row.join(",") + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `backup_${type}_almeidajj_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontWeight: '600', margin: 0 }} className="title-gradient">Visão Geral</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filtrar Dia:</span>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="glass" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(255,215,0,0.03)', border: '1px dashed var(--accent-primary)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--accent-primary)" /> Resumo do Dia: {new Date(dateFilter + 'T00:00:00').toLocaleDateString('pt-BR')}
           </h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="glass" style={{ padding: '15px', textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recebimentos</div>
                 <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>R$ {stats.receiptsOnDay?.toLocaleString() || 0}</div>
              </div>
              <div className="glass" style={{ padding: '15px', textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vencimentos (Alunos)</div>
                 <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.expiresOnDay || 0} alunos</div>
              </div>
              <div className="glass" style={{ padding: '15px', textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Contas a Pagar</div>
                 <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--danger)' }}>R$ {stats.expensesOnDay?.toLocaleString() || 0}</div>
              </div>
           </div>
        </div>
      )}
      <div className="dashboard-grid">
        {cardData.map((card, i) => (
          <div key={i} className="glass card-stat">
            <div style={{ color: card.color }}>{card.icon}</div>
            <h3>{card.title}</h3>
            <div className="value">{card.value}</div>
          </div>
        ))}
      </div>
      
      {isAdmin && (
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

          {stats.revenueByMethod && (
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
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        {/* Ações Pendentes (Vencidos) */}
        <div className="glass" style={{ padding: '20px', borderTop: '3px solid var(--danger)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <AlertTriangle size={20} /> Ações Pendentes
          </h3>
          {overdueStudents.length === 0 && overdueExpenses.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhuma pendência crítica.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {overdueStudents.map(s => (
                <div key={`s-${s.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{s.name} <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>(Aluno)</span></span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Venceu: {s.nextDue ? s.nextDue.split('-').reverse().join('/') : '-'}</span>
                </div>
              ))}
              {overdueExpenses.map(e => (
                <div key={`e-${e.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{e.type} <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>(Despesa)</span></span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--danger)', fontWeight: 'bold' }}>R$ {Number(e.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos Recebimentos */}
        {isAdmin && (
          <div className="glass" style={{ padding: '20px', borderTop: '3px solid #10b981' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
              <Clock size={20} /> Próximos Recebimentos (7 dias)
            </h3>
            {upcomingReceipts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum recebimento próximo.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {upcomingReceipts.map(s => (
                  <div key={`s-${s.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', color: 'white' }}>{s.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dia: {s.nextDue ? s.nextDue.split('-').reverse().join('/') : '-'}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>R$ {Number(s.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Próximas Contas */}
        {isAdmin && (
          <div className="glass" style={{ padding: '20px', borderTop: '3px solid var(--warning)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
              <Calendar size={20} /> Contas a Pagar (7 dias)
            </h3>
            {upcomingExpenses.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhuma conta próxima.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {upcomingExpenses.map(e => (
                  <div key={`e-${e.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', color: 'white' }}>{e.type}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vence: {e.dueDate ? e.dueDate.split('-').reverse().join('/') : '-'}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: 'bold' }}>R$ {Number(e.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {isDevMaster && (
        <div className="glass" style={{ padding: '24px', marginTop: '20px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Database size={20} color="var(--accent-primary)" /> Ferramentas de Backup (Somente Desenvolvedor)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Exporte os dados em formato CSV para backup manual ou controle externo.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => exportToCSV('students')}
              className="glass" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', cursor: 'pointer' }}
            >
              <Download size={18} /> Exportar Alunos (.CSV)
            </button>
            <button 
              onClick={() => exportToCSV('expenses')}
              className="glass" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', color: 'var(--danger)', border: '1px solid var(--danger)', cursor: 'pointer' }}
            >
              <Download size={18} /> Exportar Financeiro (.CSV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
