const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js")
const config = require("../config.json")
const servers = require("../servers.json")
const schemaServer = require("../schemas/schemaServer")
const userTicket = require("../schemas/userTicket")

async function loadMenu(interaction, client) {


    if (!interaction.isStringSelectMenu()) return; 
    if (interaction.customId !== "servers") return; 

    const DevSV = client.guilds.cache.get(servers.Dev_Server)   
    const JXND = client.guilds.cache.get(servers.JaxinaDomain)
    const DevSVID = servers.Dev_Server
    const JXNDID = servers.JaxinaDomain
    const selectedValue = interaction.values[0];

    let success

    if (selectedValue === "devsv") {
        
        const server = await schemaServer.findOne({ guildId: DevSVID })

        if (!server) {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to establish connection to the selected server. This server has not setup the bot yet.")
            .setFooter(

                { text: "If you think this is an error, please contact the development team immediately."}
            )
            console.log("No data found in database")
            return interaction.reply({embeds: [invalid], flags: 64})
        }


        if (!server.categoryId) {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to establish connection to the selected server. No existing ticket category is set for this server.")
            .setFooter(

                { text: "If you think this is an error, please contact the development team immediately."}
            )
            console.log("No categoryID found in database for this server")
            return interaction.reply({embeds: [invalid], flags: 64})
        }
            
            const guild = await client.guilds.fetch(server.guildId)
            const x = await guild.channels.fetch()
            const channel = [...x.values()].find(c => c.name === interaction.user.username);

            if (channel) {

            const existed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to create a new ticket, you already have an active ticket.")
            .setFooter(
        
                { text: "If you think this is an error, please contact the development team immediately."}
            )
            return interaction.reply({embeds: [existed], flags: 64})

            }

            try {

                const newTicketCN = await guild.channels.create({
                    name: interaction.user.username,
                    type: ChannelType.GuildText,
                    parent: server.categoryId,
                    permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },

                    {
                        id: guild.members.me.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages],
                    },
            
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    }
                ]
            })

                const member = await guild.members.fetch(interaction.user.id).catch(() => null)

                if (!member) {
                    const invalid = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("Unable to fetch user's roles, please make sure the application has all required permissions.")
                    .setFooter(
        
                        { text: "If you think this is an error, please contact the development team immediately."}
                    )
                    console.log("Unable to fetch user's roles")
                    return interaction.reply({embeds: [invalid], flags: 64})
                }

                await userTicket.create({ // generate data for user's ticket
                    userId: interaction.user.id,
                    guildId: server.guildId, 
                    categoryId: server.categoryId,   
                    ticketChannelId: newTicketCN.id,                                                                       
                })

                const userRoles = member.roles.cache
                .filter(role => role.id !== guild.id) // Exclude @everyone role
                .map(role => `<@&${role.id}>`) // Format roles as mentions
                .join(", ") || "User has no roles"

                success = new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**${DevSV}**`)
                .setThumbnail(`${DevSV.iconURL()}`)
                .setDescription(`Successfully created a ticket for \`${DevSV}\`. Please wait for a staff member to respond to your ticket.`)
                .addFields(
                    { name: "**Please note:**", value: `- There will be a minimum of 10 seconds cooldown per message, please keep the conversation civilized and respect other party.\n- Staff members reserve the rights to close your ticket.\n- For technical problems regarding the application, please contact the development team.`},
                )
                .setFooter({
                    text: "All messages from this ticket will be monitored or logged for development purposes."
                })

                await interaction.update({
                    embeds: [success],
                    components: [] 
                })               

                const successfulConnection = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle("**New Ticket Received**")
                .setDescription("A new ticket has been created. To respond, type a message in this channel. Messages containing global prefix `.` are ignored, and will not be sent. Staff members may close the ticket using `/ticket close` command.")
                .addFields(
                    { name: "\n", value: `> **User**\n> ** **\n> <@${interaction.user.id}>\n> (${interaction.user.id})`, inline: true},
                    { name: "\n", value: `> **Roles**\n> ** **\n> ${userRoles}`, inline: true}
                )
                .setFooter({
                    text: "All messages from this ticket will be monitored or logged for development purposes."
                })

                newTicketCN.send({
                    embeds: [successfulConnection]
                }).then(async () => {

                    // Logging
                    const logs_channelID = server.logsChannelID

                    try {

                        if (logs_channelID) {

                        const logs_channel = guild.channels.cache.get(logs_channelID)

                        var time = new Date();
                        const now = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

                        const newTicket = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("**New Ticket**")
                        .setDescription(`<@${interaction.user.id}> has created a ticket`)
                        .setFooter({
                            iconURL: interaction.user.avatarURL(),
                            text: `${interaction.user.username} (${interaction.user.id}) - Today at ${now}`
                        })

                        logs_channel.send({

                            embeds: [newTicket],

                        })

                        } else {

                        const errormsg = new EmbedBuilder()
                            .setColor("Red")
                            .setDescription("Unable to generate a log for this ticket. An error has occurred, please report this to the server moderation team.")
                            .addFields(
                                { name: "\n", value: "> The bot has not been properly setup for this server. Please run the `/ticket setup` first. For further assistance, please contact the development team." }
                            )
                            .setFooter(
                                { text: "If you think this is an error, please contact the development team immediately." }
                            );
                            interaction.reply({
                                embeds: [errormsg], flags: 64
                            })
                        }

                    } catch (error) {
                        console.log("Error occured when logging", error)
                    }
                })

        } catch(error) {

            success = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to establish connection to the selected server. An error has occurred, please report this to the server moderation team.")
            .addFields(
                { name: "\n", value: `**Missing Required Permissions:**\n** **\n> \`Manage Channels\`\n> \`View Channel\`\n> \`Send Messages\`\n> \`Manage Messages\`\n> \`Manage Permissions\`` },
                { name: "\n", value: "Please make sure the application is granted the required permissions for the ticket category, its role permissions in general or the role position." }
            )
            .setFooter(
                { text: "If you think this is an error, please contact the development team immediately." }
            );

            await interaction.update({
            embeds: [success],
            components: [] 
        })
        }    

    } else if (selectedValue === "supsv1") { // JAXINA DOMAIN 

        const server = await schemaServer.findOne({ guildId: JXNDID })

        if (!server) {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to establish connection to the selected server. This server has not setup the bot yet.")
            .setFooter(

                { text: "If you think this is an error, please contact the development team immediately."}
            )
            console.log("No data found in database")
            return interaction.reply({embeds: [invalid], flags: 64})
        }


        if (!server.categoryId) {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to establish connection to the selected server. No existing ticket category is set for this server.")
            .setFooter(

                { text: "If you think this is an error, please contact the development team immediately."}
            )
            console.log("No categoryID found in database for this server")
            return interaction.reply({embeds: [invalid], flags: 64})
        }
            
            const guild = await client.guilds.fetch(server.guildId)
            const x = await guild.channels.fetch()
            const channel = [...x.values()].find(c => c.name === interaction.user.username);

            if (channel) {

            const existed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to create a new ticket, you already have an active ticket.")
            .setFooter(
        
                { text: "If you think this is an error, please contact the development team immediately."}
            )
            return interaction.reply({embeds: [existed], flags: 64})

            }

            try {

              const newTicketCN = await guild.channels.create({
                    name: interaction.user.username,
                    type: ChannelType.GuildText,
                    parent: server.categoryId,
                    permissionOverwrites: [
                    {
                        id: guild.members.me.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages],
                    },
            
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    }
                ]
            })

            await userTicket.create({ // generate data for user's ticket
                userId: interaction.user.id,
                guildId: server.guildId, 
                categoryId: server.categoryId,   
                ticketChannelId: newTicketCN.id,                                                                       
            })

                const member = await guild.members.fetch(interaction.user.id).catch(() => null);

                if (!member) {
                    const invalid = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("Unable to fetch user's roles, please make sure the application has all required permissions.")
                    .setFooter(
        
                        { text: "If you think this is an error, please contact the development team immediately."}
                    )
                    console.log("Unable to fetch user's roles")
                    return interaction.reply({embeds: [invalid], flags: 64})
                }

                const userRoles = member.roles.cache
                .filter(role => role.id !== guild.id) // Exclude @everyone role
                .map(role => `<@&${role.id}>`) // Format roles as mentions
                .join(", ") || "User has no roles"

                success = new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**${JXND}**`)
                .setThumbnail(`${JXND.iconURL()}`)
                .setDescription(`Successfully created a ticket for \`${JXND}\`. Please wait for a staff member to respond to your ticket.`)
                .addFields(
                    { name: "**Please note:**", value: `- There will be a minimum of 10 seconds cooldown per message, please keep the conversation civilized and respect other party.\n- Staff members reserve the rights to close your ticket.\n- For technical problems regarding the application, please contact the development team.`},
                )
                .setFooter({
                    text: "All messages from this ticket will be monitored or logged for development purposes."
                })

                await interaction.update({
                    embeds: [success],
                    components: [] 
                })

                const successfulConnection = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle("**New Ticket Received**")
                .setDescription("A new ticket has been created. To respond, type a message in this channel. Messages containing global prefix `.` are ignored, and will not be sent. Staff members may close, freeze, resume the ticket using the available ticket commands.")
                .addFields(
                    { name: "\n", value: `> **User**\n> ** **\n> <@${interaction.user.id}>\n> ** **\n> (${interaction.user.id})`, inline: true},
                    { name: "\n", value: `> **Roles**\n> ** **\n> ${userRoles}`, inline: true}
                )
                .setFooter({
                    text: "All messages from this ticket will be monitored or logged for development purposes."
                })

                newTicketCN.send({
                    embeds: [successfulConnection]
                }).then(async () => {

                    // Logging
                    const logs_channelID = server.logsChannelID

                    try {

                        if (logs_channelID) {

                        const logs_channel = guild.channels.cache.get(logs_channelID)

                        if (logs_channel) { 

                        const now = new Date();

                        const newTicket = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("**New Ticket**")
                        .setDescription(`<@${interaction.user.id}> has created a ticket`)
                        .setFooter({
                            iconURL: interaction.user.avatarURL(),
                            text: `${interaction.user.username} (${interaction.user.id})`
                        })
                        .setTimestamp(now)
                        

                        logs_channel.send({

                            embeds: [newTicket],

                        })

                    } else {

                        console.log("Error, logs-channel does not exist. This action is not saved")

                    }

                        } else {

                        const errormsg = new EmbedBuilder()
                            .setColor("Red")
                            .setDescription("Unable to generate a log for this ticket. An error has occurred, please report this to the server moderation team.")
                            .addFields(
                                { name: "\n", value: "> The bot has not been properly setup for this server. Please run the `/ticket setup` first. For further assistance, please contact the development team." }
                            )
                            .setFooter(
                                { text: "If you think this is an error, please contact the development team immediately." }
                            );
                            interaction.reply({
                                embeds: [errormsg], flags: 64
                            })
                        }

                    } catch (error) {
                        console.log("Error occured when logging", error)
                    }
                })

        } catch(error) {

            success = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to establish connection to the selected server. An error has occurred, please report this to the server moderation team.")
            .addFields(
                { name: "\n", value: "> The bot has not been properly setup for this server. Please run the `/ticket setup` first. For further assistance, please contact the development team." }
            )
            .setFooter(
                { text: "If you think this is an error, please contact the development team immediately." }
            );

            await interaction.update({
            embeds: [success],
            components: [] 
        })
        }    
    }
}

module.exports = { loadMenu };


