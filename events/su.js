const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, AttachmentBuilder } = require("discord.js")


module.exports = {
    name: "messageCreate",
    once: false,

    async execute(message, client) {

        if (message.author.bot) return;

        const TARGET_USER_ID = '1367849801068052554'; //1367849801068052554
        if (message.author.id === TARGET_USER_ID) {

              await message.reply('https://tenor.com/view/patrick-get-real-patrick-star-spongebob-spongebob-meme-gif-3444602609189057100');
            return; 
        }

        if (message.channel.isDMBased()) return;
    }
}
