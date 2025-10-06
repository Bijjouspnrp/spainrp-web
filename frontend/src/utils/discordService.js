import { apiUrl } from './api';

class DiscordService {
  constructor() {
    this.webhookUrl = apiUrl('/api/discord/webhook');
    this.logChannelId = '1384341721638240367';
  }

  // Enviar embed a Discord
  async sendEmbed(embedData) {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) {
        console.warn('No hay token de autenticación para Discord');
        return;
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channelId: this.logChannelId,
          embed: embedData
        })
      });

      if (!response.ok) {
        console.error('Error enviando embed a Discord:', response.status);
      }
    } catch (error) {
      console.error('Error en Discord service:', error);
    }
  }

  // Embed para búsqueda MDT
  async sendSearchEmbed(userId, searchType, searchTerm, results) {
    const embed = {
      title: '🔍 **Búsqueda MDT**',
      color: 0x4a90e2,
      fields: [
        {
          name: '👮 **Agente**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '🔎 **Tipo de Búsqueda**',
          value: `\`\`\`${searchType}\`\`\``,
          inline: true
        },
        {
          name: '📝 **Término**',
          value: `\`\`\`${searchTerm}\`\`\``,
          inline: true
        },
        {
          name: '📊 **Resultados**',
          value: `\`\`\`${results?.length || 0} encontrados\`\`\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Sistema MDT'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para multa
  async sendFineEmbed(userId, targetUser, amount, reason, fineId) {
    const embed = {
      title: '💰 **Multa Aplicada**',
      color: 0xe74c3c,
      fields: [
        {
          name: '👮 **Agente**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '👤 **Ciudadano**',
          value: `\`\`\`${targetUser}\`\`\``,
          inline: true
        },
        {
          name: '💵 **Cantidad**',
          value: `\`\`\`$${amount}\`\`\``,
          inline: true
        },
        {
          name: '📋 **Motivo**',
          value: `\`\`\`${reason}\`\`\``,
          inline: false
        },
        {
          name: '🆔 **ID de Multa**',
          value: `\`\`\`${fineId}\`\`\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Sistema MDT'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para arresto
  async sendArrestEmbed(userId, targetUser, charges, totalFine, icTime, oocTime, arrestId) {
    const chargesList = charges.map(charge => `• ${charge}`).join('\n');
    
    const embed = {
      title: '🔒 **Arresto Realizado**',
      color: 0x8b5cf6,
      fields: [
        {
          name: '👮 **Agente**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '👤 **Ciudadano**',
          value: `\`\`\`${targetUser}\`\`\``,
          inline: true
        },
        {
          name: '📊 **Cargos**',
          value: `\`\`\`${charges.length} cargos\`\`\``,
          inline: true
        },
        {
          name: '📋 **Lista de Cargos**',
          value: `\`\`\`${chargesList}\`\`\``,
          inline: false
        },
        {
          name: '💵 **Multa Total**',
          value: `\`\`\`$${totalFine}\`\`\``,
          inline: true
        },
        {
          name: '⏰ **Tiempo IC**',
          value: `\`\`\`${icTime} minutos\`\`\``,
          inline: true
        },
        {
          name: '⏰ **Tiempo OOC**',
          value: `\`\`\`${oocTime} minutos\`\`\``,
          inline: true
        },
        {
          name: '🆔 **ID de Arresto**',
          value: `\`\`\`${arrestId}\`\`\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Sistema MDT'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para acciones CNI
  async sendCNIEmbed(userId, action, details) {
    const embed = {
      title: '🕵️ **Acción CNI**',
      color: 0x8a2be2,
      fields: [
        {
          name: '🕵️ **Agente CNI**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '⚡ **Acción**',
          value: `\`\`\`${action}\`\`\``,
          inline: true
        },
        {
          name: '📊 **Detalles**',
          value: `\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Centro Nacional de Inteligencia'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para búsqueda CNI
  async sendCNISearchEmbed(userId, searchType, searchTerm, results) {
    const embed = {
      title: '🔍 **Búsqueda CNI**',
      color: 0x8a2be2,
      fields: [
        {
          name: '🕵️ **Agente CNI**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '🔎 **Tipo de Búsqueda**',
          value: `\`\`\`${searchType}\`\`\``,
          inline: true
        },
        {
          name: '📝 **Término**',
          value: `\`\`\`${searchTerm}\`\`\``,
          inline: true
        },
        {
          name: '📊 **Resultados**',
          value: `\`\`\`${results?.length || 0} encontrados\`\`\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Centro Nacional de Inteligencia'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para registro empresarial
  async sendBusinessRecordEmbed(userId, businessName, businessType, action) {
    const embed = {
      title: '🏢 **Registro Empresarial**',
      color: 0x2ecc71,
      fields: [
        {
          name: '🕵️ **Agente CNI**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '⚡ **Acción**',
          value: `\`\`\`${action}\`\`\``,
          inline: true
        },
        {
          name: '🏢 **Empresa**',
          value: `\`\`\`${businessName}\`\`\``,
          inline: true
        },
        {
          name: '🏷️ **Tipo**',
          value: `\`\`\`${businessType}\`\`\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Centro Nacional de Inteligencia'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para visita empresarial
  async sendBusinessVisitEmbed(userId, businessName, visitType, details) {
    const embed = {
      title: '🏢 **Visita Empresarial**',
      color: 0xf39c12,
      fields: [
        {
          name: '🕵️ **Agente CNI**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '🏢 **Empresa**',
          value: `\`\`\`${businessName}\`\`\``,
          inline: true
        },
        {
          name: '📋 **Tipo de Visita**',
          value: `\`\`\`${visitType}\`\`\``,
          inline: true
        },
        {
          name: '📊 **Detalles**',
          value: `\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Centro Nacional de Inteligencia'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para artículo de blog
  async sendBlogArticleEmbed(userId, articleTitle, action) {
    const embed = {
      title: '📝 **Artículo de Blog**',
      color: 0x3498db,
      fields: [
        {
          name: '🕵️ **Agente CNI**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '⚡ **Acción**',
          value: `\`\`\`${action}\`\`\``,
          inline: true
        },
        {
          name: '📝 **Título**',
          value: `\`\`\`${articleTitle}\`\`\``,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Centro Nacional de Inteligencia'
      }
    };

    await this.sendEmbed(embed);
  }

  // Embed para tracking
  async sendTrackingEmbed(userId, targetType, targetId, action) {
    const embed = {
      title: `🎯 **Tracking ${targetType === 'player' ? 'Jugador' : 'Vehículo'}**`,
      color: 0xe67e22,
      fields: [
        {
          name: '🕵️ **Agente CNI**',
          value: `\`\`\`${userId}\`\`\``,
          inline: true
        },
        {
          name: '⚡ **Acción**',
          value: `\`\`\`${action}\`\`\``,
          inline: true
        },
        {
          name: `🎯 **${targetType === 'player' ? 'Jugador' : 'Vehículo'}**`,
          value: `\`\`\`${targetId}\`\`\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SpainRP - Centro Nacional de Inteligencia'
      }
    };

    await this.sendEmbed(embed);
  }
}

// Instancia singleton
const discordService = new DiscordService();
export default discordService;
