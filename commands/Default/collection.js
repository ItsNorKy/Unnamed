const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js")
const config = require("../../config.json")
const emotes = require("../../emotes.json")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("collection")
    .setDescription("View an user's resonator/weapon collection")
    .addUserOption(option => 
        option
        .setName('user')
        .setDescription("Specify the user")
    ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute (interaction) {
        const target = interaction.options.getMember('user') ?? interaction.member
       
        if (target.bot) {

        const error = new EmbedBuilder()
        .setColor(config.errorclr)
        .setDescription("Unable to display the user information tab as this user is an application/bot")
        interaction.reply({
            embeds: [error],
            ephemeral: true
        })

        } else {

            

        }
    }
}
