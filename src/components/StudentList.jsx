import React, { useState } from 'react';
import { Search, Plus, Edit2, Share2, ClipboardCheck, Mail, MessageSquare, Phone, FileText } from 'lucide-react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';

const StudentList = ({ students, classes, enrollments, addStudent, updateStudent, deleteStudent, user }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({ 
    name: '', status: 'pago', nextDue: '', amount: 150, belt: 'Branca', phone: '', plan: 'Mensal', classId: '', paymentMethod: 'Pix' 
  });
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({ name: '', phone: '', email: '' });
  
  const getRegistrationLink = async () => {
    // Register the link in the database first
    const { data, error } = await supabase
      .from('registration_links')
      .insert([{
        sender_id: user?.id,
        recipient_name: shareData.name || 'Interessado',
        recipient_phone: shareData.phone,
        status: 'enviado'
      }])
      .select('id')
      .single();

    if (error) {
      console.error("Erro ao gerar convite:", error);
      return `https://almeida-jj.vercel.app/?registro`;
    }
    
    return `https://almeida-jj.vercel.app/?registro&ref=${data.id}`;
  };

  const copyRegistrationLink = async () => {
    const link = await getRegistrationLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (method) => {
    if (!shareData.phone && (method === 'whatsapp' || method === 'sms')) {
      alert("Por favor, informe o telefone do interessado.");
      return;
    }

    const registrationLink = await getRegistrationLink();
    const msg = `Olá${shareData.name ? ' ' + shareData.name : ''}! Segue o link para seu cadastro na Almeida JJ: ${registrationLink}`;
    let url = '';

    if (method === 'whatsapp') {
      const phone = shareData.phone.replace(/\D/g, '');
      url = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
    } else if (method === 'sms') {
      const phone = shareData.phone.replace(/\D/g, '');
      url = `sms:55${phone}?body=${encodeURIComponent(msg)}`;
    } else if (method === 'email') {
      url = `mailto:${shareData.email}?subject=Link de Cadastro Almeida JJ&body=${encodeURIComponent(msg)}`;
    }

    if (url) window.open(url, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateStudent(editingId, newStudent);
    } else {
      addStudent({ ...newStudent, lastPayment: new Date().toISOString().split('T')[0] });
    }
    closeModal();
  };

  const handleDeleteStudent = () => {
    if (window.confirm("Você tem certeza que deseja EXCLUIR permanentemente este aluno? Esta ação não pode ser desfeita.")) {
      deleteStudent(editingId);
      closeModal();
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setNewStudent({ name: '', status: 'pago', nextDue: '', amount: 150, belt: 'Branca', phone: '', plan: 'Mensal', classId: '', paymentMethod: 'Pix' });
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    const studentEnrollment = enrollments.find(e => e.student_id === student.id);
    setEditMode(true);
    setEditingId(student.id);
    setNewStudent({ 
      name: student.name, 
      status: student.status, 
      nextDue: student.nextDue, 
      amount: student.amount, 
      belt: student.belt, 
      phone: student.phone || '', 
      plan: student.plan || 'Mensal',
      paymentMethod: student.paymentMethod || 'Pix',
      classId: studentEnrollment?.class_id || ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const getStudentClass = (studentId) => {
    const enrollment = enrollments.find(e => e.student_id === studentId);
    if (!enrollment) return '-';
    return classes.find(c => c.id === enrollment.class_id)?.name || '-';
  };

  const getInstallments = (student) => {
    let total = 1;
    if (student.plan === 'Semestral') total = 6;
    if (student.plan === 'Trimestral') total = 3;
    if (student.plan === 'Anual') total = 12;

    if (total === 1 || !student.createdAt || !student.nextDue) return null;

    const start = new Date(student.createdAt);
    const due = new Date(student.nextDue);
    if (isNaN(start.getTime()) || isNaN(due.getTime())) return null;
    
    let paid = (due.getFullYear() - start.getFullYear()) * 12 + (due.getMonth() - start.getMonth());
    if (paid < 0) paid = 0;
    
    let currentCyclePaid = paid % total;
    if (paid > 0 && currentCyclePaid === 0 && due >= new Date()) {
      currentCyclePaid = total; 
    }

    return { total, paid: currentCyclePaid, open: total - currentCyclePaid };
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="student-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Gestão de Alunos</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShareModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: 'white' }}
          >
            <Share2 size={18} />
            Compartilhar Cadastro
          </button>
          <button className="btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Novo Aluno
          </button>
        </div>
      </div>

      <div className="glass" style={{ padding: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar aluno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 12px 12px 40px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px',
              color: 'white',
              outline: 'none'
            }} 
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Turma</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Vencimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{student.phone || '-'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{getStudentClass(student.id)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--accent-primary)', alignSelf: 'flex-start' }}>
                        {student.plan}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{student.paymentMethod}</span>
                      
                      {(() => {
                        const inst = getInstallments(student);
                        if (!inst) return null;
                        return (
                          <div style={{ marginTop: '4px', width: '120px' }}>
                            <div style={{ fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                              <span>{inst.paid} pagas</span>
                              <span>{inst.open} abertas</span>
                            </div>
                            <div style={{ display: 'flex', gap: '2px', height: '5px' }}>
                              {Array.from({ length: inst.total }).map((_, i) => (
                                <div key={i} style={{ flex: 1, backgroundColor: i < inst.paid ? '#10b981' : 'rgba(255,255,255,0.15)', borderRadius: '2px' }} />
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${student.status === 'pago' ? 'paid' : student.status === 'pendente' ? 'pending' : 'overdue'}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td>{student.nextDue}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => openEditModal(student)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '5px' }}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <a 
                        href={`${window.location.origin}/?contrato=${student.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}
                        title="Ver Contrato"
                      >
                        <FileText size={16} />
                      </a>
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}/?contrato=${student.id}`;
                          const msg = encodeURIComponent(`Olá ${student.name.split(' ')[0]}! Segue o link do seu contrato assinado na Almeida JJ: ${url}`);
                          window.open(`https://wa.me/${student.phone?.replace(/\D/g, '')}?text=${msg}`, '_blank');
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#25D366', cursor: 'pointer', padding: '5px' }}
                        title="Enviar Contrato via WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={isEditMode ? "Editar Aluno" : "Cadastrar Novo Aluno"} isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome Completo</label>
            <input 
              required
              type="text" 
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Telefone</label>
              <input 
                type="text" 
                placeholder="(11) 99999-9999"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Turma</label>
              <select 
                value={newStudent.classId}
                onChange={(e) => setNewStudent({...newStudent, classId: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="">Selecione a Turma</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.time})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Plano</label>
              <select 
                value={newStudent.plan}
                onChange={(e) => setNewStudent({...newStudent, plan: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="Mensal">Mensal</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Faixa</label>
              <select 
                value={newStudent.belt}
                onChange={(e) => setNewStudent({...newStudent, belt: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="Branca">Branca</option>
                <option value="Cinza">Cinza</option>
                <option value="Amarela">Amarela</option>
                <option value="Laranja">Laranja</option>
                <option value="Verde">Verde</option>
                <option value="Azul">Azul</option>
                <option value="Roxa">Roxa</option>
                <option value="Marrom">Marrom</option>
                <option value="Preta">Preta</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Valor (R$)</label>
              <input 
                type="number" 
                value={newStudent.amount}
                onChange={(e) => setNewStudent({...newStudent, amount: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Status</label>
              <select 
                value={newStudent.status}
                onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Próximo Vencimento</label>
              <input 
                required
                type="date" 
                value={newStudent.nextDue}
                onChange={(e) => setNewStudent({...newStudent, nextDue: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Forma de Pagamento</label>
              <select 
                value={newStudent.paymentMethod}
                onChange={(e) => setNewStudent({...newStudent, paymentMethod: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
              >
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              {isEditMode ? "Salvar Alterações" : "Confirmar Cadastro"}
            </button>
            {isEditMode && (
              <button 
                type="button" 
                onClick={handleDeleteStudent} 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', 
                  padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
                }}
              >
                Excluir
              </button>
            )}
          </div>
        </form>
      </Modal>

      <Modal title="Compartilhar Link de Cadastro" isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nome do Interessado</label>
            <input 
              type="text" 
              placeholder="Ex: Pedro Silva"
              value={shareData.name}
              onChange={(e) => setShareData({...shareData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>

          <div className="glass" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <code style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>almeida-jj.vercel.app/?registro</code>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>O link terá seu rastreamento automático.</span>
            </div>
            <button 
              onClick={copyRegistrationLink}
              style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : 'white', cursor: 'pointer' }}
            >
              {copied ? <ClipboardCheck size={20} /> : <Share2 size={20} />}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Telefone (Para WhatsApp ou SMS)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="(11) 99999-9999"
                value={shareData.phone}
                onChange={(e) => setShareData({...shareData, phone: e.target.value})}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
              <button 
                className="btn-primary" 
                onClick={() => handleShare('whatsapp')}
                style={{ background: '#25D366', borderColor: '#25D366', padding: '10px' }}
                title="Enviar por WhatsApp"
              >
                <MessageSquare size={20} />
              </button>
              <button 
                className="btn-primary" 
                onClick={() => handleShare('sms')}
                style={{ background: '#3b82f6', borderColor: '#3b82f6', padding: '10px' }}
                title="Enviar por SMS"
              >
                <Phone size={20} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>E-mail (Para envio por e-mail)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="aluno@email.com"
                value={shareData.email}
                onChange={(e) => setShareData({...shareData, email: e.target.value})}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
              <button 
                className="btn-primary" 
                onClick={() => handleShare('email')}
                style={{ background: '#ea4335', borderColor: '#ea4335', padding: '10px' }}
                title="Enviar por E-mail"
              >
                <Mail size={20} />
              </button>
            </div>
          </div>
      </Modal>
    </div>
  );
};

export default StudentList;
