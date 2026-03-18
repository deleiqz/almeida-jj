import React, { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Settings, Dumbbell } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ExpenseList from './components/ExpenseList';
import Maintenance from './components/Maintenance';
import { useStore } from './hooks/useStore';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { students, expenses, addStudent, addExpense, getStats, loading } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'students', label: 'Alunos', icon: <Users size={20} /> },
    { id: 'expenses', label: 'Financeiro', icon: <CreditCard size={20} /> },
    { id: 'maintenance', label: 'Manutenção', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    if (loading) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
        Carregando dados do Almeida JJ...
      </div>
    );

    switch (activeTab) {
      case 'dashboard': return <Dashboard stats={getStats()} />;
      case 'students': return <StudentList students={students} addStudent={addStudent} />;
      case 'expenses': return <ExpenseList expenses={expenses} addExpense={addExpense} />;
      case 'maintenance': return <Maintenance />;
      default: return <Dashboard stats={getStats()} />;
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav className="glass" style={{ 
        width: '260px', 
        height: 'calc(100vh - 40px)', 
        margin: '20px', 
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 10px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell color="black" size={24} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>Almeida<span style={{ color: 'var(--accent-primary)' }}>JJ</span></h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: activeTab === item.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.95rem'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Logado como:</div>
          <div style={{ fontWeight: '600' }}>Admin Academia</div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ marginLeft: '300px', padding: '40px 40px 40px 0', flex: 1, maxWidth: '1200px' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
