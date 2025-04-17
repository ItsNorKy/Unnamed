const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, AttachmentBuilder } = require("discord.js")
module.exports = {
    name: "messageCreate",
    once: false,

    async execute(message, client) {

        if (message.author.bot) return;

        if (message.channel.isDMBased()) return;

        const triggerWords = [
            'kms', 
            'kill myself', 
            'hang myself', 
            'jump off', 
            'kill my self',
            'hang my self',
            'commit suicide',
            'kys',
            'kill yourself',
            'end yourself'
        ];

        const content = message.content.toLowerCase();

        if (triggerWords.some(word => content.includes(word))) {
            try {
          message.reply({
            files: ['./Vids/dontkyslowres.mp4']
          });
        } catch (err) {
            console.log(err)
        }
        }
    }
}


 
