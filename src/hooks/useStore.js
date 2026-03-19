import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useStore = () => {
  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisplayData = async () => {
    setLoading(true);
    const { data: stds } = await supabase.from('students').select('*').order('name');
    const { data: exps } = await supabase.from('expenses').select('*').order('due_date');
    const { data: cls } = await supabase.from('classes').select('*').order('time');
    const { data: attn } = await supabase.from('attendance').select('*').order('date', { ascending: false });
    
    if (stds) setStudents(stds.map(s => ({
      ...s,
      nextDue: s.next_due,
      lastPayment: s.last_payment
    })));
    
    if (exps) setExpenses(exps.map(e => ({
      ...e,
      dueDate: e.due_date
    })));

    if (cls) setClasses(cls);
    if (attn) setAttendance(attn);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDisplayData();
  }, []);

  const addStudent = async (student) => {
    const { error } = await supabase.from('students').insert([
      { 
        name: student.name, 
        status: student.status, 
        next_due: student.nextDue, 
        amount: student.amount,
        belt: student.belt || 'Branca',
        last_payment: new Date().toISOString().split('T')[0]
      }
    ]);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const updateStudentBelt = async (id, belt) => {
    const { error } = await supabase.from('students').update({ belt }).eq('id', id);
    if (error) console.error(error);
    fetchDisplayData();
  };

  const addClass = async (newClass) => {
    const { error } = await supabase.from('classes').insert([newClass]);
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

  const getStats = () => {
    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.status === "pago").length;
    const pendingStudents = students.filter(s => s.status === "pendente" || s.status === "vencido").length;
    const totalRevenue = students.reduce((acc, s) => acc + Number(s.amount), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    
    return {
      totalStudents,
      paidStudents,
      pendingStudents,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses
    };
  };

  return { 
    students, expenses, classes, attendance, 
    addStudent, updateStudentBelt, addClass, markAttendance, addExpense, 
    getStats, loading 
  };
};
