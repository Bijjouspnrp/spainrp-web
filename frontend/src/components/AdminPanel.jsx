import React, { useState, useEffect } from 'react';
import GlobalDMCollectorPanel from './GlobalDMCollectorPanel';
import { apiUrl } from '../utils/api';
import './AdminPanel.css';
import { 
  FaBan, 
  FaUser, 
  FaCrown, 
  FaSearch, 
  FaGavel, 
  FaUserShield, 
  FaVolumeMute, 
  FaUserTimes, 
  FaUndo, 
  FaCopy, 
  FaFilter, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaEnvelope,
  FaUsers,
  FaHistory,
  FaClipboardList,
  FaCog,
  FaShieldAlt,
  FaChartLine,
  FaBell,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaChevronUp,
  FaChevronRight,
  FaChevronLeft,
  FaBars,
  FaTools
} from 'react-icons/fa';
import MaintenanceControl from './MaintenanceControl';
// Toast feedback mejorado
function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
      {type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="toast-close">
        <FaTimes />
      </button>
    </div>
  );
}

// Panel visual de permisos
function PermissionsPanel() {
  const [channels, setChannels] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [permissions, setPermissions] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    // Simulación: fetch canales y roles (sin IDs)
    fetch(apiUrl('/api/discord/channels'))
      .then(res => res.json())
      .then(data => setChannels(data.channels || []));
    fetch(apiUrl('/api/discord/roles'))
      .then(res => res.json())
      .then(data => setRoles(data.roles || []));
    fetch(apiUrl('/api/discord/permissions'))
      .then(res => res.json())
      .then(data => setPermissions(data.permissions || {}));
  }, []);

  const handleChange = (channelId, roleId, perm) => {
    setPermissions(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        [roleId]: {
          ...prev[channelId]?.[roleId],
          [perm]: !prev[channelId]?.[roleId]?.[perm]
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(apiUrl('/api/discord/permissions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions })
    });
    setSaving(false);
    alert('Permisos actualizados');
  };

  return (
    <div style={{margin:'2.5rem 0',background:'rgba(255,255,255,0.07)',borderRadius:16,padding:'2rem'}}>
      <h3 style={{color:'#FFD700',fontWeight:800,fontSize:'1.3rem',marginBottom:'1.2rem'}}>Panel Visual de Permisos</h3>
      <table style={{width:'100%',borderCollapse:'collapse',background:'rgba(0,0,0,0.04)'}}>
        <thead>
          <tr>
            <th style={{color:'#7289da',fontWeight:700,padding:'8px'}}>Canal</th>
            {roles.map(role => (
              <th key={role.id} style={{color:'#FFD700',fontWeight:700,padding:'8px'}}>{role.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {channels.map(channel => (
            <tr key={channel.id}>
              <td style={{color:'#fff',fontWeight:600,padding:'8px',background:'#23272a'}}>{channel.name}</td>
              {roles.map(role => (
                <td key={role.id} style={{textAlign:'center',padding:'8px'}}>
                  <label style={{display:'block',fontSize:'0.95rem',color:'#fff'}}>
                    <input
                      type="checkbox"
                      checked={permissions[channel.id]?.[role.id]?.read || false}
                      onChange={() => handleChange(channel.id, role.id, 'read')}
                    /> Leer
                  </label>
                  <label style={{display:'block',fontSize:'0.95rem',color:'#fff'}}>
                    <input
                      type="checkbox"
                      checked={permissions[channel.id]?.[role.id]?.write || false}
                      onChange={() => handleChange(channel.id, role.id, 'write')}
                    /> Escribir
                  </label>
                  <label style={{display:'block',fontSize:'0.95rem',color:'#fff'}}>
                    <input
                      type="checkbox"
                      checked={permissions[channel.id]?.[role.id]?.admin || false}
                      onChange={() => handleChange(channel.id, role.id, 'admin')}
                    /> Admin
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleSave}
        disabled={saving}
        style={{marginTop:'1.5rem',background:'#7289da',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,fontSize:'1rem',cursor:'pointer'}}
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Toast feedback global
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type }), 3000);
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('spainrp_token');
        
        if (!token) {
          console.log('[ADMIN] No token found');
          setIsAuthenticated(false);
          setAuthLoading(false);
          return;
        }

        const response = await fetch(apiUrl('/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[ADMIN] Auth successful:', data);
          setUserInfo(data.user);
          setIsAuthenticated(true);
        } else {
          console.log('[ADMIN] Auth failed:', response.status);
          setIsAuthenticated(false);
          localStorage.removeItem('spainrp_token');
        }
      } catch (error) {
        console.error('[ADMIN] Auth error:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Hook para detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Hacer showToast accesible globalmente para MaintenanceControl
  useEffect(() => {
    window.showAdminToast = showToast;
    return () => {
      delete window.showAdminToast;
    };
  }, [showToast]);
  
  // Panel de MDs privados
  const [dmUserId, setDmUserId] = useState('');
  const [dmType, setDmType] = useState('text');
  const [dmMessage, setDmMessage] = useState('');
  const [dmEmbedTitle, setDmEmbedTitle] = useState('');
  const [dmEmbedDesc, setDmEmbedDesc] = useState('');
  const [dmResult, setDmResult] = useState(null);
  const [dmError, setDmError] = useState('');
  const [dmReplies, setDmReplies] = useState([]);
  const [dmRepliesLoading, setDmRepliesLoading] = useState(false);
  const fetchDmReplies = async (userId) => {
    setDmRepliesLoading(true);
    try {
      const res = await fetch(`/api/discord/dmreplies/${userId}`);
      const data = await res.json();
      setDmReplies(data.replies || []);
    } catch {
      setDmReplies([]);
    }
    setDmRepliesLoading(false);
  };
  const handleSendDM = async (e) => {
    e.preventDefault();
    setDmResult(null);
    setDmError('');
    if (!dmUserId.trim()) {
      setDmError('Debes ingresar el ID de usuario.');
      showToast('Debes ingresar el ID de usuario.', 'error');
      return;
    }
    if (dmType === 'text' && !dmMessage.trim()) {
      setDmError('Debes escribir el mensaje.');
      showToast('Debes escribir el mensaje.', 'error');
      return;
    }
    if (dmType === 'embed' && (!dmEmbedTitle.trim() || !dmEmbedDesc.trim())) {
      setDmError('Debes completar título y descripción del embed.');
      showToast('Debes completar título y descripción del embed.', 'error');
      return;
    }
    try {
      const body = dmType === 'text'
        ? { userId: dmUserId.trim(), type: 'text', message: dmMessage.trim() }
        : { userId: dmUserId.trim(), type: 'embed', embed: { title: dmEmbedTitle.trim(), description: dmEmbedDesc.trim() } };
      const res = await fetch(apiUrl('/api/discord/senddm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setDmResult(data.success ? '✅ Mensaje enviado correctamente.' : `❌ ${data.error || 'Error'}`);
      showToast(data.success ? 'Mensaje enviado correctamente.' : (data.error || 'Error'), data.success ? 'success' : 'error');
    } catch (err) {
      setDmResult('Error al enviar mensaje');
      showToast('Error al enviar mensaje', 'error');
    }
  };
  // Validaciones y feedback para paneles extra
  const [blockError, setBlockError] = useState('');
  const [tempRoleError, setTempRoleError] = useState('');
  const [banError, setBanError] = useState('');
  const [unbanError, setUnbanError] = useState('');
  const [kickError, setKickError] = useState('');
  const [muteError, setMuteError] = useState('');
  // Toast feedback ya definido globalmente
  const [userId, setUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banResult, setBanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unbanId, setUnbanId] = useState('');
  const [unbanResult, setUnbanResult] = useState(null);
  const [kickId, setKickId] = useState('');
  const [kickResult, setKickResult] = useState(null);
  const [muteId, setMuteId] = useState('');
  const [muteTime, setMuteTime] = useState('');
  const [muteResult, setMuteResult] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [roleId, setRoleId] = useState('');
  const [rolesList, setRolesList] = useState([]);
  const [roleUserId, setRoleUserId] = useState('');
  const [roleAction, setRoleAction] = useState('add');
  const [roleResult, setRoleResult] = useState(null);
  const [bannedList, setBannedList] = useState([]);
  const [logs, setLogs] = useState([]);
  // Expulsión masiva
  const [massIds, setMassIds] = useState('');
  const [massAction, setMassAction] = useState('kick');
  const [massResult, setMassResult] = useState(null);
  // Notas internas
  const [noteUserId, setNoteUserId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteResult, setNoteResult] = useState(null);
  // Roles avanzados
  const [multiRoleUserId, setMultiRoleUserId] = useState('');
  const [multiRoles, setMultiRoles] = useState([]);
  const [multiRoleAction, setMultiRoleAction] = useState('add');
  const [multiRoleResult, setMultiRoleResult] = useState(null);
  // Logs de comandos
  const [commandLogs, setCommandLogs] = useState([]);
  // Bloqueo de canales
  const [blockChannelId, setBlockChannelId] = useState('');
  const [blockRoleId, setBlockRoleId] = useState('');
  const [blockAction, setBlockAction] = useState('block');
  const [blockResult, setBlockResult] = useState(null);
  // Roles temporales
  const [tempRoleUserId, setTempRoleUserId] = useState('');
  const [tempRoleId, setTempRoleId] = useState('');
  const [tempRoleTime, setTempRoleTime] = useState('');
  const [tempRoleResult, setTempRoleResult] = useState(null);

  // Expulsión masiva
  const [massError, setMassError] = useState('');
  const handleMass = async (e) => {
    e.preventDefault();
    setMassResult(null);
    setMassError('');
    const ids = massIds.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length === 0) {
      setMassError('Debes ingresar al menos un ID válido.');
      showToast('Debes ingresar al menos un ID válido.', 'error');
      return;
    }
    if (!['kick','ban'].includes(massAction)) {
      setMassError('Acción inválida.');
      showToast('Acción inválida.', 'error');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/discord/mass'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: ids, action: massAction })
      });
      const data = await res.json();
      if (data.results) {
        setMassResult(
          <div>
            <b>Resultados:</b>
            <ul style={{textAlign:'left'}}>
              {data.results.map((r,i) => (
                <li key={i} style={{color:r.success?'#27ae60':'#e74c3c'}}>
                  {r.userId}: {r.success ? `✔️ ${r.action}` : `❌ ${r.error}`}
                  <button style={{marginLeft:8,background:'none',border:'none',color:'#7289da',cursor:'pointer'}} title="Copiar ID" onClick={()=>{navigator.clipboard.writeText(r.userId);showToast('ID copiado')}}><FaCopy /></button>
                </li>
              ))}
            </ul>
          </div>
        );
        showToast('Acción masiva completada');
      } else {
        setMassResult(data.error || 'Error desconocido');
        showToast(data.error || 'Error desconocido', 'error');
      }
    } catch (err) {
      setMassResult('Error en expulsión masiva');
      showToast('Error en expulsión masiva', 'error');
    }
  };

  // Notas internas
  const [noteError, setNoteError] = useState('');
  const handleNote = async (e) => {
    e.preventDefault();
    setNoteResult(null);
    setNoteError('');
    if (!noteUserId.trim() || !noteText.trim()) {
      setNoteError('Debes ingresar ID y texto de la nota.');
      showToast('Debes ingresar ID y texto de la nota.', 'error');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/discord/note'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: noteUserId.trim(), note: noteText.trim() })
      });
      const data = await res.json();
      setNoteResult(data.success ? '✅ Nota guardada correctamente.' : `❌ ${data.error || 'Error'}`);
      showToast(data.success ? 'Nota guardada correctamente.' : (data.error || 'Error'), data.success ? 'success' : 'error');
    } catch (err) {
      setNoteResult('Error al guardar nota');
      showToast('Error al guardar nota', 'error');
    }
  };

  // Roles avanzados
  const [multiRoleError, setMultiRoleError] = useState('');
  const handleMultiRole = async (e) => {
    e.preventDefault();
    setMultiRoleResult(null);
    setMultiRoleError('');
    if (!multiRoleUserId.trim() || multiRoles.length === 0) {
      setMultiRoleError('Debes ingresar ID de usuario y seleccionar al menos un rol.');
      showToast('Debes ingresar ID de usuario y seleccionar al menos un rol.', 'error');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/discord/multirole'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: multiRoleUserId.trim(), roleIds: multiRoles, action: multiRoleAction })
      });
      const data = await res.json();
      if (data.results) {
        setMultiRoleResult(
          <div>
            <b>Resultados:</b>
            <ul style={{textAlign:'left'}}>
              {data.results.map((r,i) => (
                <li key={i} style={{color:r.success?'#27ae60':'#e74c3c'}}>
                  {r.roleId}: {r.success ? '✔️' : `❌ ${r.error}`}
                  <button style={{marginLeft:8,background:'none',border:'none',color:'#7289da',cursor:'pointer'}} title="Copiar ID" onClick={()=>{navigator.clipboard.writeText(r.roleId);showToast('ID de rol copiado')}}><FaCopy /></button>
                </li>
              ))}
            </ul>
          </div>
        );
        showToast('Acción de roles avanzada completada');
      } else {
        setMultiRoleResult(data.error || 'Error desconocido');
        showToast(data.error || 'Error desconocido', 'error');
      }
    } catch (err) {
      setMultiRoleResult('Error en roles avanzados');
      showToast('Error en roles avanzados', 'error');
    }
  };

  // Logs de comandos
  const fetchCommandLogs = async () => {
    try {
      const res = await fetch(apiUrl('/api/discord/commandlog'));
      const data = await res.json();
      setCommandLogs(data.logs || []);
    } catch (err) {
      setCommandLogs(['Error al obtener logs']);
    }
  };

  // Bloqueo de canales
  const handleBlockChannel = async (e) => {
    e.preventDefault();
    setBlockResult(null);
    setBlockError('');
    if (!blockChannelId.trim() || !blockRoleId.trim()) {
      setBlockError('Debes ingresar ID de canal y de rol.');
      showToast('Debes ingresar ID de canal y de rol.', 'error');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/discord/blockchannel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: blockChannelId.trim(), roleId: blockRoleId.trim(), action: blockAction })
      });
      const data = await res.json();
      setBlockResult(data.message ? `✔️ ${data.message}` : `❌ ${data.error || 'Error'}`);
      showToast(data.message ? data.message : (data.error || 'Error'), data.message ? 'success' : 'error');
    } catch (err) {
      setBlockResult('Error en bloqueo de canal');
      showToast('Error en bloqueo de canal', 'error');
    }
  };

  // Roles temporales
  const handleTempRole = async (e) => {
    e.preventDefault();
    setTempRoleResult(null);
    setTempRoleError('');
    if (!tempRoleUserId.trim() || !tempRoleId.trim() || !tempRoleTime) {
      setTempRoleError('Debes ingresar todos los datos.');
      showToast('Debes ingresar todos los datos.', 'error');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/discord/temprole'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempRoleUserId.trim(), roleId: tempRoleId.trim(), time: tempRoleTime })
      });
      const data = await res.json();
      setTempRoleResult(data.message ? `✔️ ${data.message}` : `❌ ${data.error || 'Error'}`);
      showToast(data.message ? data.message : (data.error || 'Error'), data.message ? 'success' : 'error');
    } catch (err) {
      setTempRoleResult('Error en rol temporal');
      showToast('Error en rol temporal', 'error');
    }
  };

  // Banear usuario
  const handleBan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBanResult(null);
    setBanError('');
    if (!userId.trim() || !banReason.trim()) {
      setBanError('Debes ingresar ID y motivo.');
      showToast('Debes ingresar ID y motivo.', 'error');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/discord/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: banReason })
      });
      const data = await res.json();
      setBanResult(data);
      showToast(data.error ? data.error : 'Usuario baneado correctamente.', data.error ? 'error' : 'success');
    } catch (err) {
      setBanResult({ error: 'Error al banear usuario.' });
      showToast('Error al banear usuario.', 'error');
    }
    setLoading(false);
  };

  // Desbanear usuario
  const handleUnban = async (e) => {
    e.preventDefault();
    setUnbanResult(null);
    setUnbanError('');
    if (!unbanId.trim()) {
      setUnbanError('Debes ingresar ID de usuario.');
      showToast('Debes ingresar ID de usuario.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/discord/unban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: unbanId })
      });
      const data = await res.json();
      setUnbanResult(data);
      showToast(data.error ? data.error : 'Usuario desbaneado correctamente.', data.error ? 'error' : 'success');
    } catch (err) {
      setUnbanResult({ error: 'Error al desbanear usuario.' });
      showToast('Error al desbanear usuario.', 'error');
    }
  };

  // Kickear usuario
  const handleKick = async (e) => {
    e.preventDefault();
    setKickResult(null);
    setKickError('');
    if (!kickId.trim()) {
      setKickError('Debes ingresar ID de usuario.');
      showToast('Debes ingresar ID de usuario.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/discord/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: kickId })
      });
      const data = await res.json();
      setKickResult(data);
      showToast(data.error ? data.error : 'Usuario kickeado correctamente.', data.error ? 'error' : 'success');
    } catch (err) {
      setKickResult({ error: 'Error al kickear usuario.' });
      showToast('Error al kickear usuario.', 'error');
    }
  };

  // Mute temporal
  const handleMute = async (e) => {
    e.preventDefault();
    setMuteResult(null);
    setMuteError('');
    if (!muteId.trim() || !muteTime) {
      setMuteError('Debes ingresar ID y tiempo.');
      showToast('Debes ingresar ID y tiempo.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/discord/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: muteId, time: muteTime })
      });
      const data = await res.json();
      setMuteResult(data);
      showToast(data.error ? data.error : 'Usuario muteado correctamente.', data.error ? 'error' : 'success');
    } catch (err) {
      setMuteResult({ error: 'Error al mutear usuario.' });
      showToast('Error al mutear usuario.', 'error');
    }
  };

  // Buscar usuario y ver roles
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResult(null);
    try {
      const res = await fetch(`/api/member/1212556680911650866/${searchId}`);
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      setSearchResult({ error: 'Error al buscar usuario.' });
    }
  };

  // Cambiar roles
  const [roleError, setRoleError] = useState('');
  const handleRole = async (e) => {
    e.preventDefault();
    setRoleResult(null);
    setRoleError('');
    if (!roleUserId.trim() || !roleId.trim()) {
      setRoleError('Debes ingresar ID de usuario y seleccionar un rol.');
      showToast('Debes ingresar ID de usuario y seleccionar un rol.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/discord/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: roleUserId, roleId, action: roleAction })
      });
      const data = await res.json();
      setRoleResult(data);
      showToast(data.error ? data.error : 'Rol actualizado correctamente.', data.error ? 'error' : 'success');
    } catch (err) {
      setRoleResult({ error: 'Error al cambiar rol.' });
      showToast('Error al cambiar rol.', 'error');
    }
  };

  // Obtener lista de roles al cargar el componente
  const [roleSearch, setRoleSearch] = useState('');
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(apiUrl('/api/discord/roles'));
        const data = await res.json();
        // Orden descendente (de abajo a arriba)
        const sorted = (data.roles || []).slice().reverse();
        setRolesList(sorted);
      } catch {}
    };
    fetchRoles();
  }, []);

  // Ver lista de baneados
  const fetchBannedList = async () => {
    try {
      const res = await fetch(`/api/discord/banned`);
      const data = await res.json();
      setBannedList(data.bans || []);
    } catch (err) {
      setBannedList([]);
    }
  };

  // Ver logs de staff
  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/discord/logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      setLogs([]);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FaChartLine },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'moderation', label: 'Moderación', icon: FaGavel },
    { id: 'communication', label: 'Comunicación', icon: FaEnvelope },
    { id: 'roles', label: 'Roles', icon: FaUserShield },
    { id: 'maintenance', label: 'Mantenimiento', icon: FaTools },
    { id: 'logs', label: 'Logs', icon: FaHistory },
    { id: 'settings', label: 'Configuración', icon: FaCog }
  ];

  // Función para cambiar de pestaña y cerrar sidebar en móvil
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <div className="admin-panel-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <FaCog className="spinning" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <div>Verificando autenticación...</div>
        </div>
      </div>
    );
  }

  // Mostrar error si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="admin-panel-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#fff', background: 'rgba(255,0,0,0.1)', padding: '2rem', borderRadius: '10px' }}>
          <FaExclamationTriangle style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff6b6b' }} />
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Usuario: {userInfo?.username || 'No identificado'}</p>
          <a href="/auth/login" style={{ 
            display: 'inline-block', 
            marginTop: '1rem', 
            padding: '10px 20px', 
            background: '#7289da', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}>
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <Toast message={toast.message} type={toast.type} onClose={()=>setToast({message:'',type:'success'})} />
      
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <FaCrown className="admin-icon" />
            <h1>Panel de Administración</h1>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Herramientas</h3>
            </div>
          <nav className="admin-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
              >
                <tab.icon />
                <span>{tab.label}</span>
        </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          <div className="admin-content">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'moderation' && <ModerationTab />}
            {activeTab === 'communication' && <CommunicationTab />}
            {activeTab === 'roles' && <RolesTab />}
            {activeTab === 'maintenance' && <MaintenanceTab />}
            {activeTab === 'logs' && <LogsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de pestaña de Resumen
function OverviewTab() {
  const [stats, setStats] = useState({
    memberCount: 0,
    onlineCount: 0,
    bannedCount: 0,
    todayActions: 0,
    mutedCount: 0,
    channelsCount: 0,
    rolesCount: 0
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const [memberRes, widgetRes, bannedRes, rolesRes] = await Promise.all([
        fetch(apiUrl('/api/membercount')),
        fetch(apiUrl('/api/widget')),
        fetch(apiUrl('/api/discord/banned')),
        fetch(apiUrl('/api/discord/roles'))
      ]);
      
      const memberData = await memberRes.json();
      const widgetData = await widgetRes.json();
      const bannedData = await bannedRes.json();
      const rolesData = await rolesRes.json();
      
      setStats({
        memberCount: memberData.memberCount || 0,
        onlineCount: widgetData.presence_count || 0,
        bannedCount: bannedData.count || bannedData.bans?.length || 0,
        todayActions: logs.length,
        mutedCount: 0, // Se calculará si hay endpoint específico
        channelsCount: 0, // Se calculará si hay endpoint específico
        rolesCount: rolesData.roles?.length || 0
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(apiUrl('/api/discord/logs'));
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaChartLine /> Resumen del Servidor</h2>
        <p>Estadísticas generales y estado del servidor</p>
        <div className="header-actions">
          <button 
            onClick={fetchStats} 
            className="btn-secondary" 
            disabled={loading}
          >
            <FaCog /> {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Miembros Totales</h3>
            <p className="stat-value">{loading ? 'Cargando...' : stats.memberCount}</p>
            <span className="stat-label">Usuarios registrados</span>
          </div>
      </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBell />
        </div>
          <div className="stat-content">
            <h3>En Línea</h3>
            <p className="stat-value">{loading ? 'Cargando...' : stats.onlineCount}</p>
            <span className="stat-label">Usuarios activos</span>
        </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBan />
        </div>
          <div className="stat-content">
            <h3>Baneados</h3>
            <p className="stat-value">{loading ? 'Cargando...' : stats.bannedCount}</p>
            <span className="stat-label">Usuarios sancionados</span>
        </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaGavel />
        </div>
          <div className="stat-content">
            <h3>Acciones Hoy</h3>
            <p className="stat-value">{loading ? 'Cargando...' : logs.length}</p>
            <span className="stat-label">Moderaciones</span>
        </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUserShield />
        </div>
          <div className="stat-content">
            <h3>Roles</h3>
            <p className="stat-value">{loading ? 'Cargando...' : stats.rolesCount}</p>
            <span className="stat-label">Roles del servidor</span>
        </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaVolumeMute />
        </div>
          <div className="stat-content">
            <h3>Muteados</h3>
            <p className="stat-value">{loading ? 'Cargando...' : stats.mutedCount}</p>
            <span className="stat-label">Usuarios silenciados</span>
        </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCog />
        </div>
          <div className="stat-content">
            <h3>Última Actualización</h3>
            <p className="stat-value">{loading ? 'Cargando...' : lastUpdate.toLocaleTimeString()}</p>
            <span className="stat-label">Datos en tiempo real</span>
        </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Actividad Reciente</h3>
        <div className="activity-list">
          {logs.length > 0 ? (
            <ul>
              {logs.slice(0, 5).map((log, i) => (
                <li key={i}>
                  <strong>{log.action}</strong> - {log.user} - {log.target} - {new Date(log.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay actividad reciente</p>
        )}
      </div>
      </div>
    </div>
  );
}

// Componente de pestaña de Moderación
function ModerationTab() {
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [muteTime, setMuteTime] = useState('60');
  const [massIds, setMassIds] = useState('');
  const [massAction, setMassAction] = useState('kick');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/ban'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });
      const data = await res.json();
      setResult(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setResult('❌ Error al banear usuario');
    }
    setLoading(false);
  };

  const handleKick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/kick'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setResult(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setResult('❌ Error al kickear usuario');
    }
    setLoading(false);
  };

  const handleMute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/mute'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, time: muteTime, reason })
      });
      const data = await res.json();
      setResult(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setResult('❌ Error al mutear usuario');
    }
    setLoading(false);
  };

  const handleUnban = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/unban'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setResult(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setResult('❌ Error al desbanear usuario');
    }
    setLoading(false);
  };

  const handleMass = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    const ids = massIds.split(',').map(id => id.trim()).filter(Boolean);
    try {
      const res = await fetch(apiUrl('/api/discord/mass-action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: ids, action: massAction, reason: reason })
      });
      const data = await res.json();
      if (data.success) {
        const results = data.results.map(r => 
          `${r.userId}: ${r.success ? `✅ ${r.action}` : `❌ ${r.error}`}`
        ).join('\n');
        setResult(`✅ Acción masiva completada:\n${data.successful}/${data.total} exitosos\n\nResultados:\n${results}`);
      } else {
        setResult(`❌ ${data.error}`);
      }
    } catch (err) {
      setResult('❌ Error en acción masiva');
    }
    setLoading(false);
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaGavel /> Herramientas de Moderación</h2>
        <p>Gestiona usuarios y mantén el orden en el servidor</p>
        </div>
      
      <div className="moderation-tools">
        {/* Banear Usuario */}
        <div className="tool-section">
          <h3><FaBan /> Banear Usuario</h3>
          <form onSubmit={handleBan}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={userId} 
                onChange={e => setUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
        </div>
            <div className="form-group">
              <label>Motivo</label>
              <input 
                type="text" 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo del baneo" 
                required 
              />
        </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <FaBan /> {loading ? 'Baneando...' : 'Banear Usuario'}
        </button>
      </form>
        </div>

        {/* Kickear Usuario */}
        <div className="tool-section">
          <h3><FaUserTimes /> Kickear Usuario</h3>
          <form onSubmit={handleKick}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={userId} 
                onChange={e => setUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
        </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <FaUserTimes /> {loading ? 'Kickeando...' : 'Kickear Usuario'}
            </button>
          </form>
        </div>

        {/* Mutear Usuario */}
        <div className="tool-section">
          <h3><FaVolumeMute /> Mutear Usuario</h3>
          <form onSubmit={handleMute}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={userId} 
                onChange={e => setUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
        </div>
            <div className="form-group">
              <label>Tiempo (minutos)</label>
              <input 
                type="number" 
                value={muteTime} 
                onChange={e => setMuteTime(e.target.value)}
                placeholder="60" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Motivo</label>
              <input 
                type="text" 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo del mute" 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <FaVolumeMute /> {loading ? 'Muteando...' : 'Mutear Usuario'}
        </button>
      </form>
        </div>

        {/* Desbanear Usuario */}
        <div className="tool-section">
          <h3><FaUndo /> Desbanear Usuario</h3>
          <form onSubmit={handleUnban}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={userId} 
                onChange={e => setUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
        </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <FaUndo /> {loading ? 'Desbaneando...' : 'Desbanear Usuario'}
        </button>
      </form>
        </div>

        {/* Acciones Masivas */}
        <div className="tool-section">
          <h3><FaUsers /> Acciones Masivas</h3>
          <form onSubmit={handleMass}>
            <div className="form-group">
              <label>IDs de usuarios (separados por coma)</label>
              <textarea 
                value={massIds} 
                onChange={e => setMassIds(e.target.value)}
                placeholder="123456789, 987654321, ..." 
                required 
              />
        </div>
            <div className="form-group">
              <label>Acción</label>
              <select 
                value={massAction} 
                onChange={e => setMassAction(e.target.value)}
              >
                <option value="kick">Kickear</option>
                <option value="ban">Banear</option>
                <option value="mute">Mutear</option>
              </select>
            </div>
            <div className="form-group">
              <label>Motivo (opcional)</label>
              <input 
                type="text" 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo de la acción masiva" 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <FaGavel /> {loading ? 'Ejecutando...' : 'Ejecutar Acción Masiva'}
        </button>
      </form>
        </div>

        {/* Resultado */}
        {result && (
          <div className="result-message">
            <pre>{result}</pre>
        </div>
      )}
      </div>
    </div>
  );
}

// Componente de pestaña de Comunicación
function CommunicationTab() {
  const [dmUserId, setDmUserId] = useState('');
  const [dmType, setDmType] = useState('text');
  const [dmMessage, setDmMessage] = useState('');
  const [dmEmbedTitle, setDmEmbedTitle] = useState('');
  const [dmEmbedDesc, setDmEmbedDesc] = useState('');
  const [dmImageUrl, setDmImageUrl] = useState('');
  const [dmResult, setDmResult] = useState('');
  const [dmLoading, setDmLoading] = useState(false);
  const [dmReplies, setDmReplies] = useState([]);
  const [dmRepliesLoading, setDmRepliesLoading] = useState(false);

  const handleSendDM = async (e) => {
    e.preventDefault();
    setDmLoading(true);
    setDmResult('');
    
    if (!dmUserId.trim()) {
      setDmResult('❌ Debes ingresar el ID de usuario');
      setDmLoading(false);
      return;
    }
    
    if (dmType === 'text' && !dmMessage.trim()) {
      setDmResult('❌ Debes escribir el mensaje');
      setDmLoading(false);
      return;
    }
    
    if (dmType === 'embed' && (!dmEmbedTitle.trim() || !dmEmbedDesc.trim())) {
      setDmResult('❌ Debes completar título y descripción del embed');
      setDmLoading(false);
      return;
    }

    try {
      const body = dmType === 'text'
        ? { userId: dmUserId.trim(), type: 'text', message: dmMessage.trim(), imageUrl: dmImageUrl }
        : { userId: dmUserId.trim(), type: 'embed', embed: { title: dmEmbedTitle.trim(), description: dmEmbedDesc.trim() }, imageUrl: dmImageUrl };
      
      const res = await fetch(apiUrl('/api/discord/senddm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      setDmResult(data.success ? '✅ Mensaje enviado correctamente' : `❌ ${data.error || 'Error'}`);
    } catch (err) {
      setDmResult('❌ Error al enviar mensaje');
    }
    setDmLoading(false);
  };

  const fetchDmReplies = async (userId) => {
    setDmRepliesLoading(true);
    try {
      const res = await fetch(`/api/discord/dmreplies/${userId}`);
      const data = await res.json();
      setDmReplies(data.replies || []);
    } catch (err) {
      setDmReplies([]);
    }
    setDmRepliesLoading(false);
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaEnvelope /> Comunicación</h2>
        <p>Envía mensajes directos y gestiona la comunicación</p>
        </div>
      
      <div className="communication-tools">
        <div className="tool-section">
          <h3><FaEnvelope /> Enviar Mensaje Directo</h3>
          <form onSubmit={handleSendDM}>
            <div className="form-group">
              <label>ID de usuario destino</label>
              <input 
                type="text" 
                value={dmUserId} 
                onChange={e => setDmUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
              <button 
                type="button" 
                onClick={() => fetchDmReplies(dmUserId)}
                className="btn-secondary"
                style={{ marginTop: '0.5rem' }}
              >
                <FaSearch /> Ver respuestas
        </button>
        </div>
            
            <div className="form-group">
              <label>Tipo de mensaje</label>
              <select 
                value={dmType} 
                onChange={e => setDmType(e.target.value)}
              >
                <option value="text">Texto simple</option>
                <option value="embed">Embed</option>
              </select>
        </div>

            {dmType === 'text' ? (
              <div className="form-group">
                <label>Mensaje</label>
                <textarea 
                  value={dmMessage} 
                  onChange={e => setDmMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..." 
                  required 
                />
        </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Título del embed</label>
                  <input 
                    type="text" 
                    value={dmEmbedTitle} 
                    onChange={e => setDmEmbedTitle(e.target.value)}
                    placeholder="Título" 
                    required 
                  />
        </div>
                <div className="form-group">
                  <label>Descripción del embed</label>
                  <textarea 
                    value={dmEmbedDesc} 
                    onChange={e => setDmEmbedDesc(e.target.value)}
                    placeholder="Descripción..." 
                    required 
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>URL de imagen (opcional)</label>
              <input 
                type="text" 
                value={dmImageUrl} 
                onChange={e => setDmImageUrl(e.target.value)}
                placeholder="https://..." 
              />
        </div>

            <button type="submit" className="btn-primary" disabled={dmLoading}>
              <FaEnvelope /> {dmLoading ? 'Enviando...' : 'Enviar MD'}
        </button>
      </form>

          {dmResult && (
            <div className="result-message">
              {dmResult}
            </div>
          )}

          {/* Respuestas del usuario */}
          {dmRepliesLoading ? (
            <div className="loading-message">Cargando respuestas...</div>
          ) : dmReplies.length > 0 ? (
            <div className="dm-replies">
              <h4>Respuestas del usuario:</h4>
              <ul>
                {dmReplies.map((reply, i) => (
                  <li key={i}>
                    <strong>{new Date(reply.timestamp).toLocaleString()}:</strong> {reply.content}
                  </li>
                ))}
              </ul>
        </div>
          ) : dmUserId && (
            <div className="no-replies">No hay respuestas recientes de este usuario</div>
          )}
        </div>

        <div className="tool-section">
          <h3><FaClipboardList /> Recolector de DMs</h3>
          <GlobalDMCollectorPanel />
        </div>
      </div>
    </div>
  );
}

// Componente de pestaña de Roles
function RolesTab() {
  const [roleUserId, setRoleUserId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roleAction, setRoleAction] = useState('add');
  const [roleResult, setRoleResult] = useState('');
  const [rolesList, setRolesList] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  
  // Roles temporales
  const [tempRoleUserId, setTempRoleUserId] = useState('');
  const [tempRoleId, setTempRoleId] = useState('');
  const [tempRoleTime, setTempRoleTime] = useState('60');
  const [tempRoleResult, setTempRoleResult] = useState('');
  const [tempRoleLoading, setTempRoleLoading] = useState(false);
  
  // Roles múltiples
  const [multiRoleUserId, setMultiRoleUserId] = useState('');
  const [multiRoles, setMultiRoles] = useState([]);
  const [multiRoleAction, setMultiRoleAction] = useState('add');
  const [multiRoleResult, setMultiRoleResult] = useState('');
  const [multiRoleLoading, setMultiRoleLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch(apiUrl('/api/discord/roles'));
      const data = await res.json();
      setRolesList(data.roles || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleRole = async (e) => {
    e.preventDefault();
    setRoleLoading(true);
    setRoleResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/role'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: roleUserId, roleId, action: roleAction })
      });
      const data = await res.json();
      setRoleResult(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setRoleResult('❌ Error al cambiar rol');
    }
    setRoleLoading(false);
  };

  const handleTempRole = async (e) => {
    e.preventDefault();
    setTempRoleLoading(true);
    setTempRoleResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/temprole'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempRoleUserId, roleId: tempRoleId, time: tempRoleTime })
      });
      const data = await res.json();
      setTempRoleResult(data.message ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setTempRoleResult('❌ Error en rol temporal');
    }
    setTempRoleLoading(false);
  };

  const handleMultiRole = async (e) => {
    e.preventDefault();
    setMultiRoleLoading(true);
    setMultiRoleResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/multirole'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: multiRoleUserId, roleIds: multiRoles, action: multiRoleAction })
      });
      const data = await res.json();
      if (data.results) {
        const results = data.results.map(r => 
          `${r.roleId}: ${r.success ? '✅' : `❌ ${r.error}`}`
        ).join('\n');
        setMultiRoleResult(`Resultados:\n${results}`);
      } else {
        setMultiRoleResult(`❌ ${data.error}`);
      }
    } catch (err) {
      setMultiRoleResult('❌ Error en roles múltiples');
    }
    setMultiRoleLoading(false);
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaUserShield /> Gestión de Roles</h2>
        <p>Administra roles y permisos del servidor</p>
      </div>
      
      <div className="roles-tools">
        <div className="tool-section">
          <h3><FaUserShield /> Cambiar Rol Individual</h3>
          <form onSubmit={handleRole}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={roleUserId} 
                onChange={e => setRoleUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select 
                value={roleId} 
                onChange={e => setRoleId(e.target.value)}
                required
              >
                <option value="">Selecciona un rol</option>
                {rolesList.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
            <div className="form-group">
              <label>Acción</label>
              <select 
                value={roleAction} 
                onChange={e => setRoleAction(e.target.value)}
              >
            <option value="add">Añadir rol</option>
            <option value="remove">Quitar rol</option>
          </select>
        </div>
            <button type="submit" className="btn-primary" disabled={roleLoading}>
              <FaUserShield /> {roleLoading ? 'Procesando...' : 'Cambiar Rol'}
        </button>
      </form>
      {roleResult && (
            <div className="result-message">{roleResult}</div>
          )}
      </div>

        <div className="tool-section">
          <h3><FaCog /> Roles Temporales</h3>
          <form onSubmit={handleTempRole}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={tempRoleUserId} 
                onChange={e => setTempRoleUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
            </div>
            <div className="form-group">
              <label>ID de rol</label>
              <input 
                type="text" 
                value={tempRoleId} 
                onChange={e => setTempRoleId(e.target.value)}
                placeholder="ID del rol" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Tiempo (minutos)</label>
              <input 
                type="number" 
                value={tempRoleTime} 
                onChange={e => setTempRoleTime(e.target.value)}
                placeholder="60" 
                required 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={tempRoleLoading}>
              <FaUserShield /> {tempRoleLoading ? 'Asignando...' : 'Asignar Rol Temporal'}
        </button>
          </form>
          {tempRoleResult && (
            <div className="result-message">{tempRoleResult}</div>
          )}
        </div>

        <div className="tool-section">
          <h3><FaUsers /> Roles Múltiples</h3>
          <form onSubmit={handleMultiRole}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={multiRoleUserId} 
                onChange={e => setMultiRoleUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Roles (mantén Ctrl para seleccionar múltiples)</label>
              <select 
                multiple 
                value={multiRoles} 
                onChange={e => setMultiRoles(Array.from(e.target.selectedOptions, opt => opt.value))}
                style={{ height: '120px' }}
                required
              >
                {rolesList.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Acción</label>
              <select 
                value={multiRoleAction} 
                onChange={e => setMultiRoleAction(e.target.value)}
              >
                <option value="add">Añadir roles</option>
                <option value="remove">Quitar roles</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={multiRoleLoading}>
              <FaUserShield /> {multiRoleLoading ? 'Procesando...' : 'Gestionar Roles Múltiples'}
            </button>
          </form>
          {multiRoleResult && (
            <div className="result-message">
              <pre>{multiRoleResult}</pre>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// Componente de pestaña de Logs
function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [commandLogs, setCommandLogs] = useState([]);
  const [bannedList, setBannedList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/discord/logs'));
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
    setLoading(false);
  };

  // Auto-refresh cada 30 segundos si está activado
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchCommandLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/discord/commandlog'));
      const data = await res.json();
      setCommandLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching command logs:', err);
    }
    setLoading(false);
  };

  const fetchBannedList = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/discord/banned'));
      const data = await res.json();
      setBannedList(data.bans || []);
    } catch (err) {
      console.error('Error fetching banned list:', err);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.action.toLowerCase().includes(filter.toLowerCase())
  );

  // Enlace a logs backend solo para admins
  // Se puede mejorar con un control de permisos si tienes el user en contexto
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaHistory /> Logs y Auditoría</h2>
        <p>Revisa el historial de acciones y eventos</p>
        <div style={{marginTop:'0.7rem',textAlign:'right'}}>
          <a href="/logs" target="_blank" rel="noopener noreferrer" style={{color:'#FFD700',fontWeight:600,textDecoration:'underline',fontSize:'1rem'}}>
            Ver logs avanzados del sistema (solo admins)
          </a>
        </div>
      </div>
      <div className="logs-tools">
        <div className="tool-section">
          <h3><FaGavel /> Logs de Moderación</h3>
          <div className="logs-container">
            <div className="log-filters">
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">Todas las acciones</option>
                <option value="ban">Bans</option>
                <option value="kick">Kicks</option>
                <option value="mute">Mutes</option>
                <option value="role">Roles</option>
              </select>
              <button onClick={fetchLogs} className="btn-primary" disabled={loading}>
                <FaHistory /> {loading ? 'Cargando...' : 'Cargar Logs'}
              </button>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)} 
                className={`btn-secondary ${autoRefresh ? 'active' : ''}`}
              >
                <FaBell /> {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
            <div className="logs-list">
              {logs.length > 0 ? (
                <div className="logs-grid">
                  {filteredLogs.map((log, i) => (
                    <div key={i} className={`log-item log-${log.action?.toLowerCase() || 'unknown'}`}>
                      <div className="log-header">
                        <span className="log-action">{log.action}</span>
                        <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="log-content">
                        <p><strong>Moderador:</strong> {log.user}</p>
                        <p><strong>Objetivo:</strong> {log.target}</p>
                        {log.reason && <p><strong>Motivo:</strong> {log.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <FaHistory size={48} />
                  <p>No hay logs disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tool-section">
          <h3><FaClipboardList /> Logs de Comandos</h3>
          <div className="command-logs">
            <button onClick={fetchCommandLogs} className="btn-primary" disabled={loading}>
              <FaHistory /> {loading ? 'Cargando...' : 'Cargar Logs de Comandos'}
            </button>
            <div className="logs-list">
              {commandLogs.length > 0 ? (
                <ul>
                  {commandLogs.map((log, i) => (
                    <li key={i}>
                      <strong>{log.command}</strong> - {log.user} - {new Date(log.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay comandos registrados</p>
              )}
            </div>
          </div>
        </div>

        <div className="tool-section">
          <h3><FaBan /> Lista de Baneados</h3>
          <div className="banned-list">
            <button onClick={fetchBannedList} className="btn-primary" disabled={loading}>
              <FaBan /> {loading ? 'Cargando...' : 'Cargar Lista de Baneados'}
            </button>
            <div className="logs-list">
              {bannedList.length > 0 ? (
                <div className="banned-grid">
                  {bannedList.map((ban, i) => (
                    <div key={i} className="banned-card">
                      <div className="banned-avatar">
                        <img 
                          src={ban.avatar || `https://cdn.discordapp.com/embed/avatars/${ban.user.discriminator % 5}.png`} 
                          alt={ban.user.username}
                          onError={(e) => {
                            e.target.src = `https://cdn.discordapp.com/embed/avatars/${ban.user.discriminator % 5}.png`;
                          }}
                        />
                      </div>
                      <div className="banned-info">
                        <h4>{ban.user.username}#{ban.user.discriminator}</h4>
                        <p className="banned-id">ID: {ban.user.id}</p>
                        <p className="banned-reason">
                          <strong>Motivo:</strong> {ban.reason || 'Sin motivo especificado'}
                        </p>
                        <p className="banned-date">
                          <strong>Baneado:</strong> {new Date(ban.bannedAt).toLocaleString()}
                        </p>
                        <div className="banned-actions">
                          <button 
                            className="btn-secondary btn-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(ban.user.id);
                              showToast('ID copiado al portapapeles');
                            }}
                          >
                            <FaCopy /> Copiar ID
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <FaBan size={48} />
                  <p>No hay usuarios baneados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de pestaña de Mantenimiento
function MaintenanceTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaTools /> Control de Mantenimiento</h2>
        <p>Gestiona el modo mantenimiento del servidor</p>
      </div>
      
      <MaintenanceControl showToast={(message, type) => {
        // Usar el showToast global del AdminPanel
        if (window.showAdminToast) {
          window.showAdminToast(message, type);
        }
      }} />
    </div>
  );
}

// Componente de pestaña de Configuración
function SettingsTab() {
  const [blockChannelId, setBlockChannelId] = useState('');
  const [blockRoleId, setBlockRoleId] = useState('');
  const [blockAction, setBlockAction] = useState('block');
  const [blockResult, setBlockResult] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);
  
  // Notas internas
  const [noteUserId, setNoteUserId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteResult, setNoteResult] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const handleBlockChannel = async (e) => {
    e.preventDefault();
    setBlockLoading(true);
    setBlockResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/blockchannel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: blockChannelId, roleId: blockRoleId, action: blockAction })
      });
      const data = await res.json();
      setBlockResult(data.message ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setBlockResult('❌ Error en bloqueo de canal');
    }
    setBlockLoading(false);
  };

  const handleNote = async (e) => {
    e.preventDefault();
    setNoteLoading(true);
    setNoteResult('');
    try {
      const res = await fetch(apiUrl('/api/discord/note'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: noteUserId, note: noteText })
      });
      const data = await res.json();
      setNoteResult(data.success ? '✅ Nota guardada correctamente' : `❌ ${data.error}`);
    } catch (err) {
      setNoteResult('❌ Error al guardar nota');
    }
    setNoteLoading(false);
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaCog /> Configuración</h2>
        <p>Configura las opciones del panel de administración</p>
      </div>
      
      <div className="settings-tools">
        <div className="tool-section">
          <h3><FaShieldAlt /> Permisos de Canales</h3>
          <PermissionsPanel />
        </div>

        <div className="tool-section">
          <h3><FaBan /> Bloqueo de Canales</h3>
          <form onSubmit={handleBlockChannel}>
            <div className="form-group">
              <label>ID de canal</label>
              <input 
                type="text" 
                value={blockChannelId} 
                onChange={e => setBlockChannelId(e.target.value)}
                placeholder="ID del canal" 
                required 
              />
            </div>
            <div className="form-group">
              <label>ID de rol</label>
              <input 
                type="text" 
                value={blockRoleId} 
                onChange={e => setBlockRoleId(e.target.value)}
                placeholder="ID del rol" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Acción</label>
              <select 
                value={blockAction} 
                onChange={e => setBlockAction(e.target.value)}
              >
                <option value="block">Bloquear</option>
                <option value="unblock">Desbloquear</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={blockLoading}>
              <FaBan /> {blockLoading ? 'Procesando...' : 'Gestionar Canal'}
            </button>
          </form>
          {blockResult && (
            <div className="result-message">{blockResult}</div>
          )}
        </div>

        <div className="tool-section">
          <h3><FaClipboardList /> Notas Internas</h3>
          <form onSubmit={handleNote}>
            <div className="form-group">
              <label>ID de usuario</label>
              <input 
                type="text" 
                value={noteUserId} 
                onChange={e => setNoteUserId(e.target.value)}
                placeholder="ID de Discord" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Nota</label>
              <textarea 
                value={noteText} 
                onChange={e => setNoteText(e.target.value)}
                placeholder="Escribe una nota interna sobre este usuario..." 
                required 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={noteLoading}>
              <FaClipboardList /> {noteLoading ? 'Guardando...' : 'Guardar Nota'}
            </button>
          </form>
          {noteResult && (
            <div className="result-message">{noteResult}</div>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <div className="toast-content">
            <span>{toast.message}</span>
          </div>
          <button 
            className="toast-close" 
            onClick={() => setToast({ message: '', type: 'success' })}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
// Componente de pestaña de Analytics
function AnalyticsTab() {
  const [metrics, setMetrics] = useState({
    visitors: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      unique: 0,
      returning: 0
    },
    performance: {
      pageLoadTime: 0,
      serverResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      uptime: 0
    },
    content: {
      mostVisitedPages: [],
      popularSearches: [],
      userEngagement: 0,
      bounceRate: 0,
      sessionDuration: 0
    },
    security: {
      blockedRequests: 0,
      suspiciousActivities: 0,
      failedLogins: 0,
      spamDetected: 0,
      securityScore: 0
    },
    system: {
      memoryUsage: 0,
      cpuUsage: 0,
      diskUsage: 0,
      activeConnections: 0,
      databaseSize: 0
    }
  });

  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch metrics data
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('spainrp_token');
      
      if (!token) {
        console.error('[ANALYTICS] No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(apiUrl('/api/analytics/metrics'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[ANALYTICS] Datos recibidos:', data);
      
      // Validar que los datos tengan la estructura esperada
      const safeMetrics = {
        visitors: data.visitors || { total: 0, unique: 0, online: 0 },
        performance: data.performance || { 
          avgResponseTime: 0, 
          serverResponseTimes: [],
          errorRate: 0 
        },
        content: data.content || { 
          popularPages: [], 
          popularSearches: [],
          totalPageViews: 0 
        },
        security: data.security || { 
          blockedIPs: [], 
          suspiciousActivity: [],
          totalBlocked: 0 
        },
        system: data.system || { 
          cacheHitRate: 0, 
          memoryUsage: 0,
          uptime: 0 
        }
      };
      
      setMetrics(safeMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('[ANALYTICS] Error fetching metrics:', error);
      // Mostrar mensaje de error al usuario
      alert(`Error cargando analytics: ${error.message}`);
    }
    setLoading(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Mostrar loading si está cargando
  if (loading && !metrics.visitors) {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2><FaChartLine /> Analytics y Métricas</h2>
          <p>Cargando datos de analytics...</p>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '18px',
          color: '#666'
        }}>
          <FaCog className="spinning" style={{ marginRight: '10px' }} />
          Obteniendo métricas del servidor...
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2><FaChartLine /> Analytics y Métricas</h2>
        <p>Monitoreo completo del rendimiento y uso de la web</p>
        <div className="header-actions">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
          <button onClick={fetchMetrics} disabled={loading}>
            <FaCog /> {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'active' : ''}
          >
            <FaBell /> Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Métricas de Visitantes */}
      <div className="metrics-section">
        <h3><FaUsers /> Visitantes</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Total Visitantes</h4>
            <p className="metric-value">{metrics.visitors.total.toLocaleString()}</p>
            <span className="metric-change positive">+{metrics.visitors.today} hoy</span>
          </div>
          <div className="metric-card">
            <h4>Visitantes Únicos</h4>
            <p className="metric-value">{metrics.visitors.unique.toLocaleString()}</p>
            <span className="metric-change positive">+{metrics.visitors.returning} recurrentes</span>
          </div>
          <div className="metric-card">
            <h4>Esta Semana</h4>
            <p className="metric-value">{metrics.visitors.thisWeek.toLocaleString()}</p>
            <span className="metric-change positive">+12% vs anterior</span>
          </div>
          <div className="metric-card">
            <h4>Este Mes</h4>
            <p className="metric-value">{metrics.visitors.thisMonth.toLocaleString()}</p>
            <span className="metric-change positive">+8% vs anterior</span>
          </div>
        </div>
      </div>

      {/* Métricas de Rendimiento */}
      <div className="metrics-section">
        <h3><FaChartLine /> Rendimiento</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Tiempo de Carga</h4>
            <p className="metric-value">{metrics.performance.pageLoadTime}ms</p>
            <span className="metric-change positive">-15% vs anterior</span>
          </div>
          <div className="metric-card">
            <h4>Respuesta del Servidor</h4>
            <p className="metric-value">{metrics.performance.serverResponseTime}ms</p>
            <span className="metric-change positive">-8% vs anterior</span>
          </div>
          <div className="metric-card">
            <h4>Cache Hit Rate</h4>
            <p className="metric-value">{metrics.performance.cacheHitRate}%</p>
            <span className="metric-change positive">+5% vs anterior</span>
          </div>
          <div className="metric-card">
            <h4>Tasa de Errores</h4>
            <p className="metric-value">{metrics.performance.errorRate}%</p>
            <span className="metric-change negative">+2% vs anterior</span>
          </div>
          <div className="metric-card">
            <h4>Uptime</h4>
            <p className="metric-value">{metrics.performance.uptime}%</p>
            <span className="metric-change positive">+0.1% vs anterior</span>
          </div>
        </div>
      </div>

      {/* Métricas de Contenido */}
      <div className="metrics-section">
        <h3><FaFileAlt /> Contenido Popular</h3>
        <div className="content-metrics">
          <div className="popular-pages">
            <h4>Páginas Más Visitadas</h4>
            <ul>
              {metrics.content.mostVisitedPages.map((page, i) => (
                <li key={i}>
                  <span className="page-name">{page.name}</span>
                  <span className="page-views">{page.views} visitas</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="popular-searches">
            <h4>Búsquedas Populares</h4>
            <ul>
              {metrics.content.popularSearches.map((search, i) => (
                <li key={i}>
                  <span className="search-term">{search.term}</span>
                  <span className="search-count">{search.count} veces</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Métricas de Seguridad */}
      <div className="metrics-section">
        <h3><FaShieldAlt /> Seguridad</h3>
        <div className="metrics-grid">
          <div className="metric-card security">
            <h4>Requests Bloqueados</h4>
            <p className="metric-value">{metrics.security.blockedRequests}</p>
            <span className="metric-change positive">+{metrics.security.blockedRequests} hoy</span>
          </div>
          <div className="metric-card security">
            <h4>Actividades Sospechosas</h4>
            <p className="metric-value">{metrics.security.suspiciousActivities}</p>
            <span className="metric-change negative">+{metrics.security.suspiciousActivities} hoy</span>
          </div>
          <div className="metric-card security">
            <h4>Logins Fallidos</h4>
            <p className="metric-value">{metrics.security.failedLogins}</p>
            <span className="metric-change negative">+{metrics.security.failedLogins} hoy</span>
          </div>
          <div className="metric-card security">
            <h4>Spam Detectado</h4>
            <p className="metric-value">{metrics.security.spamDetected}</p>
            <span className="metric-change positive">+{metrics.security.spamDetected} bloqueado</span>
          </div>
          <div className="metric-card security">
            <h4>Puntuación de Seguridad</h4>
            <p className="metric-value">{metrics.security.securityScore}/100</p>
            <span className="metric-change positive">+5 vs anterior</span>
          </div>
        </div>
      </div>

      {/* Métricas del Sistema */}
      <div className="metrics-section">
        <h3><FaCog /> Sistema</h3>
        <div className="metrics-grid">
          <div className="metric-card system">
            <h4>Uso de Memoria</h4>
            <p className="metric-value">{metrics.system.memoryUsage}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${metrics.system.memoryUsage}%`}}></div>
            </div>
          </div>
          <div className="metric-card system">
            <h4>Uso de CPU</h4>
            <p className="metric-value">{metrics.system.cpuUsage}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${metrics.system.cpuUsage}%`}}></div>
            </div>
          </div>
          <div className="metric-card system">
            <h4>Uso de Disco</h4>
            <p className="metric-value">{metrics.system.diskUsage}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${metrics.system.diskUsage}%`}}></div>
            </div>
          </div>
          <div className="metric-card system">
            <h4>Conexiones Activas</h4>
            <p className="metric-value">{metrics.system.activeConnections}</p>
            <span className="metric-change positive">+{metrics.system.activeConnections} activas</span>
          </div>
          <div className="metric-card system">
            <h4>Tamaño de BD</h4>
            <p className="metric-value">{metrics.system.databaseSize}MB</p>
            <span className="metric-change positive">+{metrics.system.databaseSize}MB</span>
          </div>
        </div>
      </div>

      {/* Información de última actualización */}
      <div className="last-update">
        <p>Última actualización: {lastUpdate.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default AdminPanel;
