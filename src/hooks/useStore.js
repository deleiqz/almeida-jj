import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useStore = () => {
  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisplayData = async () => {
    setLoading(true);
    const { data: stds } = await supabase.from('students').select('*').order('name');
    const { data: exps } = await supabase.from('expenses').select('*').order('due_date');
    
    if (stds) setStudents(stds.map(s => ({
      ...s,
      nextDue: s.next_due,
      lastPayment: s.last_payment
    })));
    
    if (exps) setExpenses(exps.map(e => ({
      ...e,
      dueDate: e.due_date
    })));
    
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
        last_payment: new Date().toISOString().split('T')[0]
      }
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

  return { students, expenses, addStudent, addExpense, getStats, loading };
};
