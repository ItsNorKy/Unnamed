const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("create")
        .setDescription("Create a ticket for a selected server"),
    
    /**
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute (interaction) {

        const userid = interaction.member.id

        await interaction.reply("aaaa")

    }
}