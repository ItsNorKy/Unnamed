const { ActivityType } = require('discord.js')

module.exports = {
    name: "ready",
    once: true,

    execute (client) {
        
        client.user.setPresence({ 
            activities: [{ 
                name: 'Steve Angello, Modern Tales - Darkness In Me', 
                type: ActivityType.Streaming, 
                url: 'https://youtu.be/8SjZ8l-5S6M?si=TVNQMmbSeLZWYTWq' 
            }], 
            status: 'dnd' 
        });

        console.log("\nProject has been deployed, bot is online")
    }
};