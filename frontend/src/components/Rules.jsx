
import React, { useState } from 'react';
import { FaDiscord, FaGlobe, FaUserSecret, FaCheckCircle, FaGavel, FaBookOpen, FaExclamationTriangle, FaArrowLeft, FaArrowRight, FaListUl } from 'react-icons/fa';
import './Rules.css';

// Cada normativa puede tener varias secciones si es larga
const RULES = [
  {
    key: 'discord',
    title: 'Normativas Discord',
    icon: <FaDiscord color="#7289da" size={32} style={{marginRight:10}} />,
    color: '#7289da',
    sections: [
      {
        title: 'Aviso y Jerarquía de Warns',
        icon: '📜',
        content: [
          'Toda infracción será motivo de Warn o sanción según la gravedad.',
          'Jerarquía de Warns:',
          '1 Warn: Advertencia Verbal',
          '2 Warns: Aislamiento 3h',
          '3 Warns: Ban Temporal 1 día Roblox',
          '4 Warns: Aislamiento 12h',
          '5 Warns: Ban Temporal 3 días Roblox',
          '6 Warns: Aislamiento 2 días',
          '7 Warns: Ban Temporal 7 días Roblox',
          '8 Warns: Inhabilitación hasta decisión del Staff',
          '9 Warns: Ban Apelable',
          '10 Warns: Ban Inapelable',
          'El Staff puede saltarse la jerarquía si lo considera necesario.'
        ]
      },
      {
        title: 'Respeto y Convivencia',
        icon: '🤝',
        content: [
          'Respeta a todos los miembros y staff.',
          'Prohibido insultar, bromas pesadas, temas polémicos (política, religión, sexo, etc).',
          'No cuestionar públicamente al staff, usa tickets para quejas.',
          'Respeta culturas, creencias y formas de hablar.'
        ]
      },
      {
        title: 'Contenido y Edad',
        icon: '🖼️',
        content: [
          'No +18 fuera de canales designados. Prohibido actos +18 en el servidor.',
          'No escenas de violencia extrema o temas perturbadores en roleplay.'
        ]
      },
      {
        title: 'Imágenes, Nombres y Multicuentas',
        icon: '👤',
        content: [
          'No multicuentas sin permiso.',
          'No nombres ofensivos, imitaciones o fotos inadecuadas.',
          'No pings abusivos.'
        ]
      },
      {
        title: 'Canales y Bots',
        icon: '💬',
        content: [
          'Usa cada canal para su propósito.',
          'No abusar de bots ni comandos.'
        ]
      },
      {
        title: 'Reportes y Tickets',
        icon: '📝',
        content: [
          'Quejas y reportes con pruebas, no uses tickets para bromas.',
          'El staff no está obligado a atender sin reporte válido.'
        ]
      },
      {
        title: 'Publicidad, Spam y Venta de Cuentas',
        icon: '🚫',
        content: [
          'Prohibido publicidad, spam, flood, venta/intercambio de cuentas.'
        ]
      },
      {
        title: 'Comportamiento Delictivo',
        icon: '⚠️',
        content: [
          'Prohibido amenazas, raids, hackeos, difundir datos personales, mentir a staff.',
          'Reporta bugs, no los explotes.'
        ]
      },
      {
        title: 'Normas Específicas',
        icon: '🔒',
        content: [
          'Prohibido suplantar identidad, incitación al odio, grooming, mal uso de voz, perjudicar reputación del servidor.'
        ]
      }
    ]
  },
  {
    key: 'web',
    title: 'Normativas Web',
    icon: <FaGlobe color="#00ff99" size={32} style={{marginRight:10}} />,
    color: '#00ff99',
    sections: [
      {
        title: 'Normas Web',
        icon: '🌐',
        content: [
          'No intentes vulnerar la seguridad de la web.',
          'No compartas tus credenciales con nadie.',
          'No uses la web para actividades ilícitas.',
          'Respeta la privacidad de los datos de otros usuarios.',
          'No abuses de bugs o errores, repórtalos al propietario de la web.',
          'No publiques contenido ofensivo o ilegal.'
        ]
      }
    ]
  },
  {
    key: 'role',
    title: 'Normativas de Roleplay',
    icon: <FaUserSecret color="#FFD700" size={32} style={{marginRight:10}} />,
    color: '#FFD700',
    sections: [
      {
        title: 'Aviso y Jerarquía de Warns',
        icon: '📜',
        content: [
          'Toda infracción será motivo de Advertencia o Warn.',
          'Jerarquía de Warns:',
          '1 Warn: Advertencia Verbal',
          '2 Warns: Aislamiento 3h',
          '3 Warns: Ban Temporal 24h Roblox',
          '4 Warns: Aislamiento 12h',
          '5 Warns: Ban 3 días Roblox + Discord',
          '6 Warns: Aislamiento 2 días',
          '7 Warns: Ban 7 días Roblox + Discord',
          '8 Warns: Inhabilitación hasta decisión del Staff',
          '9 Warns: Ban SpainRP (Apelable)',
          '10 Warns: Ban SpainRP (Inapelable)',
          'El Staff puede saltarse la jerarquía si lo considera necesario.'
        ]
      },
      {
        title: 'Conceptos Básicos',
        icon: '🔹',
        content: [
          'OOC: Todo lo que ocurre fuera del personaje/juego.',
          'IC: Todo lo que afecta a tu personaje dentro del rol.',
          'Rol de Entorno: Usa /entorno o el móvil para simular testigos en delitos públicos.'
        ]
      },
      {
        title: 'Acciones Prohibidas',
        icon: '🚫',
        content: [
          'MetaGaming (MG): Usar info OOC en IC.',
          'PowerGaming (PG): Forzar rol o hacer cosas irreales.',
          'Bad Driving (BD), Bunny Jump (BJ), DeathMatch (DM), Vehicle DeathMatch (VDM), Revenge Kill (RK), Bug Abuse (BA), Cuff Rushing (CF), No Valorar Vida (NVV), Evadir rol (ER), Invasión de HQ (IHQ), No rolear Herida (NRH), Nula Interpretación (NIP), Lag Abuse (LA), No Rolear Entorno (NRE), No Rolear Choque (NRC), Fair Play (FRP).'
        ]
      },
      {
        title: 'Mecánicas de Muerte',
        icon: '⚰️',
        content: [
          'PK: Pierdes memoria del rol actual, espera 35min para volver.',
          'PKT: Pierdes memoria sobre algo específico, no puedes regresar a ese grupo sin autorización o 1 día.',
          'CK: Muerte total del personaje, necesita aprobación del staff.'
        ]
      },
      {
        title: 'Interacción y Realismo',
        icon: '🎭',
        content: [
          'Valora tu vida como si fuera la tuya.',
          'No evadas rol (tirar cable, huir de zonas seguras, etc).',
          'Tras PK, no puedes volver a la misma zona/rol.',
          'No obligues a otros a rolear contigo.',
          'No interfieras en roles ajenos sin razón válida.',
          'Usa /me para acciones físicas y /do para entorno/estado.',
          'Prohibido coches eléctricos/exclusivos/premium (boosters).',
          'Incumplir ToS de Roblox = ban y reporte.'
        ]
      },
      {
        title: 'Notas',
        icon: '🛡️',
        content: [
          'El documento puede cambiar sin aviso.',
          'El staff tiene la última palabra en disputas.'
        ]
      }
    ]
  },
  {
    key: 'empresa',
    title: 'Normativa de Empresas',
    icon: <FaGlobe color="#f59e42" size={32} style={{marginRight:10}} />,
    color: '#f59e42',
    sections: [
      {
        title: 'Registro de Empresas',
        icon: '🏢',
        content: [
          'Todas las empresas deben estar registradas y aprobadas antes de operar.',
          'Proceso: Abrir ticket, completar plantilla y cumplir requisitos (no tapadera ilegal sin permiso, jefe ≥17 años).'
        ]
      },
      {
        title: 'Conducta Empresarial',
        icon: '🤝',
        content: [
          'Operar con ética y respeto a empleados/clientes.',
          'Cumplir políticas internas y normas del servidor.',
          'Prohibido fraude, glitches y roles incoherentes.'
        ]
      },
      {
        title: 'Contratación y Empleo',
        icon: '👥',
        content: [
          'Oposiciones semanales obligatorias y realistas.',
          'Contrato formal (rol Discord) para cada empleado.',
          'Mínimo 3 empleados, máximo 8 (ampliable a 12 con pago).',
          'Historial limpio y sistema de rangos (mín. 4 niveles).'
        ]
      },
      {
        title: 'Publicidad y Promociones',
        icon: '📢',
        content: [
          'Publicidad veraz, trato profesional y precios justos.',
          'Productos/servicios realistas, no ilegales/adultos.',
          'Anunciar horarios y aceptar sugerencias/reclamaciones.'
        ]
      },
      {
        title: 'Uso del Espacio Público',
        icon: '🌆',
        content: [
          'No bloquear accesos ni molestar a otros jugadores.',
          'Construcciones seguras y respetuosas con el entorno.'
        ]
      },
      {
        title: 'Resolución de Conflictos',
        icon: '⚖️',
        content: [
          'Resolver conflictos pacíficamente o con mediador staff.'
        ]
      },
      {
        title: 'Comportamiento Responsable',
        icon: '🧑‍💼',
        content: [
          'Seguir normas del servidor y usar sentido común.',
          'Evitar acciones que molesten/interfieran en el rol.'
        ]
      },
      {
        title: 'Expansiones y Desarrollo',
        icon: '🚀',
        content: [
          'Notificar y aprobar expansiones con encargado.',
          'Pagar materiales según normativa y anunciar cambios.'
        ]
      },
      {
        title: 'Actividad y Progreso',
        icon: '📈',
        content: [
          'Mantener actividad semanal (mín. 3h/semana, canal activo).',
          'Organizar eventos/promociones y mostrar progreso.'
        ]
      },
      {
        title: 'Sueldos y Finanzas',
        icon: '💸',
        content: [
          'Sueldos realistas (mín. 1350€), pagos semanales y gastos mensuales (750€).',
          'No usar fondos para fines personales/apuestas.',
          'Precios no pueden subir más de 10% cada 2 semanas.',
          'Propinas para el trabajador, pagos siempre al contado.'
        ]
      },
      {
        title: 'Bienes y Propiedades',
        icon: '🏠',
        content: [
          'Registrar bienes/propiedades en hoja accesible a staff.',
          'Vehículos registrados en SCAD, mínimo una propiedad y dos bienes.',
          'Prohibido bienes de origen ilegal.'
        ]
      },
      {
        title: 'Advertencias y Sanciones',
        icon: '⛔',
        content: [
          '3 sanciones = eliminación de la empresa.',
          'Anti-rol de empleados: responsable el jefe y posible expulsión.',
          'Sanciones apelables tras 1 mes.',
          'Inactividad >1 semana = eliminación.',
          'Máximo 6 empresas activas (más cupos se anunciarán).',
          'El staff puede sancionar por otros motivos si lo considera.'
        ]
      }
    ]
  }
];

