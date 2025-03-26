const fs = require('fs');
const path = require('path');

async function logMessages(client, channelId) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
        console.error('Invalid channel.');
        return null;
    }

    let messages = new Map();
    let lastMessageId = null;

    while (true) {
        const fetched = await channel.messages.fetch({ limit: 100, before: lastMessageId });
        if (fetched.size === 0) break; //stop when no more messages are found

        fetched.forEach(msg => messages.set(msg.id, msg));
        lastMessageId = fetched.lastKey(); 

        await new Promise(resolve => setTimeout(resolve, 1000)); // prevent rate limits
    }

    let sortedMessages = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    let logData = '';

    sortedMessages.forEach(msg => {
        let timestamp = msg.createdAt.toISOString().replace('T', ' ').split('.')[0]; // Format: YYYY-MM-DD HH:MM:SS
        let userTag = msg.author ? msg.author.tag : 'Unknown User';

        if (msg.embeds.length > 0) {
            const embed = msg.embeds[0];
            if (embed.footer && embed.footer.text) {
                userTag = embed.footer.text.split(' (')[0];
            }
        }

        if (msg.content) {
            logData += `[${timestamp}] ${userTag}: ${msg.content}\n`;
        }

        msg.embeds.forEach(embed => {
            if (embed.description) {
                logData += `[${timestamp}] ${userTag}: ${embed.description}\n`;
            }
        });
    });

    if (!logData) {
        console.log('No messages to log.');
        return null;
    }

    const logsDir = path.resolve(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    const filePath = path.join(logsDir, `logs-${Date.now()}.txt`);

    try {
        await fs.promises.writeFile(filePath, logData, 'utf8');
    } catch (err) {
        console.error('Error writing log file:', err);
        return null;
    }

    return filePath;
}

module.exports = logMessages;





