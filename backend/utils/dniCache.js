const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración del cache
const CACHE_DIR = path.join(__dirname, '..', 'cache', 'dni');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en ms

// Asegurar que el directorio de cache existe
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Función para generar hash del DNI
function generateDNIHash(discordId, timestamp = null) {
  const data = `${discordId}_${timestamp || Date.now()}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

// Función para obtener ruta del archivo cache
function getCachePath(hash) {
  return path.join(CACHE_DIR, `${hash}.png`);
}

// Función para verificar si el cache es válido
function isCacheValid(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  const stats = fs.statSync(filePath);
  const now = Date.now();
  const fileAge = now - stats.mtime.getTime();
  
  return fileAge < CACHE_DURATION;
}

// Función para comprimir imagen
async function compressImage(buffer, quality = 85) {
  try {
    const compressed = await sharp(buffer)
      .png({ 
        quality: quality,
        compressionLevel: 9,
        progressive: true
      })
      .toBuffer();
    
    console.log(`[DNI CACHE] Imagen comprimida: ${buffer.length} -> ${compressed.length} bytes (${Math.round((1 - compressed.length / buffer.length) * 100)}% reducción)`);
    
    return compressed;
  } catch (error) {
    console.error('[DNI CACHE] Error comprimiendo imagen:', error);
    return buffer; // Devolver original si falla la compresión
  }
}

// Función para obtener DNI del cache
function getCachedDNI(discordId, timestamp = null) {
  const hash = generateDNIHash(discordId, timestamp);
  const cachePath = getCachePath(hash);
  
  if (isCacheValid(cachePath)) {
    console.log(`[DNI CACHE] Cache hit para ${discordId}`);
    return {
      found: true,
      buffer: fs.readFileSync(cachePath),
      path: cachePath
    };
  }
  
  console.log(`[DNI CACHE] Cache miss para ${discordId}`);
  return { found: false };
}

// Función para guardar DNI en cache
async function cacheDNI(discordId, buffer, timestamp = null) {
  try {
    const hash = generateDNIHash(discordId, timestamp);
    const cachePath = getCachePath(hash);
    
    // Comprimir la imagen antes de guardar
    const compressedBuffer = await compressImage(buffer);
    
    fs.writeFileSync(cachePath, compressedBuffer);
    
    console.log(`[DNI CACHE] DNI guardado en cache: ${discordId} -> ${cachePath}`);
    
    return {
      success: true,
      path: cachePath,
      size: compressedBuffer.length,
      originalSize: buffer.length
    };
  } catch (error) {
    console.error('[DNI CACHE] Error guardando en cache:', error);
    return { success: false, error: error.message };
  }
}

// Función para limpiar cache expirado
function cleanExpiredCache() {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    let cleaned = 0;
    
    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      if (!isCacheValid(filePath)) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`[DNI CACHE] Limpiados ${cleaned} archivos expirados del cache`);
    }
    
    return cleaned;
  } catch (error) {
    console.error('[DNI CACHE] Error limpiando cache:', error);
    return 0;
  }
}

// Función para obtener estadísticas del cache
function getCacheStats() {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    let totalSize = 0;
    let validFiles = 0;
    let expiredFiles = 0;
    
    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      if (isCacheValid(filePath)) {
        validFiles++;
      } else {
        expiredFiles++;
      }
    });
    
    return {
      totalFiles: files.length,
      validFiles,
      expiredFiles,
      totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
    };
  } catch (error) {
    console.error('[DNI CACHE] Error obteniendo estadísticas:', error);
    return null;
  }
}

// Limpiar cache cada hora
setInterval(cleanExpiredCache, 60 * 60 * 1000);

module.exports = {
  getCachedDNI,
  cacheDNI,
  cleanExpiredCache,
  getCacheStats,
  compressImage,
  generateDNIHash
};
