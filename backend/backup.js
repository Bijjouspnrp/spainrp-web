const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cron = require('node-cron');

// Sistema de Backup Automático
class BackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, 'backups');
    this.dbPath = path.join(__dirname, 'spainrp.db');
    this.maxBackups = 30; // Mantener 30 backups
    this.backupInterval = '0 */6 * * *'; // Cada 6 horas
    this.fullBackupInterval = '0 2 * * *'; // Diario a las 2 AM
    
    this.ensureBackupDir();
    this.startScheduledBackups();
  }

  // Crear directorio de backups si no existe
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('[BACKUP] Created backup directory');
    }
  }

  // Crear backup de la base de datos
  async createDatabaseBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `db_backup_${timestamp}.db`);
    
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.dbPath)) {
        reject(new Error('Database file not found'));
        return;
      }
      
      fs.copyFile(this.dbPath, backupFile, (err) => {
        if (err) {
          console.error('[BACKUP] Error creating database backup:', err);
          reject(err);
        } else {
          console.log(`[BACKUP] Database backup created: ${backupFile}`);
          resolve(backupFile);
        }
      });
    });
  }

  // Crear backup completo del sistema
  async createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.backupDir, `full_backup_${timestamp}`);
    
    try {
      // Crear directorio de backup
      fs.mkdirSync(backupDir, { recursive: true });
      
      // Backup de la base de datos
      if (fs.existsSync(this.dbPath)) {
        const dbBackup = path.join(backupDir, 'spainrp.db');
        fs.copyFileSync(this.dbPath, dbBackup);
      }
      
      // Backup de archivos de configuración
      const configFiles = ['package.json', 'package-lock.json', 'index.js'];
      for (const file of configFiles) {
        const srcPath = path.join(__dirname, file);
        if (fs.existsSync(srcPath)) {
          const destPath = path.join(backupDir, file);
          fs.copyFileSync(srcPath, destPath);
        }
      }
      
      // Backup de directorio de datos
      const dataDir = path.join(__dirname, 'data');
      if (fs.existsSync(dataDir)) {
        const destDataDir = path.join(backupDir, 'data');
        this.copyDirectory(dataDir, destDataDir);
      }
      
      // Crear archivo de metadatos
      const metadata = {
        timestamp: new Date().toISOString(),
        version: require('./package.json').version,
        type: 'full',
        files: this.getBackupFiles(backupDir)
      };
      
      fs.writeFileSync(
        path.join(backupDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      console.log(`[BACKUP] Full backup created: ${backupDir}`);
      return backupDir;
      
    } catch (error) {
      console.error('[BACKUP] Error creating full backup:', error);
      throw error;
    }
  }

  // Copiar directorio recursivamente
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Obtener lista de archivos en backup
  getBackupFiles(dir) {
    const files = [];
    
    const scanDir = (currentDir, relativePath = '') => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const relativeItemPath = path.join(relativePath, item);
        
        if (fs.statSync(itemPath).isDirectory()) {
          scanDir(itemPath, relativeItemPath);
        } else {
          files.push(relativeItemPath);
        }
      }
    };
    
    scanDir(dir);
    return files;
  }

  // Limpiar backups antiguos
  cleanupOldBackups() {
    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('db_backup_') || file.startsWith('full_backup_'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);
      
      // Eliminar backups excedentes
      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);
        
        for (const backup of toDelete) {
          if (backup.stats.isDirectory()) {
            fs.rmSync(backup.path, { recursive: true, force: true });
          } else {
            fs.unlinkSync(backup.path);
          }
          console.log(`[BACKUP] Deleted old backup: ${backup.name}`);
        }
      }
      
    } catch (error) {
      console.error('[BACKUP] Error cleaning up old backups:', error);
    }
  }

  // Verificar integridad de backup
  verifyBackup(backupPath) {
    try {
      if (fs.statSync(backupPath).isDirectory()) {
        // Verificar backup completo
        const metadataPath = path.join(backupPath, 'metadata.json');
        if (!fs.existsSync(metadataPath)) {
          return { valid: false, error: 'Missing metadata file' };
        }
        
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        const expectedFiles = metadata.files || [];
        
        for (const file of expectedFiles) {
          const filePath = path.join(backupPath, file);
          if (!fs.existsSync(filePath)) {
            return { valid: false, error: `Missing file: ${file}` };
          }
        }
        
        return { valid: true, metadata };
      } else {
        // Verificar backup de base de datos
        const stats = fs.statSync(backupPath);
        if (stats.size === 0) {
          return { valid: false, error: 'Empty backup file' };
        }
        
        return { valid: true, size: stats.size };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Restaurar desde backup
  async restoreFromBackup(backupPath) {
    try {
      const verification = this.verifyBackup(backupPath);
      if (!verification.valid) {
        throw new Error(`Invalid backup: ${verification.error}`);
      }
      
      if (fs.statSync(backupPath).isDirectory()) {
        // Restaurar backup completo
        const dbBackup = path.join(backupPath, 'spainrp.db');
        if (fs.existsSync(dbBackup)) {
          fs.copyFileSync(dbBackup, this.dbPath);
          console.log('[BACKUP] Database restored from full backup');
        }
        
        // Restaurar archivos de configuración
        const configFiles = ['package.json', 'package-lock.json'];
        for (const file of configFiles) {
          const srcPath = path.join(backupPath, file);
          if (fs.existsSync(srcPath)) {
            const destPath = path.join(__dirname, file);
            fs.copyFileSync(srcPath, destPath);
          }
        }
        
        console.log('[BACKUP] Full backup restored successfully');
      } else {
        // Restaurar solo base de datos
        fs.copyFileSync(backupPath, this.dbPath);
        console.log('[BACKUP] Database restored from backup');
      }
      
      return true;
    } catch (error) {
      console.error('[BACKUP] Error restoring backup:', error);
      throw error;
    }
  }

  // Listar backups disponibles
  listBackups() {
    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('db_backup_') || file.startsWith('full_backup_'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          const verification = this.verifyBackup(filePath);
          
          return {
            name: file,
            path: filePath,
            type: file.startsWith('db_backup_') ? 'database' : 'full',
            size: stats.size,
            created: stats.mtime,
            valid: verification.valid
          };
        })
        .sort((a, b) => b.created - a.created);
      
      return backups;
    } catch (error) {
      console.error('[BACKUP] Error listing backups:', error);
      return [];
    }
  }

  // Iniciar backups programados
  startScheduledBackups() {
    // Backup de base de datos cada 6 horas
    cron.schedule(this.backupInterval, () => {
      console.log('[BACKUP] Starting scheduled database backup');
      this.createDatabaseBackup()
        .then(() => this.cleanupOldBackups())
        .catch(error => console.error('[BACKUP] Scheduled backup failed:', error));
    });
    
    // Backup completo diario
    cron.schedule(this.fullBackupInterval, () => {
      console.log('[BACKUP] Starting scheduled full backup');
      this.createFullBackup()
        .then(() => this.cleanupOldBackups())
        .catch(error => console.error('[BACKUP] Scheduled full backup failed:', error));
    });
    
    console.log('[BACKUP] Scheduled backups started');
  }
}

// Instancia global
const backup = new BackupSystem();

module.exports = backup;