export default function Rules() {
  const [modal, setModal] = useState(null); // key de la normativa
  const [section, setSection] = useState(0); // índice de sección

  const openModal = (key) => {
    setModal(key);
    setSection(0);
  };
  const closeModal = () => {
    setModal(null);
    setSection(0);
  };

  const rule = RULES.find(r => r.key === modal);
  const sections = rule?.sections || [];
  const current = sections[section] || null;

  return (
    <div className="rules-bg">
      <h1 className="rules-title"><FaBookOpen style={{marginRight:10}}/>Normativas del Servidor</h1>
      <div className="rules-cards">
        {RULES.map(rule => (
          <div
            key={rule.key}
            className="rules-card"
            style={{borderColor: rule.color}}
            onClick={() => openModal(rule.key)}
          >
            <div className="rules-card-icon">{rule.icon}</div>
            <div className="rules-card-title">{rule.title}</div>
            <div className="rules-card-arrow">→</div>
          </div>
        ))}
      </div>
      {modal && current && (
        <div className="rules-modal modal-enter" onClick={closeModal}>
          <div className="rules-modal-content content-enter" onClick={e => e.stopPropagation()}>
            <div className="rules-modal-header" style={{color: rule.color}}>
              <span style={{fontSize: '1.7rem', marginRight: 10}}>{current.icon}</span>
              <span>{current.title}</span>
            </div>
            <ul className="rules-list">
              {current.content.map((pt,i) => (
                <li key={i}><FaCheckCircle className="rules-list-icon" color={rule.color} /> {pt}</li>
              ))}
            </ul>
            <div className="rules-modal-nav">
              <button className="rules-modal-nav-btn" onClick={() => setSection(s => Math.max(0, s-1))} disabled={section === 0}><FaArrowLeft/> Anterior</button>
              <span className="rules-modal-nav-index"><FaListUl style={{marginRight:4}}/>{section+1} / {sections.length}</span>
              <button className="rules-modal-nav-btn" onClick={() => setSection(s => Math.min(sections.length-1, s+1))} disabled={section === sections.length-1}>Siguiente <FaArrowRight/></button>
            </div>
            <button className="rules-modal-close" onClick={closeModal}><FaGavel style={{marginRight:6}}/>Cerrar</button>
          </div>
        </div>
      )}
      <div className="rules-footer">
        <FaExclamationTriangle style={{marginRight:6}}/>El desconocimiento de las normas no exime de su cumplimiento.
      </div>
    </div>
  );
}
