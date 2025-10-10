import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  FaEye, FaSearch, FaDatabase, FaUser, FaIdCard, FaMoneyBillWave, 
  FaHistory, FaClipboardList, FaShieldAlt, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaTimes, FaCrown, FaGavel, FaLock, FaTrophy,
  FaUserShield, FaFileAlt, FaCarCrash, FaGlobe, FaChartLine,
  FaUsers, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaCalendarAlt, FaClock, FaFlag, FaKey, FaFingerprint, FaPlus,
  FaBars, FaChevronDown, FaChevronUp, FaQuestionCircle, FaInfoCircle,
  FaCog, FaExpand, FaCompress, FaAngleRight, FaAngleLeft,
  FaDownload, FaFilePdf, FaFileExcel, FaFileCsv, FaPrint,
  FaCloudDownloadAlt, FaArchive, FaBookmark, FaStar
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import { CNI_CONFIG, getLogoPath, getBestLogoPath, checkImageExists } from '../../config/cniConfig';
import './CNISection.css';
import './BusinessRecords.css';
import './CNIBlog.css';
import './CNIExport.css';

// Hook personalizado para caché avanzado (deshabilitado temporalmente)
/*
const useAdvancedCache = () => {
  const [cache, setCache] = useState(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: Date.now()
  });

  const getCachedData = useCallback((key) => {
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return cached.data;
    }
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [cache]);

  const setCachedData = useCallback((key, data, ttl = 300000) => {
    const expires = Date.now() + ttl;
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, { data, expires, created: Date.now() });
      return newCache;
    });
    setCacheStats(prev => ({ ...prev, size: cache.size + 1 }));
  }, [cache.size]);

  const clearExpiredCache = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map();
      let cleaned = 0;
      for (const [key, value] of prev) {
        if (value.expires > now) {
          newCache.set(key, value);
        } else {
          cleaned++;
        }
      }
      setCacheStats(prev => ({ 
        ...prev, 
        size: newCache.size,
        lastCleanup: now
      }));
      return newCache;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
    setCacheStats({ hits: 0, misses: 0, size: 0, lastCleanup: Date.now() });
  }, []);

  const getCacheStats = useCallback(() => {
    const hitRate = cacheStats.hits + cacheStats.misses > 0 
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2)
      : 0;
    return { ...cacheStats, hitRate };
  }, [cacheStats]);

  return {
    getCachedData,
    setCachedData,
    clearExpiredCache,
    clearCache,
    getCacheStats
  };
};
*/

// Hook para exportación de datos
const useDataExport = () => {
  const exportToPDF = useCallback(async (data, filename, title, type = 'general') => {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Configuración del documento
      doc.setProperties({
        title: title,
        subject: `Reporte CNI - ${type}`,
        author: 'Centro Nacional de Inteligencia',
        creator: 'SpainRP CNI System',
        keywords: 'CNI, Inteligencia, Clasificado, SpainRP'
      });

      // Función para agregar fondo con logo y marca de agua
      const addBackgroundElements = (pageNum) => {
        // Fondo con logo transparente como marca de agua
        doc.setGState(new doc.GState({opacity: 0.05}));
        doc.setFillColor(30, 58, 138); // Azul CNI
        doc.rect(0, 0, 210, 297, 'F');
        
        // Logo CNI como marca de agua (centro de la página)
        doc.setGState(new doc.GState({opacity: 0.08}));
        doc.setFontSize(120);
        doc.setTextColor(30, 58, 138);
        doc.text('CNI', 105 - doc.getTextWidth('CNI')/2, 150, { angle: 45 });
        
        // Texto "CLASIFICADO" en diagonal
        doc.setGState(new doc.GState({opacity: 0.15}));
        doc.setFontSize(60);
        doc.setTextColor(220, 38, 38); // Rojo para clasificado
        doc.text('CLASIFICADO', 105 - doc.getTextWidth('CLASIFICADO')/2, 200, { angle: -45 });
        
        // Restaurar opacidad normal
        doc.setGState(new doc.GState({opacity: 1}));
      };

      // Función para cargar imagen como Promise con alta resolución
      const loadImageAsDataURL = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              const { WIDTH: logoWidth, HEIGHT: logoHeight } = CNI_CONFIG.LOGO_PDF;
              
              // Usar alta resolución (4x) para evitar pixelado
              const highResFactor = 4;
              const highResWidth = logoWidth * highResFactor;
              const highResHeight = logoHeight * highResFactor;
              
              // Configurar canvas con alta resolución
              canvas.width = highResWidth;
              canvas.height = highResHeight;
              
              // Configurar contexto para alta calidad
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              
              // Dibujar imagen con alta resolución
              ctx.drawImage(img, 0, 0, highResWidth, highResHeight);
              
              // Convertir a data URL con calidad máxima
              const dataURL = canvas.toDataURL('image/png', 1.0);
              
              console.log(`[CNI] ✅ Logo convertido a data URL en alta resolución (${highResWidth}x${highResHeight})`);
              resolve(dataURL);
            } catch (error) {
              console.warn('[CNI] ⚠️ Error procesando imagen:', error);
              reject(error);
            }
          };
          
          img.onerror = () => {
            console.warn('[CNI] ⚠️ Error cargando imagen:', src);
            reject(new Error('Failed to load image'));
          };
          
          img.src = src;
        });
      };

      // Función de fallback para logo dibujado
      const addFallbackLogo = () => {
        console.log('[CNI] Usando logo de fallback programático');
        
        // Logo CNI circular más detallado
        const { X_POSITION: xPos, Y_POSITION: yPos } = CNI_CONFIG.LOGO_PDF;
        
        // Círculo exterior azul
        doc.setFillColor(30, 58, 138);
        doc.circle(xPos + 15, yPos + 15, 15, 'F');
        
        // Círculo interior blanco
        doc.setFillColor(255, 255, 255);
        doc.circle(xPos + 15, yPos + 15, 12, 'F');
        
        // Texto "ESPAÑA" en la parte superior
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont(undefined, 'bold');
        doc.text('ESPAÑA', xPos + 15, yPos + 8, { align: 'center' });
        
        // Texto "CNI" en el centro
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('CNI', xPos + 15, yPos + 18, { align: 'center' });
        
        // Globo estilizado en la parte inferior
        doc.setFillColor(100, 150, 200);
        doc.circle(xPos + 15, yPos + 22, 6, 'F');
        
        // Líneas de latitud/longitud
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(xPos + 9, yPos + 22, xPos + 21, yPos + 22); // Línea horizontal
        doc.line(xPos + 15, yPos + 16, xPos + 15, yPos + 28); // Línea vertical
        
        console.log('[CNI] ✅ Logo de fallback dibujado');
      };

      // Función para agregar encabezado profesional
      const addHeader = async () => {
        try {
          // Intentar cargar el logo PNG
          const logoPath = await getBestLogoPath();
          console.log('[CNI] Cargando logo desde:', logoPath);
          
          const logoDataURL = await loadImageAsDataURL(logoPath);
          
          // Agregar logo al PDF
          const { WIDTH: logoWidth, HEIGHT: logoHeight, X_POSITION: xPos, Y_POSITION: yPos } = CNI_CONFIG.LOGO_PDF;
          doc.addImage(logoDataURL, 'PNG', xPos, yPos, logoWidth, logoHeight);
          console.log('[CNI] ✅ Logo PNG agregado al PDF exitosamente');
          
        } catch (error) {
          console.warn('[CNI] ⚠️ Error cargando logo PNG, usando fallback:', error);
          addFallbackLogo();
        }
        
        // Título principal
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('CENTRO NACIONAL DE INTELIGENCIA', 50, 20);
        
        // Subtítulo
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(title, 50, 28);
        
        // Información del reporte
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 50, 35);
        doc.text(`Tipo de reporte: ${type.toUpperCase()}`, 50, 40);
        doc.text(`Clasificación: CONFIDENCIAL`, 50, 45);
        
        // Línea separadora con estilo
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(2);
        doc.line(15, 50, 195, 50);
        
        // Línea decorativa
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(1);
        doc.line(15, 52, 195, 52);
      };

      // Función para agregar pie de página profesional
      const addFooter = (pageNum, totalPages) => {
        const pageHeight = doc.internal.pageSize.height;
        
        // Línea superior del pie
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(1);
        doc.line(15, pageHeight - 25, 195, pageHeight - 25);
        
        // Información del pie
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${pageNum} de ${totalPages}`, 15, pageHeight - 15);
        
        // Firma del Director General
        doc.setTextColor(30, 58, 138);
        doc.setFont(undefined, 'bold');
        doc.text('Director General CNI', 195 - doc.getTextWidth('Director General CNI'), pageHeight - 15);
        
        // Fecha y hora
        doc.setTextColor(80, 80, 80);
        doc.setFont(undefined, 'normal');
        doc.text(new Date().toLocaleString('es-ES'), 195 - doc.getTextWidth(new Date().toLocaleString('es-ES')), pageHeight - 10);
        
        // Logo pequeño circular en el pie
        doc.setFillColor(30, 58, 138);
        doc.circle(22.5, pageHeight - 12.5, 6, 'F');
        
        // Círculo interior blanco
        doc.setFillColor(255, 255, 255);
        doc.circle(22.5, pageHeight - 12.5, 4, 'F');
        
        // Texto CNI en el logo del pie
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(6);
        doc.setFont(undefined, 'bold');
        doc.text('CNI', 22.5, pageHeight - 11);
      };

      // Agregar elementos de fondo y encabezado
      addBackgroundElements(1);
      await addHeader();

      let yPosition = 60;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      // Función para agregar nueva página si es necesario
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 40) {
          doc.addPage();
          addBackgroundElements(doc.internal.getNumberOfPages());
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Exportar según el tipo de datos
      switch (type) {
        case 'database':
          await exportDatabaseData(doc, data, yPosition, checkPageBreak);
          break;
        case 'tracking':
          await exportTrackingData(doc, data, yPosition, checkPageBreak);
          break;
        case 'business':
          await exportBusinessData(doc, data, yPosition, checkPageBreak);
          break;
        case 'blog':
          await exportBlogData(doc, data, yPosition, checkPageBreak);
          break;
        case 'players':
          await exportPlayersData(doc, data, yPosition, checkPageBreak);
          break;
        case 'vehicles':
          await exportVehiclesData(doc, data, yPosition, checkPageBreak);
          break;
        default:
          await exportGeneralData(doc, data, yPosition, checkPageBreak);
      }

      // Agregar pie de página a todas las páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
      }

      // Descargar el archivo
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      return { success: true, message: 'PDF generado correctamente' };
    } catch (error) {
      console.error('Error generando PDF:', error);
      return { success: false, message: 'Error generando PDF: ' + error.message };
    }
  }, []);

  const exportToExcel = useCallback(async (data, filename, title) => {
    try {
      // Importar XLSX dinámicamente
      const XLSX = await import('xlsx');
      
      // Preparar datos para Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      
      // Agregar metadatos
      workbook.Props = {
        Title: title,
        Subject: 'Reporte CNI',
        Author: 'Centro Nacional de Inteligencia',
        CreatedDate: new Date()
      };
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
      
      // Descargar archivo
      XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      return { success: true, message: 'Excel generado correctamente' };
    } catch (error) {
      console.error('Error generando Excel:', error);
      return { success: false, message: 'Error generando Excel: ' + error.message };
    }
  }, []);

  const exportToCSV = useCallback((data, filename, title) => {
    try {
      if (!data || data.length === 0) {
        return { success: false, message: 'No hay datos para exportar' };
      }

      // Convertir datos a CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'CSV generado correctamente' };
    } catch (error) {
      console.error('Error generando CSV:', error);
      return { success: false, message: 'Error generando CSV: ' + error.message };
    }
  }, []);

  return {
    exportToPDF,
    exportToExcel,
    exportToCSV
  };
};

// Funciones auxiliares para exportación de datos específicos
const exportDatabaseData = async (doc, data, yPosition, checkPageBreak) => {
  // Título de sección con estilo profesional
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.setFont(undefined, 'bold');
  doc.text('ESTADÍSTICAS DE BASE DE DATOS', 20, yPosition);
  yPosition += 12;
  
  // Línea decorativa bajo el título
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.line(20, yPosition, 100, yPosition);
  yPosition += 15;

  // Crear tabla de estadísticas
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  // Encabezado de la tabla
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 5, 170, 12, 'F');
  doc.setTextColor(30, 58, 138);
  doc.setFont(undefined, 'bold');
  doc.text('MÉTRICA', 25, yPosition + 2);
  doc.text('VALOR', 150, yPosition + 2);
  yPosition += 15;
  
  // Datos de la tabla
  doc.setFont(undefined, 'normal');
  Object.entries(data).forEach(([key, value], index) => {
    checkPageBreak(12);
    
    // Alternar colores de fila
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPosition - 5, 170, 10, 'F');
    }
    
    doc.setTextColor(60, 60, 60);
    doc.text(key.replace(/_/g, ' ').toUpperCase(), 25, yPosition + 2);
    doc.text(value.toLocaleString(), 150, yPosition + 2);
    yPosition += 12;
  });
};

const exportTrackingData = async (doc, data, yPosition, checkPageBreak) => {
  // Título de sección con estilo profesional
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.setFont(undefined, 'bold');
  doc.text('RESULTADOS DE RASTREO', 20, yPosition);
  yPosition += 12;
  
  // Línea decorativa bajo el título
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.line(20, yPosition, 100, yPosition);
  yPosition += 15;

  data.forEach((result, index) => {
    checkPageBreak(30);
    
    // Contenedor del resultado con borde
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(20, yPosition - 5, 170, 25);
    
    // Título del resultado
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${result.type}`, 25, yPosition);
    yPosition += 8;
    
    // Detalles en columnas
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    
    // Columna izquierda
    doc.text(`Estado: ${result.status}`, 25, yPosition);
    doc.text(`Detalles: ${result.details}`, 25, yPosition + 6);
    
    // Columna derecha
    doc.text(`Última actividad: ${result.lastSeen}`, 110, yPosition);
    if (result.location) {
      doc.text(`Ubicación: ${result.location}`, 110, yPosition + 6);
    }
    
    yPosition += 15;
  });
};

