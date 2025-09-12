
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, isStaff as isStaffFn } from '../utils/supabaseClient';

const container = {
  minHeight: '60vh',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  color: 'white',
  padding: '2rem 1rem'
};
const card = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '1rem'
};
const input = {
  width: '100%',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  padding: '0.6rem 0.8rem',
  borderRadius: 8
};
const buttonPrimary = {
  background: '#7289da',
  border: 'none',
  color: '#fff',
  padding: '0.6rem 1rem',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600
};
const buttonGhost = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.25)',
  color: '#fff',
  padding: '0.5rem 0.9rem',
  borderRadius: 8,
  cursor: 'pointer'
};

const Support = () => {
  const [user, setUser] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 1. Obtener usuario actual y rol
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const staff = isStaffFn(user);
      setIsStaff(staff);
      if (user) {
        console.log('[Support] Usuario:', user.email || user.id, 'Rol:', user.user_metadata?.role || user.app_metadata?.role, '¿Staff?', staff);
      } else {
        console.log('[Support] No hay usuario logueado');
      }
    };
    getUser();
  }, []);

  // 2. Cargar tickets (del usuario o todos si es staff)
  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    if (!user) {
      setTickets([]);
      setLoadingTickets(false);
      return;
    }
    let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
    if (!isStaff) query = query.eq('user_id', user.id);
    const { data, error } = await query;
    if (error) {
      console.error('[Support] Error cargando tickets:', error);
    } else {
      setTickets(data);
    }
    setLoadingTickets(false);
  }, [user, isStaff]);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user, isStaff, fetchTickets]);

  // 3. Suscripción en tiempo real a tickets
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, payload => {
        fetchTickets();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchTickets]);

  // 4. Cargar mensajes del ticket activo
  const fetchMessages = useCallback(async (ticketId) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('[Support] Error cargando mensajes:', error);
    } else {
      setMessages(data);
    }
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (activeTicketId) fetchMessages(activeTicketId);
    else setMessages([]);
  }, [activeTicketId, fetchMessages]);

  // 5. Suscripción en tiempo real a mensajes
  useEffect(() => {
    if (!activeTicketId) return;
    const channel = supabase
      .channel('messages-changes-' + activeTicketId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${activeTicketId}` }, payload => {
        fetchMessages(activeTicketId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTicketId, fetchMessages]);

  // 6. Crear ticket
  const createTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !user) return;
    const { data, error } = await supabase.from('tickets').insert([
      {
        user_id: user.id,
        subject: subject.trim(),
        category,
        status: 'open'
      }
    ]).select();
    if (error) {
      console.error('[Support] Error creando ticket:', error);
      return;
    }
    if (data && data[0]) {
      setSubject('');
      setCategory('general');
      setMessage('');
      setActiveTicketId(data[0].id);
      // Primer mensaje
      const { error: msgError } = await supabase.from('ticket_messages').insert([
        {
          ticket_id: data[0].id,
          sender_id: user.id,
          sender_role: isStaffFn(user) ? 'staff' : 'user',
          text: message.trim()
        }
      ]);
      if (msgError) console.error('[Support] Error creando primer mensaje:', msgError);
    }
  };

  // 7. Enviar respuesta
  const addReply = async () => {
    if (!reply.trim() || !activeTicketId || !user) return;
    const { error } = await supabase.from('ticket_messages').insert([
      {
        ticket_id: activeTicketId,
        sender_id: user.id,
        sender_role: isStaffFn(user) ? 'staff' : 'user',
        text: reply.trim()
      }
    ]);
    if (error) {
      console.error('[Support] Error enviando mensaje:', error);
    }
    setReply('');
  };

  // 8. Cerrar ticket
  const closeTicket = async (id) => {
    const { error } = await supabase.from('tickets').update({ status: 'closed' }).eq('id', id);
    if (error) console.error('[Support] Error cerrando ticket:', error);
  };

  // 9. Reabrir ticket
  const reopenTicket = async (id) => {
    const { error } = await supabase.from('tickets').update({ status: 'open' }).eq('id', id);
    if (error) console.error('[Support] Error reabriendo ticket:', error);
  };

  const activeTicket = useMemo(() => tickets.find(t => t.id === activeTicketId) || null, [tickets, activeTicketId]);

  return (
    <div style={container}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Soporte y Tickets</h1>
        <p style={{ opacity: 0.85, marginBottom: '1.25rem' }}>
          Contacta con el equipo de administración. Crea un ticket y gestiona la conversación desde aquí.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
          <div style={card}>
            <h2 style={{ marginTop: 0 }}>Crear nuevo ticket</h2>
            <form onSubmit={createTicket} style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Asunto</label>
                <input style={input} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Breve resumen" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Categoría</label>
                <select style={input} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="general">General</option>
                  <option value="sanciones">Sanciones</option>
                  <option value="roles">Roles</option>
                  <option value="tecnico">Técnico</option>
                  <option value="erlc">ERLC</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Mensaje</label>
                <textarea style={{ ...input, minHeight: 120, resize: 'vertical' }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe tu problema o consulta" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" style={buttonGhost} onClick={() => { setSubject(''); setCategory('general'); setMessage(''); }}>Limpiar</button>
                <button type="submit" style={buttonPrimary}>Crear ticket</button>
              </div>
            </form>
          </div>

          <div style={card}>
            <h2 style={{ marginTop: 0 }}>{isStaff ? 'Todos los tickets' : 'Tus tickets'}</h2>
            {loadingTickets ? (
              <div style={{ opacity: 0.8 }}>Cargando tickets...</div>
            ) : tickets.length === 0 ? (
              <div style={{ opacity: 0.8 }}>Aún no hay tickets.</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem', maxHeight: 380, overflow: 'auto' }}>
                {tickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    style={{
                      textAlign: 'left',
                      background: activeTicketId === t.id ? 'rgba(114,137,218,0.18)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{t.subject}</strong>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>{t.status === 'open' ? 'Abierto' : 'Cerrado'}</span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>#{t.id} · {t.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...card, marginTop: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>Conversación</h2>
          {!activeTicket ? (
            <div style={{ opacity: 0.8 }}>Selecciona un ticket para ver y enviar mensajes.</div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <strong>{activeTicket.subject}</strong>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Estado: {activeTicket.status === 'open' ? 'Abierto' : 'Cerrado'} · Categoría: {activeTicket.category}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {activeTicket.status === 'open' ? (
                    <button style={buttonGhost} onClick={() => closeTicket(activeTicket.id)}>Cerrar ticket</button>
                  ) : (
                    <button style={buttonGhost} onClick={() => reopenTicket(activeTicket.id)}>Reabrir</button>
                  )}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '0.75rem',
                maxHeight: 350,
                overflow: 'auto'
              }}>
                {loadingMessages ? (
                  <div style={{ opacity: 0.8 }}>Cargando mensajes...</div>
                ) : messages.length === 0 ? (
                  <div style={{ opacity: 0.8 }}>No hay mensajes en este ticket.</div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} style={{
                      display: 'flex',
                      justifyContent: m.sender_role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        background: m.sender_role === 'user' ? 'rgba(114,137,218,0.3)' : 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '0.5rem 0.7rem',
                        borderRadius: 8,
                        maxWidth: '70%'
                      }}>
                        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>{m.sender_role === 'user' ? 'Tú' : 'Admin'}</div>
                        <div>{m.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: '0.5rem' }}>
                <input
                  style={{ ...input, flex: 1 }}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={activeTicket.status === 'open' ? 'Escribe tu mensaje' : 'Ticket cerrado'}
                  disabled={activeTicket.status !== 'open'}
                />
                <button style={buttonPrimary} onClick={addReply} disabled={activeTicket.status !== 'open'}>Enviar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;


