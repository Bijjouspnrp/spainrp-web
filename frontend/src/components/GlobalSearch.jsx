import React, { useEffect, useRef, useState } from 'react';

const QUICK_LINKS = [
  { label: 'Inicio', href: '/#home' },
  { label: 'Características', href: '/#features' },
  { label: 'Staff', href: '/#staff' },
  { label: 'Discord', href: '/#discord' },
  { label: 'Apps RP', href: '/apps' },
  { label: 'Noticias', href: '/news' },
  { label: 'Marketplace', href: '/blackmarket' },
  { label: 'Bolsa', href: '/stockmarket' },
  { label: 'Minijuegos', href: '/apps/minijuegos' },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (cmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
    }
  }, [open]);

  const results = QUICK_LINKS.filter(l => l.label.toLowerCase().includes(query.trim().toLowerCase()));

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Búsqueda" ref={dialogRef}
      onClick={(e)=>{ if(e.target===dialogRef.current) setOpen(false); }}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:2000,display:'grid',placeItems:'center',padding:'1rem'}}>
      <div style={{width:'min(720px, 92vw)',background:'#111827',color:'#fff',border:'1px solid #374151',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,.35)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 14px',borderBottom:'1px solid #1f2937'}}>
          <input ref={inputRef} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar páginas, secciones, apps..."
            aria-label="Buscar" 
            style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:16}} />
          <span style={{color:'#9ca3af',fontSize:12,background:'#1f2937',border:'1px solid #374151',padding:'4px 6px',borderRadius:6}}>Esc</span>
        </div>
        <div style={{maxHeight:360,overflow:'auto'}}>
          {results.length === 0 ? (
            <div style={{padding:'16px',color:'#9ca3af'}}>Sin resultados</div>
          ) : (
            <ul style={{listStyle:'none',margin:0,padding:8}}>
              {results.map((r,i)=> (
                <li key={i}>
                  <a href={r.href}
                    onClick={()=>setOpen(false)}
                    style={{display:'flex',alignItems:'center',gap:12,padding:'10px 10px',borderRadius:8,color:'#e5e7eb',textDecoration:'none'}}
                    onKeyDown={(e)=>{ if(e.key==='Enter'){ setOpen(false);} }}
                  >
                    <span style={{width:8,height:8,borderRadius:999,background:'#7289da'}}></span>
                    <span>{r.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


