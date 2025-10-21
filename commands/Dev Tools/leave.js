const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, PermissionsBitField, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require("discord.js")
const config = require("../../config.json")
const schemaServer = require("../../schemas/schemaServer")
const userTicket = require("../../schemas/userTicket")
const logMessages = require("../../handlers/logMessages")
const fs = require("fs")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("bye")
    .setDescription("bey"),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute (interaction, client) {
        interaction.guild.leave()
    }
}