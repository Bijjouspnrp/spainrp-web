import React, { useEffect, useState } from "react";

const PREF_LOCAL_KEY = 'spainrp_adblock_dismissed_v1';

const AdBlockDetect = () => {
  const [adblock, setAdblock] = useState(false);
  const [visible, setVisible] = useState(true);
  const [checkedPref, setCheckedPref] = useState(false);

  useEffect(() => {
    // Detectar adblock con bait div + fetch fallback
    const bait = document.createElement("div");
    bait.className = "adsbox pub_300x250";
    bait.style.height = "1px";
    bait.style.position = "absolute";
    bait.style.left = "-999px";
    document.body.appendChild(bait);

    let detected = false;

    setTimeout(() => {
      if (window.getComputedStyle(bait).display === "none" || bait.offsetParent === null) {
        detected = true;
      }
      document.body.removeChild(bait);
      setAdblock(detected);
    }, 200);
  }, []);


  useEffect(() => {
    // Solo usar localStorage para guardar si el usuario ya cerró el aviso
    const local = localStorage.getItem(PREF_LOCAL_KEY);
    if (local === '1') setVisible(false);
  }, []);

  const persistDismiss = () => {
    localStorage.setItem(PREF_LOCAL_KEY, '1');
    setVisible(false);
  };

  if (!adblock || !visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "#ffecb3",
      color: "#333",
      padding: "12px",
      textAlign: "center",
      zIndex: 9999,
      boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem'
    }}>
      <span><strong>¡Detectamos AdBlock!</strong> Algunas funciones como estadísticas y analíticas pueden no funcionar correctamente. Si quieres apoyar el proyecto, desactívalo para SpainRP Web.</span>
  <button onClick={persistDismiss} style={{marginLeft:8,padding:'4px 12px',borderRadius:6,border:'none',background:'#7289da',color:'#fff',fontWeight:600,cursor:'pointer'}}>Cerrar</button>
    </div>
  );
};

export default AdBlockDetect;
