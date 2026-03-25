import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { studentContractAdult, studentContractMinor, responsibilityTerm } from '../lib/contractTemplates';
import logo from '../assets/logo.jpg';
import { Printer, Download, ArrowLeft } from 'lucide-react';

const ContractView = ({ studentId, onBack }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (data) setStudent(data);
      setLoading(false);
    };
    fetchStudent();
  }, [studentId]);

  if (loading) return <div className="loading">Carregando contrato...</div>;
  if (!student) return <div className="error">Aluno não encontrado.</div>;

  // Calculate age for template selection
  const dob = new Date(student.birth_date);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  
  const isMinor = age < 18;
  const template = isMinor ? studentContractMinor : studentContractAdult;

  // Simple template replacement
  const replacePlaceholders = (text, data) => {
    let result = text;
    const createdDate = new Date(data.created_at);
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const placeholders = {
      name: data.name,
      cpf: data.cpf,
      email: data.email || 'Não informado',
      birthDate: new Date(data.birth_date).toLocaleDateString('pt-BR'),
      address: data.address || 'Não informado',
      plan: data.plan,
      sub_plan: data.sub_plan?.toUpperCase() || 'EVOLUÇÃO',
      payment_value: data.payment_value,
      paymentMethod: (data.payment_method || 'Pix').toUpperCase(),
      parent_name: data.parent_name || 'N/A',
      parent_cpf: data.parent_cpf || 'N/A',
      parent_name_or_self: data.parent_name || data.name,
      parent_cpf_or_self: data.parent_cpf || data.cpf,
      phone: data.phone,
      image_auth: data.has_authorization ? "AUTORIZADO" : "NÃO AUTORIZADO",
      medicalInfo: data.medical_info || 'Nenhuma informada',
      dueDate: "24",
      day: createdDate.getDate(),
      month: months[createdDate.getMonth()]
    };

    Object.keys(placeholders).forEach(key => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(placeholders[key]));
    });
    return result;
  };

  const renderedContract = replacePlaceholders(template, student);
  const renderedResponsibility = replacePlaceholders(responsibilityTerm, student);

  return (
    <div className="contract-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#333', minHeight: '100vh', fontFamily: 'serif' }}>
      
      {/* Action Bar (Hidden on Print) */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <button onClick={onBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <button onClick={() => window.print()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', background: '#000' }}>
          <Printer size={18} /> Imprimir / PDF
        </button>
      </div>

      <div id="print-area">
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={logo} alt="Almeida JJ" style={{ width: '80px', height: '80px', borderRadius: '10px' }} />
          <h2 style={{ fontSize: '1.2rem', margin: '10px 0' }}>ALMEIDA JJ - Brazilian Jiu-Jitsu</h2>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>Av. Campanella, 1015 - São Paulo - SP</p>
        </div>

        {/* Contract Text */}
        <div className="contract-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {renderedContract}
          <div style={{ margin: '40px 0', borderTop: '1px solid #ddd' }}></div>
          {renderedResponsibility}
        </div>

        {/* Signature Section */}
        <div style={{ marginTop: '50px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Documento assinado digitalmente em: {new Date(student.created_at).toLocaleString('pt-BR')}</p>
          {student.document_url ? (
            <div style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '300px' }}>
              <img src={student.document_url} alt="Assinatura" style={{ maxHeight: '80px' }} />
            </div>
          ) : (
            <div style={{ height: '80px', borderBottom: '1px solid #000', minWidth: '300px', display: 'inline-block' }}></div>
          )}
          <p style={{ fontWeight: 'bold' }}>{student.name}</p>
          <p style={{ fontSize: '0.8rem' }}>{isMinor ? `Assinado por: ${student.parent_name} (Responsável)` : 'Assinatura do Aluno'}</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .contract-page { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default ContractView;