const exportBusinessData = async (doc, data, yPosition, checkPageBreak) => {
  // Título de sección con estilo profesional
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.setFont(undefined, 'bold');
  doc.text('REGISTROS EMPRESARIALES', 20, yPosition);
  yPosition += 12;
  
  // Línea decorativa bajo el título
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.line(20, yPosition, 80, yPosition);
  yPosition += 15;

  data.forEach((business, index) => {
    checkPageBreak(35);
    
    // Contenedor de la empresa con borde
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(20, yPosition - 5, 170, 30);
    
    // Número y nombre de la empresa
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${business.nombre}`, 25, yPosition);
    yPosition += 8;
    
    // Detalles de la empresa en columnas
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    
    // Columna izquierda
    doc.text(`Tipo: ${business.tipo}`, 25, yPosition);
    doc.text(`Propietario: ${business.propietario}`, 25, yPosition + 6);
    doc.text(`Ubicación: ${business.ubicacion}`, 25, yPosition + 12);
    
    // Columna derecha
    doc.text(`Estado: ${business.estado}`, 110, yPosition);
    if (business.fecha_registro) {
      doc.text(`Registro: ${business.fecha_registro}`, 110, yPosition + 6);
    }
    if (business.ultima_visita) {
      doc.text(`Última visita: ${business.ultima_visita}`, 110, yPosition + 12);
    }
    
    yPosition += 18;
    
    // Notas si existen
    if (business.notas) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Notas: ${business.notas}`, 25, yPosition);
      yPosition += 6;
    }
    
    yPosition += 8;
  });
};

const exportBlogData = async (doc, data, yPosition, checkPageBreak) => {
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('ARCHIVOS CNI', 20, yPosition);
  yPosition += 15;

  data.forEach((article, index) => {
    checkPageBreak(40);
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`${index + 1}. ${article.titulo}`, 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Banda: ${article.banda}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Agente: ${article.agente}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Categoría: ${article.categoria}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Nivel: ${article.nivel_seguridad}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Fecha: ${new Date(article.fecha_creacion).toLocaleDateString('es-ES')}`, 30, yPosition);
    yPosition += 6;
    
    // Contenido (truncado si es muy largo)
    const content = article.contenido.length > 200 
      ? article.contenido.substring(0, 200) + '...'
      : article.contenido;
    doc.text(`Contenido: ${content}`, 30, yPosition);
    yPosition += 15;
  });
};

const exportPlayersData = async (doc, data, yPosition, checkPageBreak) => {
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('CIUDADANOS DETECTADOS', 20, yPosition);
  yPosition += 15;

  data.forEach((player, index) => {
    checkPageBreak(25);
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`${index + 1}. ${player.Player.split(':')[0]}`, 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`ID: ${player.Player.split(':')[1]}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Equipo: ${player.Team}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Permisos: ${player.Permission}`, 30, yPosition);
    yPosition += 6;
    if (player.Callsign) {
      doc.text(`Indicativo: ${player.Callsign}`, 30, yPosition);
      yPosition += 6;
    }
    yPosition += 10;
  });
};

const exportVehiclesData = async (doc, data, yPosition, checkPageBreak) => {
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('VEHÍCULOS EN CIUDAD', 20, yPosition);
  yPosition += 15;

  data.forEach((vehicle, index) => {
    checkPageBreak(25);
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`${index + 1}. ${vehicle.Name}`, 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Propietario: ${vehicle.Owner}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Textura: ${vehicle.Texture}`, 30, yPosition);
    yPosition += 6;
    yPosition += 10;
  });
};

const exportGeneralData = async (doc, data, yPosition, checkPageBreak) => {
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('DATOS GENERALES', 20, yPosition);
  yPosition += 15;

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`${index + 1}. ${JSON.stringify(item)}`, 20, yPosition);
      yPosition += 8;
    });
  } else {
    Object.entries(data).forEach(([key, value]) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`${key}: ${value}`, 20, yPosition);
      yPosition += 8;
    });
  }
};

// Componente de botones de exportación
const ExportButtons = ({ data, filename, title, type, onExport }) => {
  const { exportToPDF, exportToExcel, exportToCSV } = useDataExport();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState('');

  const handleExport = async (format) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      alert('No hay datos para exportar');
      return;
    }

    setExporting(true);
    setExportType(format);

    try {
      let result;
      switch (format) {
        case 'pdf':
          result = await exportToPDF(data, filename, title, type);
          break;
        case 'excel':
          result = await exportToExcel(data, filename, title);
          break;
        case 'csv':
          result = exportToCSV(data, filename, title);
          break;
        default:
          result = { success: false, message: 'Formato no soportado' };
      }

      if (result.success) {
        onExport && onExport('success', result.message);
      } else {
        onExport && onExport('error', result.message);
      }
    } catch (error) {
      onExport && onExport('error', 'Error durante la exportación: ' + error.message);
    } finally {
      setExporting(false);
      setExportType('');
    }
  };

  return (
    <div className="cni-export-buttons">
      <button
        className="cni-btn cni-btn-export"
        onClick={() => handleExport('pdf')}
        disabled={exporting}
        title="Exportar a PDF"
      >
        {exporting && exportType === 'pdf' ? <FaSpinner className="fa-spin" /> : <FaFilePdf />}
        PDF
      </button>
      <button
        className="cni-btn cni-btn-export"
        onClick={() => handleExport('excel')}
        disabled={exporting}
        title="Exportar a Excel"
      >
        {exporting && exportType === 'excel' ? <FaSpinner className="fa-spin" /> : <FaFileExcel />}
        Excel
      </button>
      <button
        className="cni-btn cni-btn-export"
        onClick={() => handleExport('csv')}
        disabled={exporting}
        title="Exportar a CSV"
      >
        {exporting && exportType === 'csv' ? <FaSpinner className="fa-spin" /> : <FaFileCsv />}
        CSV
      </button>
    </div>
  );
};

