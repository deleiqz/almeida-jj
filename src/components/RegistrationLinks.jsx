import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Share2, Clock, CheckCircle, User, Filter, Search } from 'lucide-react';

const RegistrationLinks = ({ user, isAdmin }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLinks();
  }, [user]);

  const fetchLinks = async () => {
    setLoading(true);
    
    // Fetch all links first (RLS restricts what employees vs admins can see)
    const { data: linksData, error: linksError } = await supabase
      .from('registration_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (linksError) {
      console.error("Erro ao carregar links:", linksError);
      setLoading(false);
      return;
    }

    let enrichedLinks = linksData || [];

    // If admin, fetch profiles to resolve sender names manually
    if (isAdmin && enrichedLinks.length > 0) {
      const senderIds = [...new Set(enrichedLinks.map(l => l.sender_id).filter(Boolean))];
      
      if (senderIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', senderIds);
          
        if (!profilesError && profilesData) {
          const profilesMap = {};
          profilesData.forEach(p => { profilesMap[p.id] = p.full_name; });
          
          enrichedLinks = enrichedLinks.map(link => ({
            ...link,
            profiles: { full_name: profilesMap[link.sender_id] || 'Desconhecido' }
          }));
        }
      }
    }

    setLinks(enrichedLinks);
    setLoading(false);
  };

  const filteredLinks = links.filter(link => 
    link.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.recipient_phone?.includes(searchTerm)
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div style={{ color: 'var(--accent-primary)', textAlign: 'center', padding: '50px' }}>Carregando histórico de links...</div>;
  }

  return (
    <div className="registration-links">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="title-gradient">Links de Cadastro Enviados</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar interessado..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '10px 12px 10px 40px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--card-border)', 
                borderRadius: '8px',
                color: 'white',
                minWidth: '250px'
              }} 
            />
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Interessado</th>
                <th>Contato</th>
                {isAdmin && <th>Enviado por</th>}
                <th>Status</th>
                <th>Finalizado em</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Nenhum link encontrado.
                  </td>
                </tr>
              ) : (
                filteredLinks.map(link => (
                  <tr key={link.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                        {formatDate(link.created_at)}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{link.recipient_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{link.recipient_phone || '-'}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} style={{ color: 'var(--accent-primary)' }} />
                          {link.profiles?.full_name || 'Sistema'}
                        </div>
                      </td>
                    )}
                    <td>
                      <span className={`badge badge-${link.status === 'finalizado' ? 'paid' : 'pending'}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                        {link.status === 'finalizado' ? <CheckCircle size={12} /> : <Share2 size={12} />}
                        {link.status === 'finalizado' ? 'Matrícula Concluída' : 'Link Enviado'}
                      </span>
                    </td>
                    <td>{formatDate(link.completed_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.1)' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          💡 <strong>Dica:</strong> Cada vez que um funcionário compartilha o link pela aba "Alunos", um novo registro é criado aqui. Quando o aluno finaliza o cadastro usando aquele link específico, o status muda automaticamente para verde.
        </p>
      </div>
    </div>
  );
};

export default RegistrationLinks;
