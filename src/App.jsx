import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Settings, Dumbbell, CheckCircle, Send } from 'lucide-react';
import logo from './assets/logo.jpg';
import jjBg from './assets/jj-bg.png';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ExpenseList from './components/ExpenseList';
import Maintenance from './components/Maintenance';
import BeltControl from './components/BeltControl';
import Attendance from './components/Attendance';
import ClassList from './components/ClassList';
import Notifications from './components/Notifications';
import { useStore } from './hooks/useStore';
import Login from './components/Login';
import RegistrationForm from './components/RegistrationForm';
import { supabase } from './lib/supabase';
import { LogOut } from 'lucide-react';

const App = () => {
  const isPublicRegistration = window.location.search.includes('registro');
  
  // Persistence: initialize from localStorage
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'dashboard');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');

  // Persistence: save to localStorage on change
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
  }, [role]);

  useEffect(() => {
    if (userName) localStorage.setItem('userName', userName);
    else localStorage.removeItem('userName');
  }, [userName]);

  // Sync Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        // If we have a session but no role/name in localStorage, we can't easily get it here 
        // without another query, but since handleLogin sets them, they should be in localStorage.
      } else {
        handleLogout();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        handleLogout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const { 
    students, expenses, classes, attendance, enrollments,
    addStudent, updateStudent, enrollStudent, updateStudentBelt, addClass, markAttendance, addExpense, 
    getStats, getStudentAttendanceCount, loading 
  } = useStore();

  const handleLogin = (user, role, name) => {
    setUser(user);
    setRole(role);
    setUserName(name || '');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUserName('');
    localStorage.clear();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'students', label: 'Alunos', icon: <Users size={20} /> },
    { id: 'belts', label: 'Faixas', icon: <Dumbbell size={20} /> },
    { id: 'attendance', label: 'Chamada', icon: <CheckCircle size={20} /> },
    { id: 'classes', label: 'Turmas', icon: <LayoutDashboard size={20} /> },
    { id: 'notifications', label: 'Notificações', icon: <Send size={20} /> },
    { id: 'expenses', label: 'Financeiro', icon: <CreditCard size={20} />, restricted: true },
    { id: 'maintenance', label: 'Manutenção', icon: <Settings size={20} />, restricted: true },
  ];

  const normalizedRole = role?.toLowerCase();
  const filteredNavItems = navItems.filter(item => !item.restricted || ['admin', 'master'].includes(normalizedRole));

  const renderContent = () => {
    if (loading) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
        Carregando dados do Almeida JJ...
      </div>
    );

    switch (activeTab) {
      case 'dashboard': return <Dashboard stats={getStats()} role={normalizedRole} />;
      case 'students': return <StudentList students={students} classes={classes} enrollments={enrollments} addStudent={addStudent} updateStudent={updateStudent} />;
      case 'belts': return <BeltControl students={students} updateStudentBelt={updateStudentBelt} getStudentAttendanceCount={getStudentAttendanceCount} />;
      case 'attendance': return <Attendance students={students} classes={classes} attendance={attendance} enrollments={enrollments} markAttendance={markAttendance} />;
      case 'classes':        return <ClassList 
          classes={classes} 
          enrollments={enrollments} 
          addClass={addClass}
          updateClass={updateClass}
          deleteClass={deleteClass}
        />; 
      case 'notifications': return <Notifications students={students} />;
      case 'expenses': return ['admin', 'master'].includes(normalizedRole) ? <ExpenseList expenses={expenses} addExpense={addExpense} /> : <Dashboard stats={getStats()} role={normalizedRole} />;
      case 'maintenance': return ['admin', 'master'].includes(normalizedRole) ? <Maintenance /> : <Dashboard stats={getStats()} role={normalizedRole} />;
      default: return <Dashboard stats={getStats()} role={normalizedRole} />;
    }
  };

  if (isPublicRegistration) {
    return <RegistrationForm />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container" style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.85)), url(${jjBg})`,
      backgroundSize: '800px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
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
          <img src={logo} alt="Logo" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>Almeida<span style={{ color: 'var(--accent-primary)' }}>JJ</span></h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: activeTab === item.id ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
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

        <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Logado como:</div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '15px' }}>
            {userName || user.email} <br/>
            <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
              [{normalizedRole === 'master' ? 'Desenvolvedor Master' : normalizedRole === 'admin' ? 'Dono Master' : 'Funcionário'}]
            </span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              padding: '8px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Sair
          </button>
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
