'use strict';

const { Client, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CHANNEL_ID } = process.env;

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.channelId = DISCORD_CHANNEL_ID;

    this.client.on('ready', () => {
      console.log(`Logged as ${this.client.user.tag}!`);
    });
    this.client.login(DISCORD_TOKEN);
  }

  sendToFormatCode(logData) {
    const { code, message = 'message', title = 'title' } = logData;

    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt('00ff00', 16), // convert hexadecimal color code to integer
          title,
          description: '```json\n' + JSON.stringify(code, null, 2) + '\n```',
        },
      ],
    };

    this.sendToMessage(codeMessage);
  }

  sendToMessage(message = 'message') {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) {
      console.error(`Couldn't find the channel...`, this.channelId);
      return;
    }

    channel.send(message).catch((e) => console.error(`e`));
  }
}

module.exports = new LoggerService();
