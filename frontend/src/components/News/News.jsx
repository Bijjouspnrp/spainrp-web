import { apiUrl } from '../../utils/api';
import React, { useState, useRef } from "react";
import DiscordUserBar from '../DiscordUserBar';
const EMOJIS = ['👍','❤️','😂','😮','😢','👎'];
// Helper para verificar permisos de edición/eliminación
async function canDeleteNews(userId) {
  try {
    const resp = await fetch(apiUrl(`/api/discord/candeletenews/${userId}`));
    if (!resp.ok) return false;
    const data = await resp.json();
    return !!data.canDelete;
  } catch {
    return false;
  }
}
async function canEditNews(userId) {
  try {
    const resp = await fetch(apiUrl(`/api/discord/canpostnews/${userId}`));
    if (!resp.ok) return false;
    const data = await resp.json();
    return !!data.canPost;
  } catch {
    return false;
  }
}

const News = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // array de archivos o urls
  const [imagePreviews, setImagePreviews] = useState([]);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [companyLogo, setCompanyLogo] = useState(""); // base64 o File
  const [companyLogoPreview, setCompanyLogoPreview] = useState("");
  const [tags, setTags] = useState([]); // array de etiquetas/emojis
  const [selectedNews, setSelectedNews] = useState(null); // para modal
  const [canDelete, setCanDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(null);
  const [reactions, setReactions] = useState({}); // {newsId: {emoji: count}}
  const [userReactions, setUserReactions] = useState({}); // {newsId: {emoji: true}}
  const [commentInput, setCommentInput] = useState("");
  const [commentsMap, setCommentsMap] = useState({}); // {newsId: [comments]}
  const [lastCommentTs, setLastCommentTs] = useState({}); // {newsId: timestamp}

  // Actualizar comentarios y reacciones cada 5s
  React.useEffect(() => {
    const interval = setInterval(() => {
      filteredNews.forEach(n => {
        // Comentarios
        fetch(apiUrl(`/api/announcements/${n.id}/comments`))
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && Array.isArray(data.comments)) {
              setCommentsMap(prev => ({ ...prev, [n.id]: data.comments }));
              const last = data.comments.filter(c => c.userId === user?.id).pop();
              if (last) setLastCommentTs(prev => ({ ...prev, [n.id]: new Date(last.createdAt).getTime() }));
            }
          });
        // Reacciones
        fetch(apiUrl(`/api/announcements/${n.id}/reactions`))
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && Array.isArray(data.reactions)) {
              setReactions(prev => ({
                ...prev,
                [n.id]: Object.fromEntries(data.reactions.map(r => [r.emoji, r.count]))
              }));
              if (user?.id) {
                setUserReactions(prev => ({
                  ...prev,
                  [n.id]: Object.fromEntries(data.reactions.filter(r => r.userId === user.id).map(r => [r.emoji, true]))
                }));
              }
            }
          });
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredNews, user]);
  React.useEffect(() => {
    if (selectedNews && user) {
      (async () => {
        setCanDelete(false);
        setCanEdit(false);
        if (selectedNews.authorId === user.id) setCanEdit(true);
        else setCanEdit(await canEditNews(user.id));
        setCanDelete(await canDeleteNews(user.id));
      })();
    }
  }, [selectedNews, user]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const fileInputRef = useRef();

  React.useEffect(() => {
    const token = localStorage.getItem('spainrp_token');
    const headers = token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
    fetch(apiUrl('/auth/me'), { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Cargar noticias en vivo del backend
  React.useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true);
        const resp = await fetch(apiUrl('/api/announcements'));
        
        // Verificar si la respuesta es HTML (error)
        const contentType = resp.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('[News] Respuesta no es JSON:', contentType);
          throw new Error('El servidor devolvió HTML en lugar de JSON');
        }
        
        if (!resp.ok) {
          throw new Error(`Error HTTP: ${resp.status}`);
        }
        
        const data = await resp.json();
        if (data && Array.isArray(data.announcements)) {
          setNews(data.announcements.reverse());
          setFilteredNews(data.announcements.reverse());
        } else {
          console.warn('[News] Formato de datos inesperado:', data);
          setNews([]);
          setFilteredNews([]);
        }
      } catch (e) {
        console.error('[News] Error cargando noticias:', e);
        setMsg({ type: 'error', text: 'Error al cargar noticias: ' + e.message });
        setNews([]);
        setFilteredNews([]);
      } finally {
        setNewsLoading(false);
      }
    };
    
    loadNews();
  }, []);
  // Buscador y filtros
  React.useEffect(() => {
    let filtered = [...news];
    if (search.trim()) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.body || "").toLowerCase().includes(search.toLowerCase()) ||
        (n.authorName || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterTag) {
      filtered = filtered.filter(n => Array.isArray(n.tags) && n.tags.includes(filterTag));
    }
    setFilteredNews(filtered);
  }, [search, filterTag, news]);


  // Al enviar reacción, solo actualizar desde backend
  const handleReaction = async (newsId, emoji) => {
    if (userReactions[newsId]?.[emoji]) return;
    const resp = await fetch(apiUrl(`/api/announcements/${newsId}/reactions`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, emoji })
    });
    if (resp.ok) {
      // Esperar al polling para actualizar
    }
  };

  // Al enviar comentario, solo actualizar desde backend
  const handleComment = async (newsId) => {
    const now = Date.now();
    const lastTs = lastCommentTs[newsId] || 0;
    if (now - lastTs < 25*60*1000) {
      setMsg({ type: 'error', text: 'Debes esperar 25 minutos entre comentarios.' });
      return;
    }
    if(commentInput.trim()){
      const resp = await fetch(apiUrl(`/api/announcements/${newsId}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, username: user.username, text: commentInput })
      });
      if (resp.ok) {
        setCommentInput("");
        // Esperar al polling para actualizar
      }
    }
  };

  // Adjuntar múltiples imágenes (archivos)
  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    // Previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  // Adjuntar imagen por URL
  const handleImageUrl = url => {
    if (url && /^https?:\/\//.test(url)) {
      setImages(prev => [...prev, url]);
      setImagePreviews(prev => [...prev, url]);
    }
  }

  // Adjuntar logo de empresa como imagen
  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onload = ev => setCompanyLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Publicar noticia
  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMsg({ type: 'error', text: 'Completa todos los campos' });
      setTimeout(() => setMsg(null), 2500);
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', content);
    formData.append('authorName', user?.username || 'Anonimo');
    if (user?.id) formData.append('userId', user.id); // Enviar el userId Discord
    if (company) formData.append('company', company);
    if (companyLogo) formData.append('companyLogo', companyLogo);
    if (tags.length) tags.forEach(tag => formData.append('tags[]', tag));
    images.forEach((img) => {
      if (typeof img === 'string') {
        formData.append('imageUrls[]', img);
      } else {
        formData.append('images', img);
      }
    });
    try {
      const resp = await fetch(apiUrl('/api/announcements'), {
        method: 'POST',
        body: formData
      });
      let data = null;
      try { data = await resp.json(); } catch {}
      if (resp.ok && data && !data.error) {
        setMsg({ type: 'success', text: 'Noticia enviada' });
        setTitle("");
        setContent("");
        setImages([]);
        setImagePreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Recargar noticias
        setNewsLoading(true);
        fetch(apiUrl('/api/announcements'))
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && Array.isArray(data.announcements)) {
              setNews(data.announcements.reverse());
            }
            setNewsLoading(false);
          })
          .catch(() => setNewsLoading(false));
      } else {
        // Feedback visual especial si es error de permisos (403)
        if (resp.status === 403 || (data?.error && data.error.includes('permisos'))) {
          setMsg({ type: 'forbidden', text: 'Solo los reporteros oficiales pueden publicar noticias.' });
        } else {
          setMsg({ type: 'error', text: data?.error ? `Error: ${data.error}` : 'Error al enviar noticia' });
        }
      }
    } catch {
      setMsg({ type: 'error', text: 'Error de red' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(null), 3500);
    }
  };

  if (loading) return (
    <div className="news-bg">
      <DiscordUserBar />
      <div style={{textAlign:'center',marginTop:'120px',color:'#fff'}}>
        <div className="news-loader" style={{margin:'60px auto',width:60,height:60,borderRadius:'50%',border:'6px solid #7289da',borderTop:'6px solid #23272a',animation:'spin 1s linear infinite'}} />
        <h2>Cargando noticias...</h2>
      </div>
    </div>
  );
  if (!user) {
    return (
      <div className="news-bg">
        <DiscordUserBar />
        <div className="news-header" style={{background:'#23272a',color:'#fff',padding:'1.5rem 0 1rem 0',textAlign:'center',boxShadow:'0 2px 12px #23272a33',animation:'fadein 0.7s'}}>
          <span style={{fontSize:'2.2rem',fontWeight:900,letterSpacing:2,display:'block',marginBottom:8}}>📰 Noticias RP en Vivo</span>
          <span style={{fontSize:'1.15rem',opacity:0.85}}>Actualidad, sucesos y reportes en tiempo real</span>
        </div>
        <div style={{textAlign:'center',marginTop:'120px',color:'#fff',animation:'fadein 1.2s'}}>
          <div style={{margin:'0 auto 24px auto',width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#7289da 60%,#23272a 100%)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 24px #7289da55',animation:'pulse 1.5s infinite'}}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#fff" strokeWidth="4" /><text x="50%" y="54%" textAnchor="middle" fontSize="2.2rem" fill="#fff" fontWeight="bold">🔒</text></svg>
          </div>
          <h2 style={{fontWeight:900,fontSize:'2rem',marginBottom:18,letterSpacing:1,animation:'fadein 1.5s'}}>Acceso exclusivo a Noticias RP</h2>
          <div style={{fontSize:'1.15rem',marginBottom:18,opacity:0.92,animation:'fadein 1.7s'}}>Inicia sesión con Discord para ver las últimas noticias, sucesos y reportes en tiempo real.<br/>Solo usuarios verificados pueden acceder a la sección de noticias.</div>
          <a href="/auth/login" style={{background:'linear-gradient(90deg,#7289da,#23272a)',color:'#fff',borderRadius:12,padding:'1rem 2.2rem',fontWeight:900,textDecoration:'none',fontSize:'1.3rem',boxShadow:'0 4px 16px #7289da44',transition:'background 0.2s',animation:'fadein 2s'}}>
            <span style={{fontSize:'1.5rem',marginRight:10,verticalAlign:'middle'}}>🔑</span> Iniciar sesión con Discord
          </a>
          <div style={{marginTop:32,opacity:0.8,fontSize:'1.08rem',animation:'fadein 2.2s'}}>
            <span>¿No tienes cuenta? <a href="https://discord.gg/spainrp" target="_blank" rel="noopener noreferrer" style={{color:'#7289da',fontWeight:700,textDecoration:'underline'}}>Únete al Discord oficial</a></span>
          </div>
        </div>
        <div className="news-footer" style={{marginTop:48,padding:'1.2rem 0',background:'#23272a',color:'#fff',textAlign:'center',fontWeight:700,letterSpacing:1,fontSize:'1.1rem',boxShadow:'0 -2px 12px #23272a33',animation:'fadein 2.5s'}}>
          Acceso solo para usuarios logueados Discord. Noticias RP en tiempo real.
        </div>
        <style>{`
          @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none;} }
          @keyframes pulse { 0% { box-shadow: 0 0 0 0 #7289da44; } 70% { box-shadow: 0 0 0 16px #7289da22; } 100% { box-shadow: 0 0 0 0 #7289da44; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="news-bg">
      <DiscordUserBar />
      <div className="news-live-header" style={{background:'#23272a',color:'#fff',padding:'1.5rem 0 1rem 0',textAlign:'center',boxShadow:'0 2px 12px #23272a33'}}>
        <h1 style={{fontSize:'2.7rem',fontWeight:900,letterSpacing:2,marginBottom:8}}>📰 Noticias RP en Vivo</h1>
        <div style={{fontSize:'1.1rem',opacity:0.85}}>Actualidad, sucesos y reportes en tiempo real</div>
      </div>
      <div style={{maxWidth:900,margin:'0 auto',padding:'2rem 0'}}>
        <form onSubmit={handleSubmit} style={{marginBottom:'2rem',background:'#fff',padding:'2rem',borderRadius:16,boxShadow:'0 2px 12px #0002',display:'flex',flexDirection:'column',gap:'1.2rem'}}>
          <div style={{fontWeight:700,fontSize:'1.3rem',marginBottom:4}}>Publicar noticia</div>
          {msg && (
            msg.type === 'forbidden' ? (
              <div style={{
                background: 'linear-gradient(90deg,#e74c3c,#23272a)',
                color:'#fff',
                borderRadius:14,
                padding:'2rem 1.2rem 1.5rem 1.2rem',
                textAlign:'center',
                marginBottom:'1.2rem',
                fontWeight:700,
                fontSize:'1.15rem',
                boxShadow:'0 4px 24px #e74c3c55',
                animation:'shake 0.5s',
                letterSpacing:1,
                position:'relative',
                overflow:'hidden',
                maxWidth:520,
                margin:'0 auto 1.2rem auto'
              }}>
                <span style={{fontSize:'2.2rem',marginRight:12,verticalAlign:'middle'}}>🚫</span>
                <span style={{verticalAlign:'middle'}}>{msg.text}</span>
                <div style={{margin:'1.2rem 0 0.7rem 0',fontWeight:500,fontSize:'1.05rem',opacity:0.95}}>
                  Puedes buscar <b>empresas de noticieros</b> en el <span style={{color:'#7289da'}}>Discord oficial de SpainRP</span>.<br/>
                  <a href="https://discord.gg/spainrp" target="_blank" rel="noopener noreferrer" style={{display:'inline-block',margin:'0.7rem 0 0 0',background:'#7289da',color:'#fff',borderRadius:8,padding:'0.6rem 1.3rem',fontWeight:700,fontSize:'1.08rem',textDecoration:'none',boxShadow:'0 2px 8px #7289da44',transition:'background 0.2s'}}>Ir al Discord oficial</a>
                </div>
                <div style={{margin:'0.7rem 0 0.2rem 0',fontWeight:500,fontSize:'1.05rem',opacity:0.95}}>
                  ¿Quieres ser <b>noticiero autónomo</b>?<br/>
                  <a href="https://discord.com/channels/1212556680911650866/1384341608253886504/1409217738496278669" target="_blank" rel="noopener noreferrer" style={{display:'inline-block',margin:'0.7rem 0 0 0',background:'linear-gradient(90deg,#23272a,#7289da)',color:'#fff',borderRadius:8,padding:'0.6rem 1.3rem',fontWeight:700,fontSize:'1.08rem',textDecoration:'none',boxShadow:'0 2px 8px #23272a44',transition:'background 0.2s'}}>Abrir ticket de contacto Fundación</a>
                </div>
                <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none'}}>
                  <svg width="100%" height="100%" style={{position:'absolute',top:0,left:0}}>
                    <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#e74c3c" strokeWidth="4" strokeDasharray="12 8" />
                  </svg>
                </div>
                <style>{`
                  @keyframes shake {
                    0% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-6px); }
                    80% { transform: translateX(6px); }
                    100% { transform: translateX(0); }
                  }
                `}</style>
              </div>
            ) : (
              <div style={{
                background: msg.type === 'error' ? '#e74c3c' : '#2ecc71',
                color:'#fff',
                borderRadius:8,
                padding:'0.7rem',
                textAlign:'center',
                marginBottom:'1rem',
                fontWeight:600,
                boxShadow: msg.type === 'error' ? '0 2px 8px #e74c3c44' : '0 2px 8px #2ecc7144',
                transition:'background 0.2s'
              }}>
                {msg.text}
              </div>
            )
          )}
          <input
            type="text"
            placeholder="Título de la noticia"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{width:'100%',marginBottom:'0.7rem',padding:'0.7rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1.1rem',fontWeight:600}}
            disabled={submitting}
          />
          <textarea
            placeholder="Contenido..."
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{width:'100%',minHeight:100,marginBottom:'0.7rem',padding:'0.7rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1.05rem'}}
            disabled={submitting}
          />
          <input
            type="text"
            placeholder="Empresa/Compañía (opcional)"
            value={company}
            onChange={e => setCompany(e.target.value)}
            style={{width:'100%',marginBottom:'0.7rem',padding:'0.7rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1.05rem'}}
            disabled={submitting}
          />
          <div style={{marginBottom:'0.7rem'}}>
            <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Logo de empresa (opcional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{fontSize:'1rem'}}
              disabled={submitting}
            />
            {companyLogoPreview && (
              <div style={{position:'relative',display:'inline-block',marginTop:8}}>
                <img src={companyLogoPreview} alt="logo-preview" style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',boxShadow:'0 2px 8px #0002'}} />
                <button type="button" onClick={()=>{setCompanyLogo("");setCompanyLogoPreview("");}} style={{position:'absolute',top:-8,right:-8,background:'#e74c3c',color:'#fff',border:'none',borderRadius:'50%',width:22,height:22,fontWeight:700,cursor:'pointer',fontSize:14,boxShadow:'0 2px 8px #e74c3c44'}}>✕</button>
              </div>
            )}
          </div>
          <div style={{marginBottom:'0.7rem'}}>
            <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Etiquetas/emojis:</label>
            <input
              type="text"
              placeholder="Ej: 🚨,🏢,🎉"
              value={tags.join(',')}
              onChange={e => setTags(e.target.value.split(',').map(t=>t.trim()).filter(Boolean))}
              style={{width:'100%',padding:'0.7rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1.05rem'}}
              disabled={submitting}
            />
            {tags.length > 0 && (
              <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
                {tags.map((tag, i) => (
                  <span key={i} style={{background:'#7289da',color:'#fff',borderRadius:16,padding:'0.3rem 0.9rem',fontWeight:700,fontSize:'1.1rem',boxShadow:'0 2px 8px #7289da33',display:'inline-flex',alignItems:'center',gap:4,animation:'chipin 0.4s'}}>{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <input
                type="text"
                placeholder="URL de imagen (opcional)"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleImageUrl(e.target.value);
                    e.target.value = "";
                  }
                }}
                style={{flex:1,padding:'0.7rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1rem'}}
                disabled={submitting}
              />
              <span style={{fontWeight:600}}>o</span>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{fontSize:'1rem'}}
                disabled={submitting}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div style={{display:'flex',gap:12,flexWrap:'wrap',margin:'10px 0'}}>
                {imagePreviews.map((img, idx) => (
                  <div key={idx} style={{position:'relative',animation:'fadein 0.5s'}}>
                    <img src={img} alt={`preview-${idx}`} style={{maxWidth:120,maxHeight:80,borderRadius:8,boxShadow:'0 2px 8px #0002',transition:'box-shadow 0.2s'}} />
                    <button type="button" onClick={() => {
                      setImages(images.filter((_, i) => i !== idx));
                      setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
                    }} style={{position:'absolute',top:2,right:2,background:'#e74c3c',color:'#fff',border:'none',borderRadius:'50%',width:22,height:22,fontWeight:700,cursor:'pointer',fontSize:14,boxShadow:'0 2px 8px #e74c3c44'}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" style={{background:'linear-gradient(90deg,#7289da,#23272a)',color:'#fff',border:'none',borderRadius:8,padding:'0.8rem 1.7rem',fontWeight:700,fontSize:'1.15rem',cursor:'pointer',boxShadow:'0 4px 16px #23272a22',transition:'transform 0.2s',transform:submitting?'scale(0.97)':'scale(1)'}} disabled={submitting}>
            {submitting ? <span style={{marginRight:8}} className="news-loader" /> : null}
            Publicar noticia
          </button>
        </form>
        <h2 style={{marginBottom:'1.2rem',fontWeight:800,fontSize:'2rem',letterSpacing:1}}>Noticias recientes</h2>
          <div style={{display:'flex',gap:16,marginBottom:18,alignItems:'center'}}>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar noticia, autor..." style={{flex:1,padding:'0.7rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1rem'}} />
            <select value={filterTag} onChange={e=>setFilterTag(e.target.value)} style={{padding:'0.7rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1rem'}}>
              <option value="">Todas las etiquetas</option>
              {[...new Set(news.flatMap(n=>n.tags||[]))].map((tag,i)=>(<option key={i} value={tag}>{tag}</option>))}
            </select>
          </div>
  {newsLoading ? (
          <div style={{textAlign:'center',margin:'40px 0'}}>
            <div className="news-loader" style={{margin:'0 auto',width:48,height:48,borderRadius:'50%',border:'6px solid #7289da',borderTop:'6px solid #23272a',animation:'spin 1s linear infinite'}} />
            <div style={{marginTop:12,fontWeight:600}}>Cargando noticias...</div>
          </div>
  ) : filteredNews.length === 0 ? (
          <div style={{textAlign:'center',margin:'40px 0',color:'#888',fontWeight:600,fontSize:'1.1rem'}}>No hay noticias publicadas aún.</div>
        ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))',gap:'2.5rem'}}>
          {filteredNews.map(n => (
            <div key={n.id || n._id} className="news-card" style={{background:'#fff',border:'1px solid #eee',borderRadius:22,padding:'0',boxShadow:'0 4px 18px #0002',overflow:'hidden',display:'flex',flexDirection:'column',minHeight:380,transition:'box-shadow 0.2s',animation:'fadein 0.7s',cursor:'pointer',position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.2rem 1.2rem 0 1.2rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{fontWeight:900,fontSize:'1.3rem',color:'#23272a'}}>{n.title}</div>
                  {Array.isArray(n.tags) && n.tags.length > 0 && (
                    <div style={{display:'flex',gap:6,marginLeft:8}}>
                      {n.tags.map((tag, i) => <span key={i} style={{background:'#7289da',color:'#fff',borderRadius:16,padding:'0.2rem 0.7rem',fontWeight:700,fontSize:'1.1rem',boxShadow:'0 2px 8px #7289da33',display:'inline-flex',alignItems:'center',gap:4,animation:'chipin 0.4s'}}>{tag}</span>)}
                    </div>
                  )}
                </div>
                {n.companyLogo && <img src={n.companyLogo} alt="logo" style={{width:38,height:38,borderRadius:'50%',objectFit:'cover',boxShadow:'0 2px 8px #0002',marginLeft:12}} />}
              </div>
              {/* Vista previa de imágenes */}
              {Array.isArray(n.images) && n.images.length > 0 ? (
                <div style={{width:'100%',height:'220px',overflow:'hidden',background:'#222',display:'flex'}}>
                  {n.images.map((img, idx) => (
                    <img key={idx} src={img} alt={n.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'brightness(0.93)',borderRight:idx<n.images.length-1?'2px solid #fff':'none',transition:'filter 0.2s',cursor:'zoom-in'}} onClick={()=>setShowImagePreview(img)} />
                  ))}
                </div>
              ) : n.image ? (
                <div style={{width:'100%',height:'220px',overflow:'hidden',background:'#222'}}>
                  <img src={n.image} alt={n.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'brightness(0.93)',cursor:'zoom-in'}} onClick={()=>setShowImagePreview(n.image)} />
                </div>
              ) : null}
              <div style={{padding:'1.2rem',flex:1,display:'flex',flexDirection:'column',gap:8}}>
                <div style={{fontSize:15,color:'#222',fontWeight:500,marginBottom:8}}>{n.body || n.content}</div>
                <div style={{fontSize:14,color:'#888',marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
                  {n.company && <span style={{fontWeight:700,color:'#7289da'}}>{n.company}</span>}
                  <span>Por <b>{n.authorName || n.author || 'Anonimo'}</b></span>
                  <span style={{fontSize:13,opacity:0.7}}>{n.createdAt ? new Date(n.createdAt).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short'}) : (n.date ? new Date(n.date).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short'}) : '')}</span>
                </div>
                {/* Reacciones/emojis */}
                <div style={{display:'flex',gap:8,margin:'8px 0'}}>
                    {EMOJIS.map(emoji => {
                      const reacted = userReactions[n.id]?.[emoji];
                      return (
                        <button key={emoji} style={{background:reacted?'#7289da':'#f4f4f4',color:reacted?'#fff':'#23272a',border:'none',borderRadius:8,padding:'0.3rem 0.7rem',fontWeight:700,fontSize:'1.2rem',cursor:reacted?'not-allowed':'pointer',transition:'background 0.2s',boxShadow:'0 2px 8px #0001'}} disabled={reacted} onClick={()=>handleReaction(n.id, emoji)}>
                          {emoji} {reactions[n.id]?.[emoji]||0}
                        </button>
                      );
                    })}
                </div>
                {/* Comentarios */}
                <div style={{marginTop:8}}>
                  <div style={{fontWeight:700,marginBottom:4}}>Comentarios</div>
                  <div style={{display:'flex',gap:8,marginBottom:8}}>
                      <input type="text" value={commentInput} onChange={e=>setCommentInput(e.target.value)} placeholder="Escribe un comentario..." style={{flex:1,padding:'0.5rem',borderRadius:8,border:'1px solid #ddd',fontSize:'1rem'}} />
                      <button style={{background:'#7289da',color:'#fff',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:700,fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 8px #7289da44'}} onClick={()=>handleComment(n.id)}>
                        Enviar
                      </button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {(commentsMap[n.id]||[]).map((c,i)=>(
                      <div key={i} style={{background:'#f4f4f4',borderRadius:8,padding:'0.5rem 1rem',fontSize:'1rem',boxShadow:'0 2px 8px #0001',animation:'fadein 0.5s'}}>
                        <b style={{color:'#7289da'}}>{c.user || c.username}</b>: {c.text}
                        <span style={{fontSize:12,opacity:0.6,marginLeft:8}}>{c.createdAt ? new Date(c.createdAt).toLocaleTimeString() : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Animación de selección */}
              <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',borderRadius:22,boxShadow:'0 0 0 0 #7289da',transition:'box-shadow 0.3s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 0 4px #7289da44'} onMouseLeave={e=>e.currentTarget.style.boxShadow='0 0 0 0 #7289da'} />
              {/* Modal de vista previa de imagen */}
              {showImagePreview && (
                <div className="img-preview-modal" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(35,39,42,0.85)',backdropFilter:'blur(6px)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',animation:'modalin 0.4s'}} onClick={()=>setShowImagePreview(null)}>
                  <img src={showImagePreview} alt="preview" style={{maxWidth:'90vw',maxHeight:'80vh',borderRadius:18,boxShadow:'0 8px 32px #0008',animation:'fadein 0.5s'}} />
                </div>
              )}
            </div>
          ))}
        </div>
        )}
        {/* Modal de noticia ampliada */}
        {selectedNews && (
          <div className="news-modal-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(35,39,42,0.85)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',animation:'modalin 0.4s'}} onClick={()=>setSelectedNews(null)}>
            <div className="news-modal" style={{background:'#fff',borderRadius:28,maxWidth:620,width:'100%',boxShadow:'0 12px 48px #0005',padding:'2.7rem 2.2rem',position:'relative',animation:'modalin 0.4s'}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setSelectedNews(null)} style={{position:'absolute',top:18,right:18,background:'linear-gradient(90deg,#e74c3c,#23272a)',color:'#fff',border:'none',borderRadius:'50%',width:36,height:36,fontWeight:700,fontSize:20,cursor:'pointer',boxShadow:'0 2px 8px #e74c3c44',transition:'transform 0.2s'}}>
                ✕
              </button>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{fontWeight:900,fontSize:'2rem',color:'#23272a'}}>{selectedNews.title}</div>
                  {Array.isArray(selectedNews.tags) && selectedNews.tags.length > 0 && (
                    <div style={{display:'flex',gap:8,marginLeft:8}}>
                      {selectedNews.tags.map((tag, i) => <span key={i} style={{background:'#7289da',color:'#fff',borderRadius:16,padding:'0.3rem 1rem',fontWeight:700,fontSize:'1.2rem',boxShadow:'0 2px 8px #7289da33',display:'inline-flex',alignItems:'center',gap:4,animation:'chipin 0.4s'}}>{tag}</span>)}
                    </div>
                  )}
                </div>
                {selectedNews.companyLogo && <img src={selectedNews.companyLogo} alt="logo" style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',boxShadow:'0 2px 8px #0002',marginLeft:12}} />}
              </div>
              {/* Botones de editar/eliminar si el usuario tiene permisos */}
              {(canEdit || canDelete) && (
                <div style={{display:'flex',gap:12,marginBottom:18}}>
                  {canEdit && <button style={{background:'#2ecc71',color:'#fff',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:700,fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 8px #2ecc7144'}} onClick={()=>alert('Función editar próximamente')}>Editar</button>}
                  {canDelete && <button style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:700,fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 8px #e74c3c44'}} onClick={async()=>{
                    if(window.confirm('¿Seguro que quieres eliminar esta noticia?')){
                      const resp = await fetch(apiUrl(`/api/announcements/${selectedNews.id}`), {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id })
                      });
                      if(resp.ok){
                        setMsg({ type: 'success', text: 'Noticia eliminada' });
                        setSelectedNews(null);
                        setNews(news.filter(n=>n.id!==selectedNews.id));
                      }else{
                        setMsg({ type: 'error', text: 'No se pudo eliminar' });
                      }
                    }
                  }}>Eliminar</button>}
                </div>
              )}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} }
        @keyframes chipin { from { opacity: 0; transform: scale(0.7);} to { opacity: 1; transform: scale(1);} }
        @keyframes modalin { from { opacity: 0; transform: scale(0.85);} to { opacity: 1; transform: scale(1);} }
      `}</style>
              {Array.isArray(selectedNews.images) && selectedNews.images.length > 0 ? (
                <div style={{width:'100%',height:'260px',overflow:'hidden',background:'#222',display:'flex',borderRadius:12,marginBottom:18}}>
                  {selectedNews.images.map((img, idx) => (
                    <img key={idx} src={img} alt={selectedNews.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'brightness(0.93)',borderRight:idx<selectedNews.images.length-1?'2px solid #fff':'none',transition:'filter 0.2s'}} />
                  ))}
                </div>
              ) : selectedNews.image ? (
                <div style={{width:'100%',height:'260px',overflow:'hidden',background:'#222',borderRadius:12,marginBottom:18}}>
                  <img src={selectedNews.image} alt={selectedNews.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'brightness(0.93)'}} />
                </div>
              ) : null}
              <div style={{fontSize:17,color:'#222',fontWeight:500,marginBottom:18}}>{selectedNews.body || selectedNews.content}</div>
              <div style={{fontSize:15,color:'#888',marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
                {selectedNews.company && <span style={{fontWeight:700,color:'#7289da'}}>{selectedNews.company}</span>}
                <span>Por <b>{selectedNews.authorName || selectedNews.author || 'Anonimo'}</b></span>
                <span style={{fontSize:13,opacity:0.7}}>{selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short'}) : (selectedNews.date ? new Date(selectedNews.date).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short'}) : '')}</span>
              </div>
              <div style={{marginTop:18,fontSize:14,opacity:0.8,color:'#aaa',borderTop:'1px solid #eee',paddingTop:10}}>
                <span>Mini comentarios y pie de noticia aquí.</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="news-footer" style={{marginTop:32,padding:'1.2rem 0',background:'#23272a',color:'#fff',textAlign:'center',fontWeight:700,letterSpacing:1,fontSize:'1.1rem',boxShadow:'0 -2px 12px #23272a33'}}>
        Noticias RP en tiempo real. Powered by SpainRP.
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} }
      `}</style>
    </div>
  );
}

// Mejoras visuales y UX en News.jsx
// - Animaciones en cards y formularios
// - Mejor copy y feedback
// - Botón de publicar con loading
// - Vista previa de imágenes con zoom y transición
// - Cards con sombra y hover
// - Mensajes de error/success con iconos
// - Responsive y moderno

export default News;