const CNISection = () => {
  const [user, setUser] = useState(null);
  const [isCNI, setIsCNI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('database');
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Hook de caché avanzado (deshabilitado temporalmente)
  // const { getCachedData, setCachedData, clearExpiredCache, clearCache, getCacheStats } = useAdvancedCache();

  // Estados para funcionalidades CNI
  const [searchData, setSearchData] = useState({
    results: [],
    loading: false,
    error: ''
  });

  const [databaseStats, setDatabaseStats] = useState({
    totalUsers: 0,
    totalDNIs: 0,
    totalMultas: 0,
    totalAntecedentes: 0,
    totalArrestos: 0
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [advancedSearch, setAdvancedSearch] = useState({
    query: '',
    searchType: 'all',
    filters: {
      dateRange: '',
      status: '',
      location: ''
    }
  });

  // Limpiar caché expirado cada 5 minutos (deshabilitado)
  // useEffect(() => {
  //   const interval = setInterval(clearExpiredCache, 300000);
  //   return () => clearInterval(interval);
  // }, [clearExpiredCache]);

  // Verificar autenticación y permisos CNI
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('spainrp_token');
        if (!token) {
          setError('Debes iniciar sesión para acceder al CNI');
          setLoading(false);
          return;
        }

        // Verificar usuario
        const userRes = await fetch(apiUrl('/auth/me'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userRes.ok) {
          setError('Token inválido');
          setLoading(false);
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user);

        // Verificar si tiene rol CNI
        const cniRes = await fetch(apiUrl(`/api/discord/rolecheck/${userData.user.id}/1384340775772360841`));
        if (cniRes.ok) {
          const cniData = await cniRes.json();
          setIsCNI(cniData.hasRole);
          
          // Mostrar modal de bienvenida solo la primera vez
          if (cniData.hasRole) {
            const hasSeenWelcome = localStorage.getItem('cni-welcome-seen');
            if (!hasSeenWelcome) {
              setShowWelcomeModal(true);
            }
          }
        }

        // Carga instantánea - sin delays artificiales
        console.log('[CNI] ✅ Credenciales verificadas, acceso autorizado');
        
        // Cargar datos en paralelo sin bloquear la UI
        loadDatabaseStats().catch(err => {
          console.warn('[CNI] ⚠️ Error cargando estadísticas:', err);
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error verificando permisos CNI');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Cargar agentes CNI para autocompletado

  // Cargar estadísticas de la base de datos
  const loadDatabaseStats = async () => {
    try {
      // Usar el nuevo endpoint del dashboard CNI
      const dashboardRes = await fetch(apiUrl('/api/cni/dashboard'));
      
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        console.log('[CNI] Dashboard data received:', dashboardData);
        
        if (dashboardData.success && dashboardData.cni) {
          const cniData = dashboardData.cni.dashboard;
          const stats = {
            totalUsers: cniData.baseDatos?.totalUsuarios || 0,
            totalDNIs: cniData.baseDatos?.dnisRegistrados || 0,
            totalMultas: cniData.multas?.total || 0,
            totalAntecedentes: cniData.baseDatos?.antecedentes || 0,
            totalArrestos: cniData.baseDatos?.arrestos || 0
          };
          setDatabaseStats(stats);
        }
      } else {
        console.warn('[CNI] Dashboard endpoint not available, using fallback');
        // Fallback a los endpoints individuales si el dashboard no está disponible
        const [statsRes, recordsRes] = await Promise.all([
          fetch(apiUrl('/api/proxy/admin/stats')),
          fetch(apiUrl('/api/proxy/admin/stats/records'))
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setDatabaseStats(prev => ({
            ...prev,
            totalUsers: statsData.stats?.totalUsers || 0
          }));
        }

        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setDatabaseStats(prev => ({
            ...prev,
            totalMultas: recordsData.records?.multas || 0,
            totalAntecedentes: recordsData.records?.antecedentes || 0,
            totalArrestos: recordsData.records?.arrestos || 0
          }));
        }
      }

      // Cargar DNIs registrados
      try {
        const dnisRes = await fetch(apiUrl('/api/proxy/admin/dni/search?q='));
        if (dnisRes.ok) {
          const dnisData = await dnisRes.json();
          setDatabaseStats(prev => ({
            ...prev,
            totalDNIs: dnisData.dniPorNombre?.length || 0
          }));
        }
      } catch (err) {
        console.error('Error cargando DNIs:', err);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  useEffect(() => {
    if (isCNI) {
      loadDatabaseStats();
    }
  }, [isCNI]);

  if (loading) {
    return (
      <div className="cni-loading">
        <div className="cni-loading-logo">
          <img 
            src="https://imgur.com/acRv3nU.png" 
            alt="CNI Logo" 
            className="cni-loading-logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="cni-loading-logo-fallback" style={{display: 'none'}}>
            <FaEye />
          </div>
        </div>
        <div className="cni-loading-content">
          <h2>Centro Nacional de Inteligencia</h2>
          <p>Inicializando sistemas...</p>
          <div className="cni-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cni-loading">
        <FaExclamationTriangle size={48} color="#8a2be2" />
        <h2>Acceso Denegado</h2>
        <p>{error}</p>
        <a href="/auth/login" className="cni-btn cni-btn-primary">
          Iniciar Sesión
        </a>
      </div>
    );
  }

  if (!isCNI) {
    return (
      <div className="cni-loading">
        <FaShieldAlt size={48} color="#8a2be2" />
        <h2>Acceso Restringido</h2>
        <p>No tienes permisos para acceder al Centro Nacional de Inteligencia</p>
        <p>Se requiere rol de CNI para acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div className={`cni-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Modal de Bienvenida CNI */}
      {showWelcomeModal && (
        <div className="cni-welcome-modal-overlay">
          <div className="cni-welcome-modal">
            <div className="cni-welcome-header">
              <FaShieldAlt className="cni-welcome-icon" />
              <h2><FaCheckCircle /> ¡Bienvenido al Centro Nacional de Inteligencia!</h2>
            </div>
            
            <div className="cni-welcome-content">
              <div className="cni-welcome-section">
                <h3><FaPlus /> Nuevas Funcionalidades Disponibles</h3>
                <ul>
                  <li><strong><FaSearch /> Sistema de Rastreo Avanzado</strong> - Rastrea movimientos financieros, inventarios y actividad completa</li>
                  <li><strong><FaBuilding /> Gestión Empresarial Completa</strong> - Suspender, investigar, clausurar y eliminar empresas</li>
                  <li><strong><FaFileAlt /> Archivos CNI</strong> - Sistema de blog para documentar investigaciones de bandas</li>
                  <li><strong><FaMoneyBillWave /> Análisis Financiero</strong> - Supervisión de patrimonios y movimientos sospechosos</li>
                  <li><strong><FaDownload /> Exportación de Datos</strong> - Exporta reportes a PDF, Excel y CSV</li>
                  <li><strong><FaArchive /> Sistema de Caché Avanzado</strong> - Carga de datos optimizada y caché inteligente</li>
                </ul>
              </div>

              <div className="cni-welcome-section">
                <h3><FaGlobe /> Misión del CNI en SpainRP</h3>
                <div className="cni-mission-cards">
                  <div className="cni-mission-card">
                    <FaBuilding />
                    <h4>Registro Empresarial</h4>
                    <p>Registrar y supervisar todas las empresas del servidor Discord</p>
                  </div>
                  <div className="cni-mission-card">
                    <FaEye />
                    <h4>Supervisión Continua</h4>
                    <p>Revisar y monitorear actividades empresariales</p>
                  </div>
                  <div className="cni-mission-card">
                    <FaShieldAlt />
                    <h4>Investigación Criminal</h4>
                    <p>Detectar y documentar actos maliciosos en SpainRP</p>
                  </div>
                </div>
              </div>

              <div className="cni-welcome-section">
                <h3><FaCog /> Desarrollado por BijjouPro08</h3>
                <p>Este sistema de inteligencia ha sido desarrollado específicamente para las necesidades del CNI de SpainRP, proporcionando herramientas avanzadas de investigación y supervisión.</p>
              </div>
            </div>

            <div className="cni-welcome-actions">
              <button 
                className="cni-btn cni-btn-primary"
                onClick={() => {
                  localStorage.setItem('cni-welcome-seen', 'true');
                  setShowWelcomeModal(false);
                }}
              >
                <FaCheckCircle /> Entendido, Comenzar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cni-header">
        <div className="cni-header-content">
          <div className="cni-logo">
            <img 
              src="https://imgur.com/acRv3nU.png" 
              alt="CNI Logo" 
              className="cni-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="cni-logo-fallback" style={{display: 'none'}}>
              <FaEye />
            </div>
            <h1>CNI - Centro Nacional de Inteligencia</h1>
          </div>
          
          <div className="cni-header-controls">
            <div className="cni-user-info">
              <span className="cni-user-name">{user?.username}</span>
              <span className="cni-cni-badge">AGENTE CNI</span>
            </div>
            
            <div className="cni-control-buttons">
              <button 
                className="cni-control-btn"
                onClick={() => setShowHelp(!showHelp)}
                title="Ayuda del Sistema"
              >
                <FaQuestionCircle />
              </button>
              <button 
                className="cni-control-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button 
                className="cni-control-btn cni-mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title="Menú"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú de Ayuda */}
      {showHelp && (
        <div className="cni-help-panel">
          <div className="cni-help-content">
            <h3><FaInfoCircle /> Guía del Sistema CNI</h3>
            <div className="cni-help-sections">
              <div className="cni-help-section">
                <h4><FaDatabase /> Base de Datos</h4>
                <p>Acceso completo a todos los registros del servidor. Búsquedas rápidas por DNI, Discord ID, multas y antecedentes.</p>
              </div>
              <div className="cni-help-section">
                <h4><FaGlobe /> Rastreo</h4>
                <p>Sistema de rastreo avanzado para analizar actividad completa de usuarios: finanzas, inventario, antecedentes.</p>
              </div>
              <div className="cni-help-section">
                <h4><FaUsers /> Ciudadanos/Vehículos</h4>
                <p>Monitoreo en tiempo real de jugadores y vehículos conectados al servidor.</p>
              </div>
              <div className="cni-help-section">
                <h4><FaBuilding /> Empresas</h4>
                <p>Gestión completa del registro empresarial: crear, suspender, investigar y clausurar empresas.</p>
              </div>
              <div className="cni-help-section">
                <h4><FaDownload /> Exportación</h4>
                <p>Exporta reportes y datos a PDF, Excel y CSV para análisis externos.</p>
              </div>
            </div>
            <button 
              className="cni-btn cni-btn-primary"
              onClick={() => setShowHelp(false)}
            >
              <FaCheckCircle /> Entendido
            </button>
          </div>
        </div>
      )}

      <div className={`cni-tabs ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="cni-tabs-container">
          <button 
            className={`cni-tab ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('database');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaDatabase /> <span>Base de Datos</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('search');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaSearch /> <span>Búsqueda Avanzada</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tracking');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaGlobe /> <span>Rastreo</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('players');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaUsers /> <span>Ciudadanos</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('vehicles');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaCarCrash /> <span>Vehículos</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'intelligence' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('intelligence');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaChartLine /> <span>Inteligencia</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('business');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaBuilding /> <span>Empresas</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('blog');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaFileAlt /> <span>Archivos CNI</span>
          </button>
        </div>
      </div>

      <div className="cni-content">
        {activeTab === 'database' && <DatabaseTab stats={databaseStats} />}
        {activeTab === 'search' && <AdvancedSearchTab />}
        {activeTab === 'tracking' && <TrackingTab />}
        {activeTab === 'players' && <PlayersInCityTab />}
        {activeTab === 'vehicles' && <VehiclesInCityTab />}
        {activeTab === 'intelligence' && <IntelligenceTab />}
        {activeTab === 'business' && <BusinessRecordsTab />}
        {activeTab === 'blog' && <BlogTab />}
      </div>
    </div>
  );
};

// Pestaña de Base de Datos
const DatabaseTab = ({ stats, cache }) => {
  const [quickSearch, setQuickSearch] = useState({
    query: '',
    type: 'discord',
    results: [],
    loading: false
  });
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = (type, message) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleQuickSearch = async (searchType) => {
    if (!quickSearch.query.trim()) return;
    
    setQuickSearch(prev => ({ ...prev, loading: true, results: [] }));
    
    try {
      let endpoint = '';
      let results = [];
      
      switch (searchType) {
        case 'dni':
          const dniRes = await fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(quickSearch.query)}`));
          if (dniRes.ok) {
            const dniData = await dniRes.json();
            results = dniData.dniPorNombre || [];
          }
          break;
          
        case 'discord':
          const discordRes = await fetch(apiUrl(`/api/proxy/admin/search?query=${encodeURIComponent(quickSearch.query)}`));
          if (discordRes.ok) {
            const discordData = await discordRes.json();
            results = discordData.results || [];
          }
          break;
          
        case 'multas':
          const multasRes = await fetch(apiUrl(`/api/proxy/admin/multas/${quickSearch.query}`));
          if (multasRes.ok) {
            const multasData = await multasRes.json();
            results = multasData.multas || [];
          }
          break;
          
        case 'antecedentes':
          const antRes = await fetch(apiUrl(`/api/proxy/admin/antecedentes/${quickSearch.query}`));
          if (antRes.ok) {
            const antData = await antRes.json();
            results = antData.antecedentes || [];
          }
          break;
          
        case 'inventario':
          const invRes = await fetch(apiUrl(`/api/proxy/admin/inventory/${quickSearch.query}`));
          if (invRes.ok) {
            const invData = await invRes.json();
            results = invData.inventario || [];
          }
          break;
      }
      
      setQuickSearch(prev => ({ ...prev, results, loading: false }));
    } catch (err) {
      console.error('Error en búsqueda rápida:', err);
      setQuickSearch(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="cni-section">
      <div className="cni-section-header">
        <h3><FaDatabase /> Base de Datos Nacional</h3>
        <ExportButtons 
          data={stats} 
          filename="estadisticas_bd" 
          title="Estadísticas de Base de Datos" 
          type="database"
          onExport={handleExport}
        />
      </div>

      {exportMessage && (
        <div className={`cni-export-message ${exportMessage.includes('Error') ? 'error' : 'success'}`}>
          {exportMessage}
        </div>
      )}
      
      <div className="cni-stats-grid">
        <div className="cni-stat-card">
          <span className="cni-stat-label">Total Usuarios</span>
          <span className="cni-stat-value">{stats.totalUsers.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">DNIs Registrados</span>
          <span className="cni-stat-value">{stats.totalDNIs.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Multas Totales</span>
          <span className="cni-stat-value">{stats.totalMultas.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Antecedentes</span>
          <span className="cni-stat-value">{stats.totalAntecedentes.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Arrestos</span>
          <span className="cni-stat-value">{stats.totalArrestos.toLocaleString()}</span>
        </div>
      </div>

      <div className="cni-section">
        <h3><FaUsers /> Acceso Rápido a Datos</h3>
        
        <div className="cni-form">
          <div className="cni-form-group">
            <label>Búsqueda Rápida:</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                value={quickSearch.query}
                onChange={(e) => setQuickSearch({...quickSearch, query: e.target.value})}
                className="cni-input"
                placeholder="ID Discord, DNI, nombre..."
                style={{ flex: 1 }}
              />
              <select 
                value={quickSearch.type}
                onChange={(e) => setQuickSearch({...quickSearch, type: e.target.value})}
                className="cni-select"
                style={{ width: '150px' }}
              >
                <option value="discord">Discord ID</option>
                <option value="dni">DNI</option>
                <option value="multas">Multas</option>
                <option value="antecedentes">Antecedentes</option>
                <option value="inventario">Inventario</option>
              </select>
              <button 
                onClick={() => handleQuickSearch(quickSearch.type)}
                className="cni-btn cni-btn-primary"
                disabled={quickSearch.loading}
              >
                {quickSearch.loading ? <FaSpinner className="fa-spin" /> : <FaSearch />}
                Buscar
              </button>
            </div>
          </div>
        </div>

        {quickSearch.results.length > 0 && (
          <div className="cni-search-results">
            <h4>Resultados de Búsqueda:</h4>
            {quickSearch.results.map((result, index) => (
              <div key={index} className="cni-result-card">
                <div className="cni-result-header">
                  <h5>
                    {quickSearch.type === 'dni' && <FaIdCard />}
                    {quickSearch.type === 'discord' && <FaUser />}
                    {quickSearch.type === 'multas' && <FaMoneyBillWave />}
                    {quickSearch.type === 'antecedentes' && <FaHistory />}
                    {quickSearch.type === 'inventario' && <FaClipboardList />}
                    {result.nombre || result.username || result.userId || result.item_id}
                  </h5>
                  <span className="cni-result-type">
                    {quickSearch.type.toUpperCase()}
                  </span>
                </div>
                <div className="cni-result-info">
                  {Object.entries(result).map(([key, value]) => (
                    key !== 'nombre' && key !== 'username' && key !== 'userId' && (
                      <div key={key} className="cni-result-field">
                        <label>{key}:</label>
                        <span>{String(value)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cni-nav">
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'dni'})}>
            <FaIdCard /> Consultar DNI
          </button>
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'multas'})}>
            <FaMoneyBillWave /> Historial Multas
          </button>
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'antecedentes'})}>
            <FaHistory /> Antecedentes
          </button>
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'inventario'})}>
            <FaClipboardList /> Inventarios
          </button>
          <button className="cni-nav-btn">
            <FaBuilding /> Registros Empresariales
          </button>
        </div>
      </div>
    </div>
  );
};

// Pestaña de Búsqueda Avanzada
const AdvancedSearchTab = () => {
  const [searchForm, setSearchForm] = useState({
    query: '',
    searchType: 'all',
    filters: {
      dateRange: '',
      status: '',
      location: ''
    }
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Búsqueda por nombre/DNI
      const searchRes = await fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(searchForm.query)}`));
      const searchData = await searchRes.json();
      
      if (searchData.success) {
        setResults(searchData);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cni-section">
      <h3><FaSearch /> Búsqueda Avanzada de Inteligencia</h3>
      
      <form onSubmit={handleSearch} className="cni-form">
        <div className="cni-form-group">
          <label>Término de Búsqueda:</label>
          <input
            type="text"
            value={searchForm.query}
            onChange={(e) => setSearchForm({...searchForm, query: e.target.value})}
            className="cni-input"
            placeholder="Nombre, DNI, Discord ID..."
            required
          />
        </div>
        
        <div className="cni-form-group">
          <label>Tipo de Búsqueda:</label>
          <select 
            value={searchForm.searchType}
            onChange={(e) => setSearchForm({...searchForm, searchType: e.target.value})}
            className="cni-select"
          >
            <option value="all">Todos los Registros</option>
            <option value="dni">Solo DNIs</option>
            <option value="discord">Solo Discord</option>
            <option value="multas">Solo Multas</option>
            <option value="antecedentes">Solo Antecedentes</option>
          </select>
        </div>

        <div className="cni-form-group">
          <label>Filtros Adicionales:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <input
              type="date"
              value={searchForm.filters.dateRange}
              onChange={(e) => setSearchForm({
                ...searchForm, 
                filters: {...searchForm.filters, dateRange: e.target.value}
              })}
              className="cni-input"
              placeholder="Rango de fechas"
            />
            <select 
              value={searchForm.filters.status}
              onChange={(e) => setSearchForm({
                ...searchForm, 
                filters: {...searchForm.filters, status: e.target.value}
              })}
              className="cni-select"
            >
              <option value="">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="arrestado">Arrestado</option>
              <option value="baneado">Baneado</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="cni-btn cni-btn-primary" disabled={loading}>
          {loading ? <FaSpinner className="fa-spin" /> : <FaSearch />}
          {loading ? 'Buscando...' : 'Ejecutar Búsqueda'}
        </button>
      </form>

      {results.dniPorNombre && results.dniPorNombre.length > 0 && (
        <div className="cni-search-results">
          <h4>Resultados de Búsqueda:</h4>
          {results.dniPorNombre.map((dni, index) => (
            <div key={index} className="cni-result-card">
              <div className="cni-result-header">
                <h5><FaIdCard /> {dni.nombre} {dni.apellidos}</h5>
                <span className="cni-result-type">DNI</span>
              </div>
              <div className="cni-result-info">
                <div className="cni-result-field">
                  <label>DNI:</label>
                  <span>{dni.numeroDNI}</span>
                </div>
                <div className="cni-result-field">
                  <label>Discord ID:</label>
                  <span>{dni.discordId}</span>
                </div>
                <div className="cni-result-field">
                  <label>Estado:</label>
                  <span>{dni.arrestado ? 'Arrestado' : 'Activo'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// Pestaña de Inteligencia
const IntelligenceTab = () => {
  return (
    <div className="cni-section">
      <h3><FaChartLine /> Análisis de Inteligencia</h3>
      
      <div className="cni-stats-grid">
        <div className="cni-stat-card">
          <span className="cni-stat-label">Amenazas Detectadas</span>
          <span className="cni-stat-value">0</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Patrones Sospechosos</span>
          <span className="cni-stat-value">0</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Redes Criminales</span>
          <span className="cni-stat-value">0</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Alertas Activas</span>
          <span className="cni-stat-value">0</span>
        </div>
      </div>

      <div className="cni-section">
        <h3><FaFlag /> Alertas de Seguridad</h3>
        <div className="cni-no-data">
          <FaCheckCircle />
          <p>No hay alertas de seguridad activas</p>
        </div>
      </div>
    </div>
  );
};

// Pestaña de Rastreo Mejorada
const TrackingTab = ({ cache }) => {
  const [trackingForm, setTrackingForm] = useState({
    target: '',
    trackingType: 'all'
  });
  const [trackingResults, setTrackingResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = (type, message) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleTrackingSearch = async () => {
    if (!trackingForm.target.trim()) return;
    
    console.log('[CNI][RASTREO] 🔍 Iniciando búsqueda de rastreo para:', trackingForm.target);
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('[CNI][RASTREO] 📡 Realizando consultas paralelas...');
      const startTime = Date.now();
      
      // Buscar datos del usuario en múltiples fuentes
      const [dniRes, multasRes, antecedentesRes, balanceRes, inventarioRes] = await Promise.all([
        fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(trackingForm.target)}`)),
        fetch(apiUrl(`/api/proxy/admin/ver-multas/${trackingForm.target}`)),
        fetch(apiUrl(`/api/proxy/admin/antecedentes/${trackingForm.target}`)),
        fetch(apiUrl(`/api/proxy/admin/balance/${trackingForm.target}`)),
        fetch(apiUrl(`/api/proxy/admin/inventory/${trackingForm.target}`))
      ]);

      const searchTime = Date.now() - startTime;
      console.log(`[CNI][RASTREO] ⏱️ Consultas completadas en ${searchTime}ms`);

      const results = [];
      console.log('[CNI][RASTREO] 📊 Procesando resultados...');
      
      // Procesar DNI
      console.log('[CNI][RASTREO] 🆔 Procesando datos de DNI...');
      if (dniRes.ok) {
        const dniData = await dniRes.json();
        console.log('[CNI][RASTREO] 📋 Datos DNI recibidos:', dniData);
        if (dniData.dniPorNombre && dniData.dniPorNombre.length > 0) {
          console.log(`[CNI][RASTREO] ✅ Encontrados ${dniData.dniPorNombre.length} DNIs`);
          dniData.dniPorNombre.forEach((dni, index) => {
            console.log(`[CNI][RASTREO] 👤 DNI ${index + 1}:`, dni);
            results.push({
              type: 'DNI',
              status: dni.arrestado ? 'Arrestado' : 'Activo',
              details: `${dni.nombre} ${dni.apellidos} - DNI: ${dni.numeroDNI}`,
              lastSeen: dni.fecha_registro || 'Desconocido'
            });
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron DNIs');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta DNI:', dniRes.status, dniRes.statusText);
      }

      // Procesar Multas
      console.log('[CNI][RASTREO] 🚨 Procesando datos de multas...');
      if (multasRes.ok) {
        const multasData = await multasRes.json();
        console.log('[CNI][RASTREO] 📋 Datos multas recibidos:', multasData);
        if (multasData.multas && multasData.multas.length > 0) {
          const totalMultas = multasData.multas.length;
          const pendientes = multasData.multas.filter(m => !m.pagada).length;
          console.log(`[CNI][RASTREO] ✅ Encontradas ${totalMultas} multas (${pendientes} pendientes)`);
          results.push({
            type: 'Multas',
            status: pendientes > 0 ? 'Pendientes' : 'Al día',
            details: `${totalMultas} multas totales, ${pendientes} pendientes`,
            lastSeen: multasData.multas[0]?.fecha || 'Desconocido'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron multas');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta multas:', multasRes.status, multasRes.statusText);
      }

      // Procesar Antecedentes
      console.log('[CNI][RASTREO] ⚖️ Procesando datos de antecedentes...');
      if (antecedentesRes.ok) {
        const antData = await antecedentesRes.json();
        console.log('[CNI][RASTREO] 📋 Datos antecedentes recibidos:', antData);
        if (antData.antecedentes && antData.antecedentes.length > 0) {
          console.log(`[CNI][RASTREO] ✅ Encontrados ${antData.antecedentes.length} antecedentes`);
          results.push({
            type: 'Antecedentes',
            status: 'Con historial',
            details: `${antData.antecedentes.length} antecedentes registrados`,
            lastSeen: antData.antecedentes[0]?.fecha || 'Desconocido'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron antecedentes');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta antecedentes:', antecedentesRes.status, antecedentesRes.statusText);
      }

      // Procesar Balance Financiero
      console.log('[CNI][RASTREO] 💰 Procesando datos financieros...');
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        console.log('[CNI][RASTREO] 📋 Datos balance recibidos:', balanceData);
        if (balanceData.success && balanceData.balance) {
          const total = balanceData.balance.cash + balanceData.balance.bank;
          const patrimonio = total > 100000 ? 'Alto patrimonio' : total > 10000 ? 'Patrimonio medio' : 'Patrimonio bajo';
          console.log(`[CNI][RASTREO] ✅ Balance: ${total.toLocaleString()}€ (${patrimonio})`);
          results.push({
            type: 'Finanzas',
            status: patrimonio,
            details: `Efectivo: ${balanceData.balance.cash.toLocaleString()}€ | Banco: ${balanceData.balance.bank.toLocaleString()}€ | Total: ${total.toLocaleString()}€`,
            lastSeen: 'Activo'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron datos de balance');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta balance:', balanceRes.status, balanceRes.statusText);
      }

      // Procesar Inventario
      console.log('[CNI][RASTREO] 🎒 Procesando datos de inventario...');
      if (inventarioRes.ok) {
        const inventarioData = await inventarioRes.json();
        console.log('[CNI][RASTREO] 📋 Datos inventario recibidos:', inventarioData);
        if (inventarioData.success && inventarioData.inventario && inventarioData.inventario.length > 0) {
          const itemsValiosos = inventarioData.inventario.filter(item => 
            item.precio && item.precio > 10000
          );
          console.log(`[CNI][RASTREO] ✅ Inventario: ${inventarioData.inventario.length} objetos (${itemsValiosos.length} valiosos)`);
          results.push({
            type: 'Inventario',
            status: itemsValiosos.length > 0 ? 'Objetos valiosos' : 'Inventario normal',
            details: `${inventarioData.inventario.length} objetos, ${itemsValiosos.length} valiosos`,
            lastSeen: 'Activo'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron objetos en inventario');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta inventario:', inventarioRes.status, inventarioRes.statusText);
      }

      console.log(`[CNI][RASTREO] 🎯 Búsqueda completada. Resultados: ${results.length}`);
      console.log('[CNI][RASTREO] 📊 Resultados finales:', results);
      setTrackingResults(results);
      setSuccess(`Rastreo completado. Encontrados ${results.length} tipos de datos.`);
    } catch (error) {
      console.error('[CNI][RASTREO] ❌ Error en búsqueda de rastreo:', error);
      setError('Error de conexión durante el rastreo');
    } finally {
      setLoading(false);
      console.log('[CNI][RASTREO] ✅ Proceso de rastreo finalizado');
    }
  };

  return (
    <div className="cni-section">
      <h3><FaGlobe /> Sistema de Rastreo de Actividad</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}
      
      <div className="cni-form">
        <div className="cni-form-group">
          <label>Buscar Usuario:</label>
          <input
            type="text"
            className="cni-input"
            placeholder="Discord ID, DNI, o nombre..."
            value={trackingForm.target}
            onChange={(e) => setTrackingForm(prev => ({ ...prev, target: e.target.value }))}
          />
        </div>
        
        <button 
          className="cni-btn cni-btn-primary"
          onClick={handleTrackingSearch}
          disabled={!trackingForm.target.trim() || loading}
        >
          {loading ? <FaSpinner className="fa-spin" /> : <FaSearch />} 
          {loading ? 'Buscando...' : 'Buscar Actividad'}
        </button>
      </div>
      
      {trackingResults.length > 0 && (
        <div className="cni-section">
          <div className="cni-section-header">
            <h3><FaMapMarkerAlt /> Resultados de Rastreo</h3>
            <ExportButtons 
              data={trackingResults} 
              filename="resultados_rastreo" 
              title="Resultados de Rastreo" 
              type="tracking"
              onExport={handleExport}
            />
          </div>

          {exportMessage && (
            <div className={`cni-export-message ${exportMessage.includes('Error') ? 'error' : 'success'}`}>
              {exportMessage}
            </div>
          )}

          <div className="cni-search-results">
            {trackingResults.map((result, index) => (
              <div key={index} className="cni-result-card">
                <div className="cni-result-header">
                  <h5><FaUser /> {result.type}</h5>
                  <span className={`cni-result-type ${result.status.toLowerCase().replace(' ', '-')}`}>
                    {result.status}
                  </span>
                </div>
                <div className="cni-result-info">
                  <div className="cni-result-field">
                    <label>Detalles:</label>
                    <span>{result.details}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Última Actividad:</label>
                    <span>{result.lastSeen}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Pestaña de Registros Empresariales
const BusinessRecordsTab = ({ cache }) => {
  const [businesses, setBusinesses] = useState([]);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({
    total_empresas: 0,
    empresas_activas: 0,
    empresas_inactivas: 0,
    empresas_suspendidas: 0,
    visitas_semana: 0,
    visitas_mes: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = (type, message) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(''), 3000);
  };
  
  // Estados para autocompletado
  const [cniAgents, setCniAgents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  
  const [newBusiness, setNewBusiness] = useState({
    nombre: '',
    tipo: '',
    propietario: '',
    ubicacion: '',
    estado: 'activa',
    notas: '',
    agente_registro: ''
  });
  
  const [newVisit, setNewVisit] = useState({
    empresa_id: '',
    agente: '',
    fecha_visita: '',
    notas: '',
    estado: 'completada'
  });

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  // Cargar agentes CNI para autocompletado
  const loadCniAgents = async () => {
    try {
      const agents = [
        'BijjouPro08', 'nanobox_32', 'RA_ESTE', 'lichandro56',
        'LAFROGCRAZI', 'Elgato21053', 'Mimi (YoSoySergiox)', 'The441884',
        'amigo_dedoc', 'Secret_Agent', 'nicogamer2220', 'Director_CNI'
      ];
      setCniAgents(agents);
    } catch (err) {
      console.error('Error cargando agentes CNI:', err);
    }
  };

  // Manejar input de agente con autocompletado
  const handleAgentInput = (value, setter) => {
    setter(value);
    if (value.length > 1) {
      const filtered = cniAgents.filter(agent => 
        agent.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (agent, setter) => {
    setter(agent);
    setShowSuggestions(false);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar agentes al montar el componente
  useEffect(() => {
    loadCniAgents();
  }, []);

  const loadBusinesses = async () => {
    try {
      console.log('[CNI][EMPRESAS] 🔄 Cargando empresas desde servidor...');
      setLoading(true);
      const startTime = Date.now();
      
      const response = await fetch(apiUrl('/api/cni/empresas'));
      const data = await response.json();
      
      const loadTime = Date.now() - startTime;
      console.log(`[CNI][EMPRESAS] ⏱️ Carga completada en ${loadTime}ms`);
      
      if (data.success) {
        setBusinesses(data.empresas);
        console.log(`[CNI][EMPRESAS] ✅ ${data.empresas.length} empresas cargadas`);
      } else {
        setError('Error cargando empresas');
      }
    } catch (err) {
      console.error('[CNI][EMPRESAS] ❌ Error cargando empresas:', err);
      setError('Error de conexión al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const loadVisits = async () => {
    try {
      console.log('[CNI][VISITAS] 🔄 Cargando visitas desde servidor...');
      const response = await fetch(apiUrl('/api/cni/visitas'));
      const data = await response.json();
      
      if (data.success) {
        setVisits(data.visitas);
        console.log(`[CNI][VISITAS] ✅ ${data.visitas.length} visitas cargadas`);
      }
    } catch (err) {
      console.error('[CNI][VISITAS] ❌ Error cargando visitas:', err);
    }
  };

  const loadStats = async () => {
    try {
      console.log('[CNI][ESTADISTICAS] 🔄 Cargando estadísticas desde servidor...');
      const response = await fetch(apiUrl('/api/cni/estadisticas'));
      const data = await response.json();
      
      if (data.success) {
        setStats(data.estadisticas);
        console.log('[CNI][ESTADISTICAS] ✅ Estadísticas cargadas');
      }
    } catch (err) {
      console.error('[CNI][ESTADISTICAS] ❌ Error cargando estadísticas:', err);
    }
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    
    // Validación rápida del lado cliente
    if (!newBusiness.nombre.trim() || !newBusiness.tipo.trim() || !newBusiness.propietario.trim()) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('[CNI][EMPRESAS] 🏢 Registrando nueva empresa:', newBusiness.nombre);
      const startTime = Date.now();
      
      const response = await fetch(apiUrl('/api/cni/empresas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusiness)
      });
      
      const data = await response.json();
      const registerTime = Date.now() - startTime;
      console.log(`[CNI][EMPRESAS] ⏱️ Registro completado en ${registerTime}ms`);
      
      if (data.success) {
        setSuccess(`✅ Empresa "${newBusiness.nombre}" registrada correctamente`);
        setNewBusiness({ 
          nombre: '', 
          tipo: '', 
          propietario: '', 
          ubicacion: '', 
          estado: 'activa', 
          notas: '', 
          agente_registro: '' 
        });
        
        // Recargar datos
        await Promise.all([loadBusinesses(), loadStats()]);
        
        console.log('[CNI][EMPRESAS] ✅ Empresa registrada y datos actualizados');
      } else {
        setError(`❌ Error: ${data.error}`);
        console.error('[CNI][EMPRESAS] ❌ Error en registro:', data.error);
      }
    } catch (err) {
      console.error('[CNI][EMPRESAS] ❌ Error de conexión:', err);
      setError('❌ Error de conexión al registrar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(apiUrl('/api/cni/visitas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisit)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Visita registrada correctamente');
        setNewVisit({ empresa_id: '', agente: '', fecha_visita: '', notas: '', estado: 'completada' });
        loadVisits();
        loadBusinesses();
        loadStats();
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error añadiendo visita:', err);
      setError('Error de conexión al registrar visita');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de gestión empresarial (optimizada)
  const handleBusinessAction = useCallback(async (businessId, action, newStatus = null) => {
    // Validación rápida
    if (!businessId || !action) {
      console.warn('[CNI][EMPRESAS] ❌ Parámetros inválidos');
      return;
    }

    // Confirmaciones específicas para cada acción (memoizada)
    const confirmations = {
      'delete': {
        title: 'CONFIRMACIÓN CRÍTICA',
        message: '¿Estás seguro de ELIMINAR PERMANENTEMENTE esta empresa? Esta acción NO se puede deshacer y se perderán todos los datos asociados.',
        confirmText: 'SÍ, ELIMINAR DEFINITIVAMENTE',
        cancelText: 'Cancelar'
      },
      'suspendida': {
        title: 'Suspender Empresa',
        message: '¿Confirmas la SUSPENSIÓN TEMPORAL de esta empresa? La empresa quedará inactiva hasta nueva orden.',
        confirmText: 'SÍ, SUSPENDER',
        cancelText: 'Cancelar'
      },
      'bajo_investigacion': {
        title: 'Poner Bajo Investigación',
        message: '¿Confirmas poner esta empresa BAJO INVESTIGACIÓN? Se iniciará un protocolo de supervisión especial.',
        confirmText: 'SÍ, INVESTIGAR',
        cancelText: 'Cancelar'
      },
      'clausurada': {
        title: 'Clausurar Empresa',
        message: '¿Confirmas la CLAUSURA DEFINITIVA de esta empresa? Esta acción es IRREVERSIBLE.',
        confirmText: 'SÍ, CLAUSURAR',
        cancelText: 'Cancelar'
      },
      'activa': {
        title: 'Reactivar Empresa',
        message: '¿Confirmas REACTIVAR esta empresa? Se restaurará su estado operativo normal.',
        confirmText: 'SÍ, REACTIVAR',
        cancelText: 'Cancelar'
      }
    };

    const confirmation = confirmations[newStatus || action];
    if (!confirmation) {
      console.warn('[CNI][EMPRESAS] ❌ Confirmación no encontrada para:', newStatus || action);
      return;
    }

    // Mostrar confirmación de forma síncrona (no bloquea)
    const confirmed = window.confirm(
      `${confirmation.title}\n\n${confirmation.message}\n\nPresiona OK para ${confirmation.confirmText.toLowerCase()} o Cancelar para ${confirmation.cancelText.toLowerCase()}.`
    );

    if (!confirmed) {
      return;
    }

    // Estado de loading inmediato
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Preparar petición
      let url, options;
      
      if (action === 'delete') {
        url = apiUrl(`/api/cni/empresas/${businessId}`);
        options = { method: 'DELETE' };
      } else if (action === 'update') {
        url = apiUrl(`/api/cni/empresas/${businessId}/estado`);
        options = {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: newStatus })
        };
      } else {
        throw new Error('Acción no válida');
      }
      
      // Ejecutar petición
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (data.success) {
        const actionMessages = {
          'delete': 'Empresa eliminada correctamente',
          'suspendida': 'Empresa suspendida temporalmente',
          'bajo_investigacion': 'Empresa puesta bajo investigación',
          'clausurada': 'Empresa clausurada definitivamente',
          'activa': 'Empresa reactivada'
        };
        
        setSuccess(actionMessages[newStatus || action]);
        
        // Recargar datos en paralelo (no bloquea UI)
        Promise.all([loadBusinesses(), loadStats()]).catch(err => {
          console.warn('[CNI][EMPRESAS] ⚠️ Error recargando datos:', err);
        });
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][EMPRESAS] ❌ Error en acción empresarial:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [loadBusinesses, loadStats]);

  useEffect(() => {
    loadBusinesses();
    loadVisits();
    loadStats();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaBuilding /> Registros Empresariales</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}
      
      <div className="cni-stats-grid">
        <div className="cni-stat-card">
          <span className="cni-stat-label">Total Empresas</span>
          <span className="cni-stat-value">{stats.total_empresas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Empresas Activas</span>
          <span className="cni-stat-value">{stats.empresas_activas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Empresas Inactivas</span>
          <span className="cni-stat-value">{stats.empresas_inactivas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Empresas Suspendidas</span>
          <span className="cni-stat-value">{stats.empresas_suspendidas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Visitas Esta Semana</span>
          <span className="cni-stat-value">{stats.visitas_semana}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Visitas Este Mes</span>
          <span className="cni-stat-value">{stats.visitas_mes}</span>
        </div>
      </div>

      <div className="cni-section">
        <h3><FaPlus /> Registrar Nueva Empresa</h3>
        <form onSubmit={handleAddBusiness} className="cni-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="cni-form-group">
              <label>Nombre de la Empresa:</label>
              <input
                type="text"
                value={newBusiness.nombre}
                onChange={(e) => setNewBusiness({...newBusiness, nombre: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Tipo:</label>
              <select 
                value={newBusiness.tipo}
                onChange={(e) => setNewBusiness({...newBusiness, tipo: e.target.value})}
                className="cni-select"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Restaurante">Restaurante</option>
                <option value="Automóviles">Automóviles</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="cni-form-group">
              <label>Propietario:</label>
              <input
                type="text"
                value={newBusiness.propietario}
                onChange={(e) => setNewBusiness({...newBusiness, propietario: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Ubicación:</label>
              <input
                type="text"
                value={newBusiness.ubicacion}
                onChange={(e) => setNewBusiness({...newBusiness, ubicacion: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Estado:</label>
              <select 
                value={newBusiness.estado}
                onChange={(e) => setNewBusiness({...newBusiness, estado: e.target.value})}
                className="cni-select"
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="suspendida">Suspendida</option>
              </select>
            </div>
            <div className="cni-form-group">
              <label>Agente CNI:</label>
              <div className="cni-autocomplete-container" ref={suggestionRef}>
                <input
                  type="text"
                  value={newBusiness.agente_registro}
                  onChange={(e) => handleAgentInput(e.target.value, (value) => setNewBusiness({...newBusiness, agente_registro: value}))}
                  className="cni-input"
                  placeholder="Nombre del agente CNI"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="cni-suggestions-dropdown">
                    {suggestions.map((agent, index) => (
                      <div 
                        key={index}
                        className="cni-suggestion-item"
                        onClick={() => selectSuggestion(agent, (value) => setNewBusiness({...newBusiness, agente_registro: value}))}
                      >
                        <FaUser /> {agent}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="cni-form-group">
            <label>Notas adicionales:</label>
            <textarea
              value={newBusiness.notas}
              onChange={(e) => setNewBusiness({...newBusiness, notas: e.target.value})}
              className="cni-textarea"
              rows="3"
              placeholder="Información adicional sobre la empresa..."
            />
          </div>
          <button type="submit" className="cni-btn cni-btn-success" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Empresa'}
          </button>
        </form>
      </div>

      <div className="cni-section">
        <h3><FaCalendarAlt /> Visitas de Inspección</h3>
        <form onSubmit={handleAddVisit} className="cni-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="cni-form-group">
              <label>Empresa:</label>
              <select 
                value={newVisit.empresa_id}
                onChange={(e) => setNewVisit({...newVisit, empresa_id: e.target.value})}
                className="cni-select"
                required
              >
                <option value="">Seleccionar empresa...</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.nombre} - {business.propietario}
                  </option>
                ))}
              </select>
            </div>
            <div className="cni-form-group">
              <label>Agente CNI:</label>
              <div className="cni-autocomplete-container" ref={suggestionRef}>
                <input
                  type="text"
                  value={newVisit.agente}
                  onChange={(e) => handleAgentInput(e.target.value, (value) => setNewVisit({...newVisit, agente: value}))}
                  className="cni-input"
                  placeholder="Nombre del agente CNI"
                  autoComplete="off"
                  required
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="cni-suggestions-dropdown">
                    {suggestions.map((agent, index) => (
                      <div 
                        key={index}
                        className="cni-suggestion-item"
                        onClick={() => selectSuggestion(agent, (value) => setNewVisit({...newVisit, agente: value}))}
                      >
                        <FaUser /> {agent}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="cni-form-group">
              <label>Fecha:</label>
              <input
                type="date"
                value={newVisit.fecha_visita}
                onChange={(e) => setNewVisit({...newVisit, fecha_visita: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Estado:</label>
              <select 
                value={newVisit.estado}
                onChange={(e) => setNewVisit({...newVisit, estado: e.target.value})}
                className="cni-select"
              >
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div className="cni-form-group">
            <label>Notas de la Visita:</label>
            <textarea
              value={newVisit.notas}
              onChange={(e) => setNewVisit({...newVisit, notas: e.target.value})}
              className="cni-textarea"
              rows="3"
              placeholder="Detalles de la inspección, observaciones, incidencias..."
            />
          </div>
          <button type="submit" className="cni-btn cni-btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Visita'}
          </button>
        </form>
      </div>

      <div className="cni-section">
        <div className="cni-section-header">
          <h3><FaBuilding /> Empresas Registradas ({businesses.length})</h3>
          <ExportButtons 
            data={businesses} 
            filename="empresas_registradas" 
            title="Registros Empresariales" 
            type="business"
            onExport={handleExport}
          />
        </div>

        {exportMessage && (
          <div className={`cni-export-message ${exportMessage.includes('Error') ? 'error' : 'success'}`}>
            {exportMessage}
          </div>
        )}

        {loading ? (
          <div className="cni-loading">
            <FaSpinner className="fa-spin" />
            <p>Cargando empresas...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="cni-no-data">
            <FaBuilding />
            <p>No hay empresas registradas</p>
          </div>
        ) : (
          <div className="cni-search-results">
            {businesses.map(business => (
              <div key={business.id} className="cni-result-card">
                <div className="cni-result-header">
                  <h5><FaBuilding /> {business.nombre}</h5>
                  <span className={`cni-result-type ${business.estado}`}>
                    {business.estado.toUpperCase()}
                  </span>
                </div>
                <div className="cni-result-info">
                  <div className="cni-result-field">
                    <label>Tipo:</label>
                    <span>{business.tipo}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Propietario:</label>
                    <span>{business.propietario}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Ubicación:</label>
                    <span>{business.ubicacion}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Última Visita:</label>
                    <span>{business.ultima_visita ? new Date(business.ultima_visita).toLocaleDateString('es-ES') : 'Sin visitas'}</span>
                  </div>
                  {business.agente_registro && (
                    <div className="cni-result-field">
                      <label>Agente Registro:</label>
                      <span>{business.agente_registro}</span>
                    </div>
                  )}
                  {business.notas && (
                    <div className="cni-result-field">
                      <label>Notas:</label>
                      <span>{business.notas}</span>
                    </div>
                  )}
                </div>
                <div className="cni-business-actions">
                  {business.estado === 'activa' && (
                    <>
                      <button 
                        className="cni-btn cni-btn-warning"
                        onClick={() => handleBusinessAction(business.id, 'update', 'suspendida')}
                        disabled={loading}
                      >
                        <FaClock /> Suspender
                      </button>
                      <button 
                        className="cni-btn cni-btn-info"
                        onClick={() => handleBusinessAction(business.id, 'update', 'bajo_investigacion')}
                        disabled={loading}
                      >
                        <FaSearch /> Investigar
                      </button>
                      <button 
                        className="cni-btn cni-btn-danger"
                        onClick={() => handleBusinessAction(business.id, 'update', 'clausurada')}
                        disabled={loading}
                      >
                        <FaTimes /> Clausurar
                      </button>
                    </>
                  )}
                  {business.estado === 'suspendida' && (
                    <>
                      <button 
                        className="cni-btn cni-btn-success"
                        onClick={() => handleBusinessAction(business.id, 'update', 'activa')}
                        disabled={loading}
                      >
                        <FaCheckCircle /> Reactivar
                      </button>
                      <button 
                        className="cni-btn cni-btn-danger"
                        onClick={() => handleBusinessAction(business.id, 'update', 'clausurada')}
                        disabled={loading}
                      >
                        <FaTimes /> Clausurar
                      </button>
                    </>
                  )}
                  {business.estado === 'bajo_investigacion' && (
                    <>
                      <button 
                        className="cni-btn cni-btn-success"
                        onClick={() => handleBusinessAction(business.id, 'update', 'activa')}
                        disabled={loading}
                      >
                        <FaCheckCircle /> Limpiar
                      </button>
                      <button 
                        className="cni-btn cni-btn-danger"
                        onClick={() => handleBusinessAction(business.id, 'update', 'clausurada')}
                        disabled={loading}
                      >
                        <FaTimes /> Clausurar
                      </button>
                    </>
                  )}
                  <button 
                    className="cni-btn cni-btn-danger"
                    onClick={() => handleBusinessAction(business.id, 'delete')}
                    disabled={loading}
                  >
                    <FaTimes /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Pestaña de Blog CNI
const BlogTab = ({ cache }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewArticle, setShowNewArticle] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = (type, message) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(''), 3000);
  };
  
  // Estados para autocompletado
  const [cniAgents, setCniAgents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  
  const [newArticle, setNewArticle] = useState({
    titulo: '',
    banda: '',
    categoria: 'investigacion',
    contenido: '',
    imagen_url: '',
    agente: '',
    nivel_seguridad: 'confidencial'
  });

  // Cargar agentes CNI para autocompletado
  const loadCniAgents = async () => {
    try {
      const agents = [
        'BijjouPro08', 'nanobox_32', 'RA_ESTE', 'lichandro56',
        'LAFROGCRAZI', 'Elgato21053', 'Mimi (YoSoySergiox)', 'The441884',
        'amigo_dedoc', 'Secret_Agent', 'nicogamer2220', 'Director_CNI'
      ];
      setCniAgents(agents);
    } catch (err) {
      console.error('Error cargando agentes CNI:', err);
    }
  };

  // Manejar input de agente con autocompletado
  const handleAgentInput = (value, setter) => {
    setter(value);
    if (value.length > 1) {
      const filtered = cniAgents.filter(agent => 
        agent.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (agent, setter) => {
    setter(agent);
    setShowSuggestions(false);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar agentes al montar el componente
  useEffect(() => {
    loadCniAgents();
  }, []);

  const loadArticles = async () => {
    console.log('[CNI][BLOG] 📚 Cargando artículos del blog...');
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/cni/blog'));
      console.log('[CNI][BLOG] 📡 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][BLOG] 📋 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`[CNI][BLOG] ✅ Cargados ${data.articles.length} artículos`);
        setArticles(data.articles);
      } else {
        console.log('[CNI][BLOG] ❌ Error en respuesta:', data.error);
        setError('Error cargando artículos');
      }
    } catch (err) {
      console.error('[CNI][BLOG] ❌ Error cargando artículos:', err);
      setError('Error de conexión al cargar artículos');
    } finally {
      setLoading(false);
      console.log('[CNI][BLOG] ✅ Carga de artículos finalizada');
    }
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    console.log('[CNI][BLOG] ✍️ Creando nuevo artículo:', newArticle);
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('[CNI][BLOG] 📡 Enviando petición de creación...');
      const response = await fetch(apiUrl('/api/cni/blog'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle)
      });
      
      console.log('[CNI][BLOG] 📊 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][BLOG] 📋 Datos de respuesta:', data);
      
      if (data.success) {
        console.log('[CNI][BLOG] ✅ Artículo creado exitosamente');
        setSuccess('Artículo creado correctamente');
        setNewArticle({ titulo: '', banda: '', categoria: 'investigacion', contenido: '', imagen_url: '', agente: '', nivel_seguridad: 'confidencial' });
        setShowNewArticle(false);
        console.log('[CNI][BLOG] 🔄 Recargando lista de artículos...');
        loadArticles();
      } else {
        console.log('[CNI][BLOG] ❌ Error en creación:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][BLOG] ❌ Error creando artículo:', err);
      setError('❌ Error de conexión al crear artículo');
    } finally {
      setLoading(false);
      console.log('[CNI][BLOG] ✅ Proceso de creación finalizado');
    }
  };

  const handleDeleteArticle = async (articleId) => {
    console.log(`[CNI][BLOG] 🗑️ Iniciando eliminación de artículo ${articleId}`);
    if (!window.confirm('¿Estás seguro de eliminar este artículo?')) {
      console.log('[CNI][BLOG] ❌ Eliminación cancelada por el usuario');
      return;
    }
    
    console.log('[CNI][BLOG] ✅ Confirmación aceptada, eliminando artículo...');
    setLoading(true);
    try {
      console.log('[CNI][BLOG] 📡 Enviando petición de eliminación...');
      const response = await fetch(apiUrl(`/api/cni/blog/${articleId}`), {
        method: 'DELETE'
      });
      
      console.log('[CNI][BLOG] 📊 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][BLOG] 📋 Datos de respuesta:', data);
      
      if (data.success) {
        console.log('[CNI][BLOG] ✅ Artículo eliminado exitosamente');
        setSuccess('Artículo eliminado correctamente');
        console.log('[CNI][BLOG] 🔄 Recargando lista de artículos...');
        loadArticles();
      } else {
        console.log('[CNI][BLOG] ❌ Error en eliminación:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][BLOG] ❌ Error eliminando artículo:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
      console.log('[CNI][BLOG] ✅ Proceso de eliminación finalizado');
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaFileAlt /> Archivos CNI - Sistema de Inteligencia</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}

      <div className="cni-blog-header">
        <button 
          className="cni-btn cni-btn-primary"
          onClick={() => setShowNewArticle(!showNewArticle)}
        >
          <FaPlus /> Nuevo Archivo
        </button>
      </div>

      {showNewArticle && (
        <div className="cni-section">
          <h3><FaPlus /> Crear Nuevo Archivo</h3>
          <form onSubmit={handleAddArticle} className="cni-form">
            <div className="cni-form-group">
              <label>Título del Archivo:</label>
              <input
                type="text"
                className="cni-input"
                value={newArticle.titulo}
                onChange={(e) => setNewArticle(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Investigación Banda Los Zetas"
                required
              />
            </div>
            
            <div className="cni-form-group">
              <label>Banda/Organización:</label>
              <input
                type="text"
                className="cni-input"
                value={newArticle.banda}
                onChange={(e) => setNewArticle(prev => ({ ...prev, banda: e.target.value }))}
                placeholder="Nombre de la banda"
                required
              />
            </div>

            <div className="cni-form-group">
              <label>Categoría:</label>
              <select
                className="cni-select"
                value={newArticle.categoria}
                onChange={(e) => setNewArticle(prev => ({ ...prev, categoria: e.target.value }))}
              >
                <option value="investigacion">Investigación</option>
                <option value="operacion">Operación</option>
                <option value="inteligencia">Inteligencia</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="archivo">Archivo</option>
              </select>
            </div>

            <div className="cni-form-group">
              <label>Nivel de Seguridad:</label>
              <select
                className="cni-select"
                value={newArticle.nivel_seguridad}
                onChange={(e) => setNewArticle(prev => ({ ...prev, nivel_seguridad: e.target.value }))}
              >
                <option value="publico">Público</option>
                <option value="confidencial">Confidencial</option>
                <option value="secreto">Secreto</option>
                <option value="ultra_secreto">Ultra Secreto</option>
              </select>
            </div>

            <div className="cni-form-group">
              <label>URL de Imagen:</label>
              <input
                type="url"
                className="cni-input"
                value={newArticle.imagen_url}
                onChange={(e) => setNewArticle(prev => ({ ...prev, imagen_url: e.target.value }))}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="cni-form-group">
              <label>Agente Responsable:</label>
              <div className="cni-autocomplete-container" ref={suggestionRef}>
                <input
                  type="text"
                  className="cni-input"
                  value={newArticle.agente}
                  onChange={(e) => handleAgentInput(e.target.value, (value) => setNewArticle(prev => ({ ...prev, agente: value })))}
                  placeholder="Nombre del agente"
                  autoComplete="off"
                  required
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="cni-suggestions-dropdown">
                    {suggestions.map((agent, index) => (
                      <div 
                        key={index}
                        className="cni-suggestion-item"
                        onClick={() => selectSuggestion(agent, (value) => setNewArticle(prev => ({ ...prev, agente: value })))}
                      >
                        <FaUser /> {agent}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="cni-form-group">
              <label>Contenido:</label>
              <textarea
                className="cni-textarea"
                value={newArticle.contenido}
                onChange={(e) => setNewArticle(prev => ({ ...prev, contenido: e.target.value }))}
                placeholder="Detalles de la investigación, operación, etc..."
                rows="6"
                required
              />
            </div>

            <div className="cni-form-actions">
              <button type="submit" className="cni-btn cni-btn-primary" disabled={loading}>
                {loading ? <FaSpinner className="fa-spin" /> : <FaPlus />} 
                {loading ? 'Creando...' : 'Crear Archivo'}
              </button>
              <button 
                type="button" 
                className="cni-btn cni-btn-secondary"
                onClick={() => setShowNewArticle(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cni-section">
        <div className="cni-section-header">
          <h3><FaFileAlt /> Archivos Existentes ({articles.length})</h3>
          <ExportButtons 
            data={articles} 
            filename="archivos_cni" 
            title="Archivos CNI" 
            type="blog"
            onExport={handleExport}
          />
        </div>

        {exportMessage && (
          <div className={`cni-export-message ${exportMessage.includes('Error') ? 'error' : 'success'}`}>
            {exportMessage}
          </div>
        )}

        {loading ? (
          <div className="cni-loading">
            <FaSpinner className="fa-spin" />
            <p>Cargando archivos...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="cni-no-data">
            <FaFileAlt />
            <p>No hay archivos creados</p>
          </div>
        ) : (
          <div className="cni-blog-grid">
            {articles.map(article => (
              <div key={article.id} className="cni-blog-card">
                <div className="cni-blog-header">
                  <h4>{article.titulo}</h4>
                  <span className={`cni-blog-security ${article.nivel_seguridad}`}>
                    {article.nivel_seguridad.toUpperCase()}
                  </span>
                </div>
                
                {article.imagen_url && (
                  <div className="cni-blog-image">
                    <img src={article.imagen_url} alt={article.titulo} />
                  </div>
                )}
                
                <div className="cni-blog-content">
                  <div className="cni-blog-meta">
                    <span><FaBuilding /> {article.banda}</span>
                    <span><FaUser /> {article.agente}</span>
                    <span><FaCalendarAlt /> {new Date(article.fecha_creacion).toLocaleDateString('es-ES')}</span>
                  </div>
                  
                  <div className="cni-blog-category">
                    <span className={`cni-blog-category-badge ${article.categoria}`}>
                      {article.categoria.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="cni-blog-text">
                    <p>{article.contenido}</p>
                  </div>
                </div>
                
                <div className="cni-blog-actions">
                  <button 
                    className="cni-btn cni-btn-danger"
                    onClick={() => handleDeleteArticle(article.id)}
                    disabled={loading}
                  >
                    <FaTimes /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Pestaña de Jugadores en Ciudad
const PlayersInCityTab = ({ cache }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = (type, message) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(''), 3000);
  };

  const loadPlayers = async () => {
    console.log('[CNI][JUGADORES] 👥 Cargando jugadores en ciudad...');
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(apiUrl('/api/cni/tracking/players'));
      console.log('[CNI][JUGADORES] 📡 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][JUGADORES] 📋 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`[CNI][JUGADORES] ✅ Cargados ${data.players.length} jugadores`);
        setPlayers(data.players);
        setLastUpdate(new Date());
        setSuccess(`${data.players.length} jugadores detectados en la ciudad`);
      } else {
        console.log('[CNI][JUGADORES] ❌ Error en respuesta:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][JUGADORES] ❌ Error cargando jugadores:', err);
      setError('Error de conexión al cargar jugadores');
    } finally {
      setLoading(false);
      console.log('[CNI][JUGADORES] ✅ Carga de jugadores finalizada');
    }
  };

  const getTeamIcon = (team) => {
    switch (team.toLowerCase()) {
      case 'police':
        return <FaShieldAlt />;
      case 'medical':
        return <FaUserShield />;
      case 'fire':
        return <FaCarCrash />;
      case 'civilian':
        return <FaUser />;
      default:
        return <FaUser />;
    }
  };

  const getTeamColor = (team) => {
    switch (team.toLowerCase()) {
      case 'police':
        return '#3b82f6';
      case 'medical':
        return '#10b981';
      case 'fire':
        return '#f59e0b';
      case 'civilian':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getPermissionColor = (permission) => {
    switch (permission.toLowerCase()) {
      case 'server owner':
        return '#dc2626';
      case 'server administrator':
        return '#f59e0b';
      case 'server moderator':
        return '#8b5cf6';
      case 'normal':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaUsers /> Ciudadanos Detectados en la Ciudad</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}

      <div className="cni-section-header">
        <div className="cni-stats-overview">
          <div className="cni-stat-item">
            <span className="cni-stat-label">Total Ciudadanos</span>
            <span className="cni-stat-value">{players.length}</span>
          </div>
          <div className="cni-stat-item">
            <span className="cni-stat-label">Última Actualización</span>
            <span className="cni-stat-value">
              {lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Nunca'}
            </span>
          </div>
        </div>
        
        <div className="cni-header-actions">
          <ExportButtons 
            data={players} 
            filename="ciudadanos_detectados" 
            title="Ciudadanos Detectados" 
            type="players"
            onExport={handleExport}
          />
          <button 
            className="cni-btn cni-btn-primary"
            onClick={loadPlayers}
            disabled={loading}
          >
            {loading ? <FaSpinner className="fa-spin" /> : <FaUsers />}
            {loading ? 'Actualizando...' : 'Actualizar Lista'}
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className={`cni-export-message ${exportMessage.includes('Error') ? 'error' : 'success'}`}>
          {exportMessage}
        </div>
      )}

      {loading ? (
        <div className="cni-loading">
          <FaSpinner className="fa-spin" />
          <p>Obteniendo datos de ciudadanos en tiempo real...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="cni-no-data">
          <FaUsers />
          <p>No hay ciudadanos detectados en la ciudad</p>
          <p>La ciudad puede estar vacía o hay un problema de conexión con las detecciones</p>
        </div>
      ) : (
        <div className="cni-players-grid">
          {players.map((player, index) => (
            <div key={index} className="cni-player-card">
              <div className="cni-player-header">
                <div className="cni-player-avatar">
                  {getTeamIcon(player.Team)}
                </div>
                <div className="cni-player-info">
                  <h4>{player.Player.split(':')[0]}</h4>
                  <p className="cni-player-id">ID: {player.Player.split(':')[1]}</p>
                </div>
                <div className="cni-player-badges">
                  <span 
                    className="cni-team-badge"
                    style={{ backgroundColor: getTeamColor(player.Team) }}
                  >
                    {player.Team}
                  </span>
                  <span 
                    className="cni-permission-badge"
                    style={{ backgroundColor: getPermissionColor(player.Permission) }}
                  >
                    {player.Permission}
                  </span>
                </div>
              </div>
              
              <div className="cni-player-details">
                {player.Callsign && (
                  <div className="cni-player-field">
                    <label>Indicativo:</label>
                    <span>{player.Callsign}</span>
                  </div>
                )}
                <div className="cni-player-field">
                  <label>Equipo:</label>
                  <span style={{ color: getTeamColor(player.Team) }}>
                    {player.Team}
                  </span>
                </div>
                <div className="cni-player-field">
                  <label>Permisos:</label>
                  <span style={{ color: getPermissionColor(player.Permission) }}>
                    {player.Permission}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Pestaña de Vehículos en Ciudad
const VehiclesInCityTab = ({ cache }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = (type, message) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(''), 3000);
  };

  const loadVehicles = async () => {
    console.log('[CNI][VEHÍCULOS] 🚗 Cargando vehículos en ciudad...');
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(apiUrl('/api/cni/tracking/vehicles'));
      console.log('[CNI][VEHÍCULOS] 📡 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][VEHÍCULOS] 📋 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`[CNI][VEHÍCULOS] ✅ Cargados ${data.vehicles.length} vehículos`);
        setVehicles(data.vehicles);
        setLastUpdate(new Date());
        setSuccess(`${data.vehicles.length} vehículos detectados en la ciudad`);
      } else {
        console.log('[CNI][VEHÍCULOS] ❌ Error en respuesta:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][VEHÍCULOS] ❌ Error cargando vehículos:', err);
      setError('Error de conexión al cargar vehículos');
    } finally {
      setLoading(false);
      console.log('[CNI][VEHÍCULOS] ✅ Carga de vehículos finalizada');
    }
  };

  const getVehicleIcon = (name) => {
    if (name.toLowerCase().includes('police') || name.toLowerCase().includes('interceptor')) {
      return <FaShieldAlt />;
    } else if (name.toLowerCase().includes('ambulance') || name.toLowerCase().includes('medical')) {
      return <FaUserShield />;
    } else if (name.toLowerCase().includes('fire') || name.toLowerCase().includes('truck')) {
      return <FaCarCrash />;
    } else {
      return <FaCarCrash />;
    }
  };

  const getVehicleType = (name) => {
    if (name.toLowerCase().includes('police') || name.toLowerCase().includes('interceptor')) {
      return 'Policial';
    } else if (name.toLowerCase().includes('ambulance') || name.toLowerCase().includes('medical')) {
      return 'Médico';
    } else if (name.toLowerCase().includes('fire') || name.toLowerCase().includes('truck')) {
      return 'Bomberos';
    } else {
      return 'Civil';
    }
  };

  const getVehicleColor = (name) => {
    if (name.toLowerCase().includes('police') || name.toLowerCase().includes('interceptor')) {
      return '#3b82f6';
    } else if (name.toLowerCase().includes('ambulance') || name.toLowerCase().includes('medical')) {
      return '#10b981';
    } else if (name.toLowerCase().includes('fire') || name.toLowerCase().includes('truck')) {
      return '#f59e0b';
    } else {
      return '#6b7280';
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaCarCrash /> Vehículos Actualmente en la Ciudad</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}

      <div className="cni-section-header">
        <div className="cni-stats-overview">
          <div className="cni-stat-item">
            <span className="cni-stat-label">Total Vehículos</span>
            <span className="cni-stat-value">{vehicles.length}</span>
          </div>
          <div className="cni-stat-item">
            <span className="cni-stat-label">Última Actualización</span>
            <span className="cni-stat-value">
              {lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Nunca'}
            </span>
          </div>
        </div>
        
        <div className="cni-header-actions">
          <ExportButtons 
            data={vehicles} 
            filename="vehiculos_detectados" 
            title="Vehículos Detectados" 
            type="vehicles"
            onExport={handleExport}
          />
          <button 
            className="cni-btn cni-btn-primary"
            onClick={loadVehicles}
            disabled={loading}
          >
            {loading ? <FaSpinner className="fa-spin" /> : <FaCarCrash />}
            {loading ? 'Actualizando...' : 'Actualizar Lista'}
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className={`cni-export-message ${exportMessage.includes('Error') ? 'error' : 'success'}`}>
          {exportMessage}
        </div>
      )}

      {loading ? (
        <div className="cni-loading">
          <FaSpinner className="fa-spin" />
          <p>Obteniendo datos de vehículos en tiempo real...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="cni-no-data">
          <FaCarCrash />
          <p>No hay vehículos detectados en la ciudad</p>
          <p>La ciudad puede estar vacía o hay un problema de conexión con las detecciones</p>
        </div>
      ) : (
        <div className="cni-vehicles-grid">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="cni-vehicle-card">
              <div className="cni-vehicle-header">
                <div className="cni-vehicle-icon">
                  {getVehicleIcon(vehicle.Name)}
                </div>
                <div className="cni-vehicle-info">
                  <h4>{vehicle.Name}</h4>
                  <p className="cni-vehicle-owner">Propietario: {vehicle.Owner}</p>
                </div>
                <div className="cni-vehicle-badges">
                  <span 
                    className="cni-vehicle-type-badge"
                    style={{ backgroundColor: getVehicleColor(vehicle.Name) }}
                  >
                    {getVehicleType(vehicle.Name)}
                  </span>
                  <span 
                    className="cni-vehicle-texture-badge"
                    style={{ backgroundColor: '#6b7280' }}
                  >
                    {vehicle.Texture}
                  </span>
                </div>
              </div>
              
              <div className="cni-vehicle-details">
                <div className="cni-vehicle-field">
                  <label>Modelo:</label>
                  <span>{vehicle.Name}</span>
                </div>
                <div className="cni-vehicle-field">
                  <label>Propietario:</label>
                  <span>{vehicle.Owner}</span>
                </div>
                <div className="cni-vehicle-field">
                  <label>Tipo:</label>
                  <span style={{ color: getVehicleColor(vehicle.Name) }}>
                    {getVehicleType(vehicle.Name)}
                  </span>
                </div>
                <div className="cni-vehicle-field">
                  <label>Textura:</label>
                  <span>{vehicle.Texture}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CNISection;
