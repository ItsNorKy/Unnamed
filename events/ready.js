const { ActivityType } = require('discord.js')

module.exports = {
    name: "ready",
    once: true,

    execute (client) {
        
        client.user.setPresence({ 
            activities: [{ 
                name: 'Kobaryo feat. Srezcat - kawAIi', 
                type: ActivityType.Streaming, 
                url: 'https://www.youtube.com/watch?v=tC6jLQ-MRFo' 
            }], 
            status: 'dnd' 
        });

        console.log("\nProject has been deployed, bot is online")
    }
};