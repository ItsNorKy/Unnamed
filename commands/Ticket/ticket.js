const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, PermissionsBitField, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require("discord.js")
const config = require("../../config.json")
const schemaServer = require("../../schemas/schemaServer")
const userTicket = require("../../schemas/userTicket")
const logMessages = require("../../handlers/logMessages")
const fs = require("fs")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Contact server moderation team")
    .addStringOption(option =>
        option
        .setName("options")
        .setDescription("Command options")
        .setRequired(true)
        .addChoices(
            { name: "close", value: "close"},
            { name: "setup", value: "setup"},
            { name: "configs", value: "configs"}
        )
    ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute (interaction, client) {

        // Setup ticket listening channel
        const option = interaction.options.getString("options")

        if (option == "close") { // Closing ticket

          const server = await schemaServer.findOne({ guildId: interaction.guild.id})

          if (server) {

          const userTK = await userTicket.findOne({ guildId: interaction.guild.id, ticketChannelId: interaction.channel.id})

          if (!userTK) return;

          const ticketauthor = await interaction.client.users.fetch(userTK.userId)
          const ticket_category_id = server.categoryId
          const ticket_logs_id = server.logsChannelID
          const log_channel = interaction.guild.channels.cache.get(ticket_logs_id)

          //Sending to user for closed ticket
          const now = new Date();

          const closed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("**Ticket Closed**")
          .setDescription(`Your ticket has been closed. You may submit a new ticket if you have any questions.`)
          .setFooter({
           iconURL: ticketauthor.avatarURL(),
           text: `${ticketauthor.username} (${ticketauthor.id})`
          })
          .setTimestamp(now);

          ticketauthor.send({

              embeds: [closed],

          })

          // Logging
          if (log_channel) {

          let ticket_channel = interaction.channel.parentId

          if (ticket_channel === ticket_category_id && interaction.channel.id !== ticket_logs_id || interaction.channel.id !== "1351789585797091349") { // Check if the command is being executed inside the assigned ticket category and excluding ticket-logs channel (this is to avoid deleting the logs channel)
            let channel = interaction.channel; 

            const now = new Date();

            await interaction.deferReply()
            await interaction.deleteReply()

            // Generate log file
            const filePath = await logMessages(interaction.client, channel.id);

            if (!filePath || !fs.existsSync(filePath)) {
            console.error(`Log file not found: ${filePath}`);
            return;
            }

            const logged = new EmbedBuilder()
               .setColor("Red")
               .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL()})
               .setTitle("Ticket Closed")
               .setDescription(`<@${interaction.member.user.id}> has closed a ticket \`#${channel.name}\``)
               .setFooter({
                iconURL: ticketauthor.avatarURL(),
                text: `${ticketauthor.username} (${ticketauthor.id})`
               })
               .setTimestamp(now)

               const messageOptions = { embeds: [logged] };
               if (filePath && fs.existsSync(filePath)) { // Check if file exists before attaching
                    messageOptions.files = [new AttachmentBuilder(filePath)];
                }

                log_channel.send(messageOptions).then(async () => {

                await userTicket.deleteOne({ ticketChannelId: interaction.channel.id }); // Deletes the exact ticket entry
                await interaction.channel.delete()

                fs.unlinkSync(filePath) // delete log file after sending
               })

          } else {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to perform this action on the current channel")
            interaction.reply({embeds: [invalid], flags: 64})

          }

        } else {

            console.log("Error, logs-channel does not exist. This action is not saved")
            await interaction.channel.delete()
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

            if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) {  // Require Manage Channels permission

            // Check for existing settings
            const server = await schemaServer.findOne({ guildId: interaction.guild.id})

            if (server) { // if exists

            const categorysetup = new ModalBuilder()
			.setCustomId('categorysetup')
			.setTitle('Ticket Category Setup');

		    const newticketcategory = new TextInputBuilder()
			.setCustomId('category')   
			.setLabel("New Ticket Category ID")
			.setStyle(TextInputStyle.Short)
            .setRequired(false);

            const newLogsChannel = new TextInputBuilder()
            .setCustomId('logs')   
			.setLabel("New Ticket Logs Channlel ID")
			.setStyle(TextInputStyle.Short)
            .setRequired(false);

            const firstActionRow = new ActionRowBuilder().addComponents(newticketcategory);
            const secondActionRow = new ActionRowBuilder().addComponents(newLogsChannel);
            categorysetup.addComponents(firstActionRow, secondActionRow)

            await interaction.showModal(categorysetup) 

            } else { // if doesn't exist, create new database

                try {

                    // Create Ticket Category
        
                    const ticketcategory = await interaction.guild.channels.create({
                        name: "Kanou's ModMail",
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id, // @everyone role
                                deny: [PermissionsBitField.Flags.ViewChannel] // disable view messages permission 
                            },

                            {
                                id: interaction.guild.members.me.id, // application permission - Not application's role
                                allow: [
                                    PermissionsBitField.Flags.ViewChannel, 
                                    PermissionsBitField.Flags.SendMessages, 
                                    PermissionsBitField.Flags.ManageChannels, 
                                    PermissionsBitField.Flags.ManageMessages
                                    ]
                            }
                        ]
                    })

                    //Create logs channel inside Ticket Category    
                    const logschannel = await interaction.guild.channels.create({
        
                        name: "ticket-logs",
                        type: ChannelType.GuildText,
                        parent: ticketcategory.id,
                    })
                
                        await logschannel.lockPermissions() // Sync perm with Category
        
                        await schemaServer.create({ guildId: interaction.guild.id, categoryId: ticketcategory.id, appstatus: "Online", logsChannelID: logschannel.id, prefix: `.`})
        
                        const created = new EmbedBuilder()
                        .setColor("Green")
                        .setDescription(`The application has completed its setup process. You may view your server configurations using \`/ticket configs\` command. If you need any further assistance, please contact the development team.`)
                        interaction.reply(
                        { embeds: [created], flags: 64}
                    )

                    } catch (error) {
        
                        const errormsg = new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("Unable to setup the ticket category. An error has occurred, please report this to the server moderation team.")
                        .addFields(
                            { name: "\n", value: "> The application has not been properly setup for this server. For further assistance, please contact the development team." }
                        )
                        .setFooter(
                            { text: "If you think this is an error, please contact the development team immediately." }
                        );
                        interaction.reply({
                            embeds: [errormsg], flags: 64
                        })
        
                        console.log("There was an error setting up the ticket category and its logs-channel", error)
                    }    
            }

        } else { // Invalid Permission

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to perform this action, insufficient permission")
            interaction.reply({embeds: [invalid], flags: 64})
            }

        } else if (option == "configs") {

            if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) { // Require Manage Channels permission
                
                const server = await schemaServer.findOne({ guildId: interaction.guild.id})
                const logsid = server.logsChannelID
                const categoryid = server.categoryId
                const category = interaction.guild.channels.cache.get(categoryid)
                const prefix = server.prefix

                const configs = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle("**Kanou's ModMail Configurations**")
                .setDescription("All information and settings can be found below. As of now, there are only two options can be changed (ticket-logs channel and ticket category).")
                .addFields(
                    {name: "\n", value: `> **Ticket Category**\n> ** **\n> \`${category.name}\`\n> (${categoryid})`, inline: true},
                    {name: "\n", value: `> **Ticket Logs Channel**\n> ** **\n> <#${logsid}>\n> (${logsid})`, inline: true},
                    {name: "\n", value: `> **Server Prefix**\n> ** **\n> \`${prefix}\``, inline: true},
                )

                interaction.reply({
                    embeds: [configs],
                    flags: 64
                })

            } else { // Invalid Permission

                const invalid = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Unable to perform this action, insufficient permission")
                interaction.reply({embeds: [invalid], flags: 64})
    
            }
        }
    }
}
