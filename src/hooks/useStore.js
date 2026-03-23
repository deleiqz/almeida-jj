import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const BELT_THRESHOLDS = {
  'Branca': 30,
  'Cinza': 40,
  'Amarela': 50,
  'Laranja': 60,
  'Verde': 70,
  'Azul': 100,
  'Roxa': 150,
  'Marrom': 200,
  'Preta': 300
};

export const useStore = () => {
  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisplayData = async () => {
    setLoading(true);
    const { data: stds } = await supabase.from('students').select('*').order('name');
    const { data: exps } = await supabase.from('expenses').select('*').order('due_date');
    const { data: cls } = await supabase.from('classes').select('*').order('time');
    const { data: attn } = await supabase.from('attendance').select('*').order('date', { ascending: false });
    const { data: enrs } = await supabase.from('class_enrollments').select('*');
    
    if (stds) setStudents(stds.map(s => ({
      ...s,
      nextDue: s.next_due,
      lastPayment: s.last_payment,
      amount: s.payment_value,
      plan: s.plan || 'Mensal',
      paymentMethod: s.payment_method || 'Pix',
      birthDate: s.birth_date,
      address: s.address,
      cpf: s.cpf,
      rg: s.rg,
      parentName: s.parent_name,
      parentCpf: s.parent_cpf,
      documentUrl: s.document_url
    })));
    
    if (exps) setExpenses(exps.map(e => ({
      ...e,
      dueDate: e.due_date
    })));

    if (cls) setClasses(cls);
    if (attn) setAttendance(attn);
    if (enrs) setEnrollments(enrs);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDisplayData();
  }, []);

  const addStudent = async (student) => {
    const { classId, ...studentData } = student;
    const { data, error } = await supabase
      .from('students')
      .insert([{ 
        name: studentData.name, 
        belt: studentData.belt || 'Branca', 
        status: studentData.status, 
        next_due: studentData.nextDue, 
        payment_value: studentData.amount,
        phone: studentData.phone,
        plan: studentData.plan || 'Mensal',
        payment_method: studentData.paymentMethod || 'Pix',
        birth_date: studentData.birthDate,
        address: studentData.address,
        cpf: studentData.cpf,
        rg: studentData.rg,
        parent_name: studentData.parentName,
        parent_cpf: studentData.parentCpf,
        document_url: studentData.documentUrl,
        last_payment: new Date().toISOString().split('T')[0]
      }])
      .select();
    
    if (error) {
      console.error(error);
    } else if (data && data.length > 0 && classId) {
      await enrollStudent(data[0].id, classId);
    }
    fetchDisplayData();
  };

  const updateStudent = async (id, updates) => {
    const { classId, ...studentData } = updates;
    const { error } = await supabase
      .from('students')
      .update({ 
        name: studentData.name, 
        belt: studentData.belt, 
        status: studentData.status, 
        next_due: studentData.nextDue, 
        payment_value: studentData.amount,
        phone: studentData.phone,
        plan: studentData.plan,
        payment_method: studentData.paymentMethod,
        birth_date: studentData.birthDate,
        address: studentData.address,
        cpf: studentData.cpf,
        rg: studentData.rg,
        parent_name: studentData.parentName,
        parent_cpf: studentData.parentCpf,
        document_url: studentData.documentUrl
      })
      .eq('id', id);
    
    if (error) console.error(error);
    
    if (classId) {
      await enrollStudent(id, classId);
    }
    fetchDisplayData();
  };

  const deleteStudent = async (id) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) fetchDisplayData();
    else console.error("Error deleting student:", error);
  };

  const enrollStudent = async (studentId, classId) => {
    if (!classId) return;
    
    // Check limit
    const classEnrollments = enrollments.filter(e => e.class_id === classId);
    const targetClass = classes.find(c => c.id === classId);
    const limit = targetClass?.capacity || 20;
    
    if (classEnrollments.length >= limit) {
      const isAlreadyEnrolled = classEnrollments.some(e => e.student_id === studentId);
      if (!isAlreadyEnrolled) {
        alert(`Limite de ${limit} alunos atingido para esta turma!`);
        return;
      }
    }

    // Replace enrollment (one class per student)
    await supabase.from('class_enrollments').delete().eq('student_id', studentId);
    const { error } = await supabase.from('class_enrollments').insert({ student_id: studentId, class_id: classId });
    if (error) console.error(error);
  };

  const updateStudentBelt = async (id, belt) => {
    const { error } = await supabase
      .from('students')
      .update({ 
        belt, 
        belt_promotion_date: new Date().toISOString().split('T')[0] 
      })
      .eq('id', id);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const addClass = async (claseData) => {
    const { error } = await supabase.from('classes').insert([claseData]);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const updateClass = async (id, updates) => {
    const { error } = await supabase.from('classes').update(updates).eq('id', id);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const deleteClass = async (id) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const markAttendance = async (studentId, classId) => {
    const { error } = await supabase.from('attendance').insert([
      { student_id: studentId, class_id: classId, date: new Date().toISOString().split('T')[0] }
    ]);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const removeAttendance = async (studentId) => {
    // Find the most recent attendance for this student
    const { data: lastAttn } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastAttn && lastAttn.length > 0) {
      const { error } = await supabase.from('attendance').delete().eq('id', lastAttn[0].id);
      if (error) console.error(error);
      fetchDisplayData();
    }
  };

  const getStudentAttendanceCount = (studentId, belt) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 0;
    
    // If we had a belt_promotion_date, we'd filter attendance by that date.
    // For now, we'll assume either the student's belt is the one they started with,
    // or we'll need that field. I'll add logic to filter by student.belt_promotion_date if it exists.
    const promotionDate = student.belt_promotion_date || student.created_at || '1970-01-01';
    
    return attendance.filter(a => 
      a.student_id === studentId && 
      new Date(a.date) >= new Date(promotionDate)
    ).length;
  };

  const addExpense = async (expense) => {
    const { error } = await supabase.from('expenses').insert([
      { 
        type: expense.type, 
        amount: expense.amount, 
        due_date: expense.dueDate, 
        status: expense.status 
      }
    ]);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const getStats = (selectedDate) => {
    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.status === "pago").length;
    const pendingStudents = students.filter(s => s.status === "pendente" || s.status === "vencido").length;
    
    // If selectedDate is provided, filter students who expired or were paid on that day
    // This is a bit subjective, but we'll show "Recebimentos do Dia" and "Vencimentos do Dia"
    const formattedDate = selectedDate || new Date().toISOString().split('T')[0];
    
    const receiptsOnDay = students
      .filter(s => s.last_payment === formattedDate)
      .reduce((sum, s) => sum + Number(s.amount), 0);
      
    const expiresOnDay = students.filter(s => s.nextDue === formattedDate).length;

    // Revenue by method
    const revenueByMethod = students.reduce((acc, s) => {
      if (s.status === "pago") {
        const method = s.paymentMethod || 'Pix';
        acc[method] = (acc[method] || 0) + Number(s.amount);
      }
      return acc;
    }, {});

    const totalRevenue = Object.values(revenueByMethod).reduce((sum, val) => sum + val, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    
    const expensesOnDay = expenses
      .filter(e => e.due_date === formattedDate)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      totalStudents,
      paidStudents,
      pendingStudents,
      totalRevenue,
      totalExpenses,
      revenueByMethod,
      netProfit: totalRevenue - totalExpenses,
      receiptsOnDay,
      expiresOnDay,
      expensesOnDay
    };
  };

  return { 
    students, expenses, classes, attendance, enrollments,
    addStudent, updateStudent, deleteStudent, enrollStudent, updateStudentBelt, addClass, updateClass, deleteClass, markAttendance, removeAttendance, addExpense, 
    getStats, getStudentAttendanceCount, loading 
  };
};
