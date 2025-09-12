const { Client, GatewayIntentBits, Partials, ChannelType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel] // Necesario para DMs
});

client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on("messageCreate", (msg) => {
  if (msg.channel.type === ChannelType.DM && !msg.author.bot) {
    console.log(`📩 DM recibido de ${msg.author.tag}: ${msg.content}`);
  }
});

client.login("MTM4NzE1MDI1MDMzNDA5NzYyNA.GembfZ.AEm24X2ojV3whxVwOKO_4xsMtySTFA1bbbercU");
