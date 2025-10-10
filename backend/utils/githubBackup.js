const { Octokit } = require('@octokit/rest');
const fs = require('fs-extra');
const path = require('path');

class GitHubBackup {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    
    this.owner = 'Bijjouspnrp';
    this.repo = 'spainrp-web';
    this.branch = 'main';
    this.backupPath = 'database-backups/spainrp-backup.json';
    
    this.isEnabled = !!process.env.GITHUB_TOKEN;
    
    if (!this.isEnabled) {
      console.warn('[BACKUP] ⚠️ GITHUB_TOKEN no configurado, backup deshabilitado');
    }
  }

  // Crear backup de la base de datos
  async createBackup() {
    if (!this.isEnabled) {
      console.log('[BACKUP] ⚠️ Backup deshabilitado - GITHUB_TOKEN no configurado');
      return { success: false, message: 'Backup deshabilitado' };
    }

    try {
      console.log('[BACKUP] 🔄 Iniciando backup de base de datos...');
      
      // Leer datos de la base de datos
      const dbData = await this.exportDatabaseData();
      
      // Crear archivo de backup temporal
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tables: dbData,
        metadata: {
          totalTables: Object.keys(dbData).length,
          backupType: 'full',
          environment: process.env.NODE_ENV || 'production'
        }
      };

      const backupContent = JSON.stringify(backupData, null, 2);
      
      // Subir a GitHub
      const result = await this.uploadToGitHub(backupContent);
      
      console.log('[BACKUP] ✅ Backup completado exitosamente');
      return { success: true, message: 'Backup creado', sha: result.sha };
      
    } catch (error) {
      console.error('[BACKUP] ❌ Error creando backup:', error);
      return { success: false, message: error.message };
    }
  }

  // Exportar datos de la base de datos
  async exportDatabaseData() {
    const db = require('./database').getDatabase();
    
    return new Promise((resolve, reject) => {
      const tables = [
        'sessions', 'announcements', 'polls', 'poll_votes', 'notifications',
        'access_logs', 'error_logs', 'maintenance_subscribers', 'news_comments',
        'news_reactions', 'calendar_claims', 'calendar_streaks', 'web_bans',
        'ip_tracking', 'empresas', 'visitas_empresas'
      ];
      
      const exportData = {};
      let completed = 0;
      
      tables.forEach(tableName => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) {
            console.warn(`[BACKUP] ⚠️ Error exportando tabla ${tableName}:`, err.message);
            exportData[tableName] = [];
          } else {
            exportData[tableName] = rows || [];
          }
          
          completed++;
          if (completed === tables.length) {
            resolve(exportData);
          }
        });
      });
    });
  }

  // Subir archivo a GitHub
  async uploadToGitHub(content) {
    try {
      // Verificar si el archivo ya existe
      let existingFile = null;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: this.backupPath,
          ref: this.branch
        });
        existingFile = data;
      } catch (error) {
        // Archivo no existe, continuar
      }

      // Crear o actualizar archivo
      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: this.backupPath,
        message: `Backup automático - ${new Date().toISOString()}`,
        content: Buffer.from(content).toString('base64'),
        branch: this.branch,
        sha: existingFile?.sha
      });

      return data;
      
    } catch (error) {
      console.error('[BACKUP] ❌ Error subiendo a GitHub:', error);
      throw error;
    }
  }

  // Restaurar backup desde GitHub
  async restoreBackup() {
    if (!this.isEnabled) {
      console.log('[BACKUP] ⚠️ Restauración deshabilitada - GITHUB_TOKEN no configurado');
      return { success: false, message: 'Restauración deshabilitada' };
    }

    try {
      console.log('[BACKUP] 🔄 Restaurando backup desde GitHub...');
      
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.backupPath,
        ref: this.branch
      });

      const backupContent = Buffer.from(data.content, 'base64').toString('utf-8');
      const backupData = JSON.parse(backupContent);
      
      // Restaurar datos
      await this.importDatabaseData(backupData.tables);
      
      console.log('[BACKUP] ✅ Restauración completada exitosamente');
      return { success: true, message: 'Backup restaurado', timestamp: backupData.timestamp };
      
    } catch (error) {
      console.error('[BACKUP] ❌ Error restaurando backup:', error);
      return { success: false, message: error.message };
    }
  }

  // Importar datos a la base de datos
  async importDatabaseData(tablesData) {
    const db = require('./database').getDatabase();
    
    return new Promise((resolve, reject) => {
      const tableNames = Object.keys(tablesData);
      let completed = 0;
      
      tableNames.forEach(tableName => {
        const rows = tablesData[tableName];
        
        if (rows.length === 0) {
          completed++;
          if (completed === tableNames.length) resolve();
          return;
        }

        // Limpiar tabla existente
        db.run(`DELETE FROM ${tableName}`, (err) => {
          if (err) {
            console.warn(`[BACKUP] ⚠️ Error limpiando tabla ${tableName}:`, err.message);
          }

          // Insertar datos
          const columns = Object.keys(rows[0]);
          const placeholders = columns.map(() => '?').join(', ');
          const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

          let inserted = 0;
          rows.forEach(row => {
            const values = columns.map(col => row[col]);
            db.run(sql, values, (err) => {
              if (err) {
                console.warn(`[BACKUP] ⚠️ Error insertando en ${tableName}:`, err.message);
              }
              
              inserted++;
              if (inserted === rows.length) {
                completed++;
                if (completed === tableNames.length) resolve();
              }
            });
          });
        });
      });
    });
  }

  // Backup programado (cada 5 minutos)
  startScheduledBackup() {
    if (!this.isEnabled) return;

    console.log('[BACKUP] ⏰ Iniciando backup programado cada 5 minutos');
    
    setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        console.error('[BACKUP] ❌ Error en backup programado:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos
  }
}

module.exports = new GitHubBackup();
