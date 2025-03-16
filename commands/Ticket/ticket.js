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
            { name: "clear", value: "clear"},
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

        if (option == "close") { // Closing ticket

          const server = await schemaServer.findOne({ guildId: interaction.guild.id})

          if (server) {

          const ticket_category_id = server.categoryId
          const ticket_logs_id = server.logsChannelID
          const log_channel = interaction.guild.channels.cache.get(ticket_logs_id)

          let ticket_channel = interaction.channel.parentId

          if (ticket_channel === ticket_category_id && interaction.channel.id != ticket_logs_id) { // Check if the command is being executed inside the assigned ticket category and excluding ticket-logs channel (this is to avoid deleting the logs channel)
            let channel = interaction.guild.channels.cache.find(channel => channel.name === interaction.user.username)
            var time = new Date();
            const now = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            await interaction.deferReply()
            await interaction.deleteReply()
            const logged = new EmbedBuilder()
               .setColor("Red")
               .setTitle("**Ticket Closed**")
               .setDescription(`<@${interaction.member.user.id}> has closed a ticket \`#${channel.name}\``)
               .setFooter({
                iconURL: interaction.member.user.avatarURL(),
                text: `${interaction.member.user.username} (${interaction.member.user.id}) - Today at ${now}`
               })

               log_channel.send({

                   embeds: [logged],

               }).then(async () => {

               await interaction.channel.delete()

               })

          } else {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to perform this action on the current channel")
            interaction.reply({embeds: [invalid], flags: 64})

        }
        } else {

        const errormsg = new EmbedBuilder()
        .setColor("Red")
        .setDescription("Unable to perform action on the current channel. An error has occurred, please report this to the server moderation team.")
        .addFields(
            { name: "\n", value: "> The bot has not been properly setup for this server. Please run the `/ticket setup` first. For further assistance, please contact the development team." }
        )
        .setFooter(
            { text: "If you think this is an error, please contact the development team immediately." }
        );
        interaction.reply({
            embeds: [errormsg], flags: 64
        })

        console.log("There was an error closing the channel")

        }

        } else if (option == "setup") {

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
