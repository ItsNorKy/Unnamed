const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ChannelType, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require("discord.js")
const config = require("../../config.json")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("tkassign")
    .setDescription("Assign ticket channel")
    .addStringOption(option =>
        option
        .setName("options")
        .setDescription("command options")
        .setRequired(true)
        .addChoices(
            { name: "create", value: "create"},
            { name: "close", value: "close"},
            { name: "freeze", value: "freeze"},
            { name: "resume", value: "resume"},
            { name: "setup", value: "setup"},
        )
    ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute (interaction) {

    }
}