const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Sistema de Limpieza Automática
class CleanupSystem {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.backupsDir = path.join(__dirname, 'backups');
    this.maxLogAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    this.maxLogSize = 10 * 1024 * 1024; // 10MB por log
    
    this.startScheduledCleanup();
  }

  // Limpiar logs antiguos
  cleanupLogs() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        return;
      }

      const logFiles = fs.readdirSync(this.logsDir);
      let cleanedFiles = 0;
      let savedSpace = 0;

      for (const file of logFiles) {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);
        const age = Date.now() - stats.mtime.getTime();

        // Limpiar logs antiguos o muy grandes
        if (age > this.maxLogAge || stats.size > this.maxLogSize) {
          const fileSize = stats.size;
          
          // Truncar archivo en lugar de eliminarlo para evitar errores
          fs.writeFileSync(filePath, '');
          
          cleanedFiles++;
          savedSpace += fileSize;
          console.log(`[CLEANUP] Truncated log file: ${file} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
        }
      }

      if (cleanedFiles > 0) {
        console.log(`[CLEANUP] Cleaned ${cleanedFiles} log files, saved ${(savedSpace / 1024 / 1024).toFixed(2)}MB`);
      }

    } catch (error) {
      console.error('[CLEANUP] Error cleaning logs:', error);
    }
  }

  // Limpiar backups antiguos
  cleanupBackups() {
    try {
      if (!fs.existsSync(this.backupsDir)) {
        return;
      }

      const backups = fs.readdirSync(this.backupsDir)
        .map(file => ({
          name: file,
          path: path.join(this.backupsDir, file),
          stats: fs.statSync(path.join(this.backupsDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      // Mantener solo los 3 backups más recientes
      const maxBackups = 3;
      if (backups.length > maxBackups) {
        const toDelete = backups.slice(maxBackups);
        let savedSpace = 0;

        for (const backup of toDelete) {
          const size = backup.stats.isDirectory() 
            ? this.getDirectorySize(backup.path)
            : backup.stats.size;
          
          if (backup.stats.isDirectory()) {
            fs.rmSync(backup.path, { recursive: true, force: true });
          } else {
            fs.unlinkSync(backup.path);
          }
          
          savedSpace += size;
          console.log(`[CLEANUP] Deleted old backup: ${backup.name} (${(size / 1024 / 1024).toFixed(2)}MB)`);
        }

        if (savedSpace > 0) {
          console.log(`[CLEANUP] Cleaned old backups, saved ${(savedSpace / 1024 / 1024).toFixed(2)}MB`);
        }
      }

    } catch (error) {
      console.error('[CLEANUP] Error cleaning backups:', error);
    }
  }

  // Calcular tamaño de directorio
  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.error('[CLEANUP] Error calculating directory size:', error);
    }
    
    return totalSize;
  }

  // Limpiar cache de Node.js
  cleanupNodeCache() {
    try {
      if (global.gc) {
        global.gc();
        console.log('[CLEANUP] Garbage collection executed');
      }
    } catch (error) {
      console.error('[CLEANUP] Error running garbage collection:', error);
    }
  }

  // Limpiar archivos temporales
  cleanupTempFiles() {
    try {
      const tempDirs = [
        path.join(__dirname, 'temp'),
        path.join(__dirname, 'cache'),
        path.join(__dirname, '../uploads/temp')
      ];

      let cleanedFiles = 0;
      let savedSpace = 0;

      for (const tempDir of tempDirs) {
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);
          
          for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            const age = Date.now() - stats.mtime.getTime();
            
            // Eliminar archivos temporales de más de 1 hora
            if (age > 60 * 60 * 1000) {
              const fileSize = stats.size;
              fs.unlinkSync(filePath);
              cleanedFiles++;
              savedSpace += fileSize;
            }
          }
        }
      }

      if (cleanedFiles > 0) {
        console.log(`[CLEANUP] Cleaned ${cleanedFiles} temp files, saved ${(savedSpace / 1024 / 1024).toFixed(2)}MB`);
      }

    } catch (error) {
      console.error('[CLEANUP] Error cleaning temp files:', error);
    }
  }

  // Ejecutar limpieza completa
  runFullCleanup() {
    console.log('[CLEANUP] Starting full cleanup...');
    
    this.cleanupLogs();
    this.cleanupBackups();
    this.cleanupTempFiles();
    this.cleanupNodeCache();
    
    console.log('[CLEANUP] Full cleanup completed');
  }

  // Obtener estadísticas de espacio
  getSpaceStats() {
    try {
      const stats = {
        logs: 0,
        backups: 0,
        temp: 0,
        total: 0
      };

      // Logs
      if (fs.existsSync(this.logsDir)) {
        stats.logs = this.getDirectorySize(this.logsDir);
      }

      // Backups
      if (fs.existsSync(this.backupsDir)) {
        stats.backups = this.getDirectorySize(this.backupsDir);
      }

      // Temp files
      const tempDirs = [
        path.join(__dirname, 'temp'),
        path.join(__dirname, 'cache')
      ];

      for (const tempDir of tempDirs) {
        if (fs.existsSync(tempDir)) {
          stats.temp += this.getDirectorySize(tempDir);
        }
      }

      stats.total = stats.logs + stats.backups + stats.temp;

      return {
        logs: (stats.logs / 1024 / 1024).toFixed(2) + 'MB',
        backups: (stats.backups / 1024 / 1024).toFixed(2) + 'MB',
        temp: (stats.temp / 1024 / 1024).toFixed(2) + 'MB',
        total: (stats.total / 1024 / 1024).toFixed(2) + 'MB'
      };

    } catch (error) {
      console.error('[CLEANUP] Error getting space stats:', error);
      return {
        logs: '0MB',
        backups: '0MB',
        temp: '0MB',
        total: '0MB'
      };
    }
  }

  // Iniciar limpieza programada
  startScheduledCleanup() {
    // Limpieza ligera cada hora
    cron.schedule('0 * * * *', () => {
      console.log('[CLEANUP] Running hourly cleanup...');
      this.cleanupTempFiles();
      this.cleanupNodeCache();
    });

    // Limpieza completa cada 6 horas
    cron.schedule('0 */6 * * *', () => {
      console.log('[CLEANUP] Running full cleanup...');
      this.runFullCleanup();
    });

    // Limpieza de logs diaria
    cron.schedule('0 3 * * *', () => {
      console.log('[CLEANUP] Running daily log cleanup...');
      this.cleanupLogs();
    });

    console.log('[CLEANUP] Scheduled cleanup tasks started');
  }
}

// Instancia global
const cleanup = new CleanupSystem();

module.exports = cleanup;
