import { apiUrl } from '../utils/api';
import React, { useEffect, useState } from 'react';

const AdvancedLogs = () => {
  const [accessLog, setAccessLog] = useState('');
  const [errorLog, setErrorLog] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrl('/logs'), { credentials: 'include' });
        if (res.status === 401) {
          setError('No autenticado. Inicia sesión como admin.');
          setLoading(false);
          return;
        }
        if (res.status === 403) {
          setError('No tienes permisos para ver estos logs.');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError('Error al cargar los logs.');
          setLoading(false);
          return;
        }
        const html = await res.text();
        // Extraer logs del HTML (simple, para demo)
        const accessMatch = html.match(/<h2>Access Log<\/h2><pre>([\s\S]*?)<\/pre>/);
        const errorMatch = html.match(/<h2>Error Log<\/h2><pre>([\s\S]*?)<\/pre>/);
        setAccessLog(accessMatch ? accessMatch[1] : 'Sin registros.');
        setErrorLog(errorMatch ? errorMatch[1] : 'Sin errores.');
      } catch (e) {
        setError('Error de red o servidor.');
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'#181818',color:'#fff',fontFamily:'monospace',padding:'2rem'}}>
      <h1 style={{color:'#FFD700',fontWeight:800,fontSize:'2rem',marginBottom:'1.5rem'}}>Logs avanzados del sistema</h1>
      {loading ? (
        <div style={{color:'#FFD700'}}>Cargando logs...</div>
      ) : error ? (
        <div style={{color:'#ef4444',fontWeight:700}}>{error}</div>
      ) : (
        <>
          <h2 style={{color:'#FFD700'}}>Access Log</h2>
          <pre style={{background:'#23272a',padding:'1rem',borderRadius:8,maxHeight:300,overflow:'auto'}}>{accessLog}</pre>
          <h2 style={{color:'#FFD700'}}>Error Log</h2>
          <pre style={{background:'#23272a',padding:'1rem',borderRadius:8,maxHeight:300,overflow:'auto'}}>{errorLog}</pre>
        </>
      )}
    </div>
  );
};

export default AdvancedLogs;
