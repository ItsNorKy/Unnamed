const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ChannelType, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require("discord.js")
const config = require("../../config.json")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Contact server moderation team")
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

        // Global define

        const authorid = interaction.member.id // Command user's id
        const author = interaction.member // Command user

        // Setup ticket listening channel
        const option = interaction.options.getString("options")

        if (option == "setup") {

            if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) { // Require Manage Channels permission
                
            const channelsetup = new ModalBuilder()
			.setCustomId('channelsetup')
			.setTitle('Ticket channel setup');

		    const channels = new TextInputBuilder()
			.setCustomId('channels')   
			.setLabel("Ticket channel's id")
			.setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder().addComponents(channels);
            channelsetup.addComponents(firstActionRow)

            await interaction.showModal(channelsetup)

        } else { // Invalid Permission

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to perform this action on the current channel")
            interaction.reply({embeds: [invalid], flags: 64})
            }
        }
    }
}
