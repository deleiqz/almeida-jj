export const mockStudents = [
  { id: 1, name: "Lucas Silva", status: "pago", lastPayment: "2026-03-01", nextDue: "2026-04-01", amount: 120 },
  { id: 2, name: "Maria Oliveira", status: "pendente", lastPayment: "2026-02-15", nextDue: "2026-03-15", amount: 120 },
  { id: 3, name: "João Pereira", status: "vencido", lastPayment: "2026-01-10", nextDue: "2026-02-10", amount: 120 },
  { id: 4, name: "Ana Costa", status: "pago", lastPayment: "2026-03-05", nextDue: "2026-04-05", amount: 120 },
  { id: 5, name: "Pedro Santos", status: "pago", lastPayment: "2026-03-02", nextDue: "2026-04-02", amount: 120 },
  { id: 6, name: "Carla Souza", status: "pendente", lastPayment: "2026-02-20", nextDue: "2026-03-20", amount: 120 },
];

export const mockExpenses = [
  { id: 1, type: "Agua", amount: 450, status: "pago", dueDate: "2026-03-10" },
  { id: 2, type: "Luz", amount: 1200, status: "paga", dueDate: "2026-03-12" },
  { id: 3, type: "Internet", amount: 300, status: "pendente", dueDate: "2026-03-20" },
  { id: 4, type: "Aluguel", amount: 5000, status: "pago", dueDate: "2026-03-05" },
];

export const getStats = () => {
  const totalStudents = mockStudents.length;
  const paidStudents = mockStudents.filter(s => s.status === "pago").length;
  const pendingStudents = mockStudents.filter(s => s.status === "pendente" || s.status === "vencido").length;
  const totalRevenue = mockStudents.reduce((acc, s) => acc + s.amount, 0);
  const totalExpenses = mockExpenses.reduce((acc, e) => acc + e.amount, 0);
  
  return {
    totalStudents,
    paidStudents,
    pendingStudents,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
  };
};
