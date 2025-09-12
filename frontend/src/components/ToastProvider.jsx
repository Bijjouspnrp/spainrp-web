import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastCtx = createContext({ notify: (msg, opts) => {} });

export function useToast() { return useContext(ToastCtx); }

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => setToasts(ts => ts.filter(t => t.id !== id)), []);
  const notify = useCallback((message, { type = 'info', duration = 3000, role = 'status' } = {}) => {
    const id = ++idRef.current;
    setToasts(ts => [...ts, { id, message, type, role }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = useMemo(()=>({ notify }), [notify]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" role="region" aria-label="Notificaciones"
        style={{position:'fixed',right:16,bottom:16,display:'flex',flexDirection:'column',gap:8,zIndex:3000}}>
        {toasts.map(t => (
          <div key={t.id} role={t.role} style={{
            background:t.type==='error'?'#7f1d1d':t.type==='success'?'#065f46':'#111827',
            color:'#fff',border:'1px solid rgba(255,255,255,.1)',borderLeft:`4px solid ${t.type==='error'?'#ef4444':t.type==='success'?'#22c55e':'#7289da'}`,
            borderRadius:8,padding:'10px 12px',boxShadow:'0 10px 24px rgba(0,0,0,.25)',minWidth:260
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
              <span>{t.message}</span>
              <button onClick={()=>remove(t.id)} aria-label="Cerrar notificación" style={{background:'transparent',border:'none',color:'#fff',cursor:'pointer'}}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}


