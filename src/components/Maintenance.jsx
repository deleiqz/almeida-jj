import React from 'react';
import { Wrench, Zap, BarChart, HardHat } from 'lucide-react';

const Maintenance = () => {
  const tasks = [
    { title: "Manutenção de Esteiras", desc: "Lubrificação e check de motor necessário até dia 25/03.", priority: "Alta", icon: <Wrench /> },
    { title: "Ar Condicionado", desc: "Limpeza de filtros da sala de crossfit.", priority: "Média", icon: <Zap /> },
    { title: "Iluminação LED", desc: "Trocar 4 lâmpadas queimadas no fundo.", priority: "Baixa", icon: <Zap /> },
  ];

  const opportunities = [
    { title: "Novas Anilhas", desc: "Investimento sugerido: R$ 2.000 para repor estoque desgastado.", roi: "Alto" },
    { title: "Sistema de Som", desc: "Upgrade para Bluetooth 5.0 melhora experiência do aluno.", roi: "Médio" },
  ];

  return (
    <div className="maintenance-content">
      <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Manutenção & Investimentos</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <HardHat color="var(--warning)" /> Manutenção Preventiva
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.map((task, i) => (
              <div key={i} style={{ borderLeft: `4px solid ${task.priority === 'Alta' ? 'var(--danger)' : 'var(--accent-primary)'}`, paddingLeft: '16px', margin: '8px 0' }}>
                <div style={{ fontWeight: '600' }}>{task.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{task.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart color="var(--accent-secondary)" /> Oportunidades de Melhoria
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {opportunities.map((opt, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                <div style={{ fontWeight: '600', color: 'var(--accent-secondary)' }}>{opt.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
