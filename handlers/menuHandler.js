const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js")
const config = require("../config.json")
const servers = require("../servers.json")
const selected = require("../utilities/selected")
const schemaServer = require("../schemas/schemaServer")

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
            
            const guild = client.guilds.cache.get(server.guildId)  

            try {

              await guild.channels.create({
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
            }).then(async (a) => {

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
                .setThumbnail(`${DevSV.iconURL()}`)
                .setDescription(`Successfully created a ticket for \`${JXND}\`. Please wait for a staff member to respond to your ticket.`)
                .addFields(
                    { name: "**Please note:**", value: `- There will be a minimum of 10 seconds cooldown per message, please keep the conversation civilized and respect other party.\n- Staff members reserve the rights to close, freeze and block your ticket.\n- For technical problems regarding the application, please contact the development team.`},
                )
                .setFooter({
                    text: "All messages from this ticket will be monitored or logged for development purposes."
                })

                await interaction.update({
                    embeds: [success],
                    components: [] 
                })

                selected.add(interaction.user.id);
                console.log(`[INFO] User ${interaction.user.id} added to selected`)

                const successfulConnection = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle("**New Ticket Received**")
                .setDescription("A new ticket has been created. To respond, type a message in this channel. Messages that contains global prefix `.` are ignored, and will not be sent. Staff members may close, freeze, resume the ticket using the available ticket commands.")
                .addFields(
                    { name: "> **User**", value: `> <@${interaction.user.id}> - ${interaction.user.id}`, inline: true},
                    { name: "> **Roles**", value: `> ${userRoles}`}
                )

                a.send({
                    embeds: [successfulConnection]
                })
            })

        } catch(error) {

            success = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Unable to establish connection to the selected server. An error has occurred, please report this to the server moderation team.")
            .addFields(
                { name: "\n", value: `**Missing Required Permissions:**\n** **\n> \`Manage Channels\`\n> \`View Channel\`\n> \`Send Messages\`\n> \`Manage Messages\`` },
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
            
            const guild = client.guilds.cache.get(server.guildId)  

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

              await guild.channels.create({
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
            }).then(async (a) => {

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
                .setThumbnail(`${DevSV.iconURL()}`)
                .setDescription(`Successfully created a ticket for \`${JXND}\`. Please wait for a staff member to respond to your ticket.`)
                .addFields(
                    { name: "**Please note:**", value: `- There will be a minimum of 10 seconds cooldown per message, please keep the conversation civilized and respect other party.\n- Staff members reserve the rights to close, freeze and block your ticket.\n- For technical problems regarding the application, please contact the development team.`},
                )
                .setFooter({
                    text: "All messages from this ticket will be monitored or logged for development purposes."
                })

                await interaction.update({
                    embeds: [success],
                    components: [] 
                })

                selected.add(interaction.user.id);
                console.log(`[INFO] User ${interaction.user.id} added to selected`)

                const successfulConnection = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle("**New Ticket Received**")
                .setDescription("A new ticket has been created. To respond, type a message in this channel. Messages containing global prefix `.` are ignored, and will not be sent. Staff members may close, freeze, resume the ticket using the available ticket commands.")
                .addFields(
                    { name: "\n", value: `> **User**\n> ** **\n> <@${interaction.user.id}>\n> ** **\n> (${interaction.user.id})`, inline: true},
                    { name: "\n", value: `> **Roles**\n> ** **\n> ${userRoles}`, inline: true}
                )

                a.send({
                    embeds: [successfulConnection]
                })
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
    }
}

module.exports = { loadMenu, selected };


