const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ChannelType, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require("discord.js")
const config = require("../../config.json")
const { getAllowedRoles, removeAllowedRole, addAllowedRole } = require("../../handlers/whitelist")
const schemaServer = require("../../schemas/schemaServer")

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
            { name: "close", value: "close"},
            { name: "freeze", value: "freeze"},
            { name: "resume", value: "resume"},
            { name: "block", value: "block"},
            { name: "setup", value: "setup"},
            { name: "whitelist", value: "whitelist"},
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

        if (option == "close") {

        }

        if (option == "setup") {

            if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) { // Require Manage Channels permission
                
            const categorysetup = new ModalBuilder()
			.setCustomId('categorysetup')
			.setTitle('Ticket Category Setup');

		    const category = new TextInputBuilder()
			.setCustomId('category')   
			.setLabel("Ticket Category's id")
			.setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder().addComponents(category);
            categorysetup.addComponents(firstActionRow)

            await interaction.showModal(categorysetup)

        } else { // Invalid Permission

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to perform this action, insufficient permission")
            interaction.reply({embeds: [invalid], flags: 64})

            }

        } else if (option == "whitelist") {

            if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageRoles)) { // Require Manage Roles permission
                
                const server = await schemaServer.findOne({ guildId: interaction.guild.id})
                const roles = server.allowedRoles.map(roleId => `<@&${roleId}>`).join(", ") 

                if (server.allowedRoles == "") {

                const whitelist = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle(`Whitelist Management`)
                .setDescription(`Add or Remove roles that are allowed to view ticket channels and respond to them.`)
                .addFields(
                    {name: `\n`, value: "> The list is empty, start by adding a role!"},
                )

                interaction.reply(
                    { embeds: [whitelist]}
                )

            } else {

                const whitelist = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle(`Whitelisted Roles`)
                .setDescription(`Add or Remove roles that are allowed to view ticket channels and respond to them.`)
                .addFields(
                    {name: `\n`, value: `> ${roles}`},
                )

                interaction.reply(
                    { embeds: [whitelist]}
                )
            }

            } else { // Invalid Permission

                const invalid = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Unable to perform this action, insufficient permission")
                interaction.reply({embeds: [invalid], flags: 64})
    
            }
        }
    }
}
