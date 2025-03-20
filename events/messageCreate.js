const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js")
const config = require("../config.json")
const servers = require("../servers.json")
const cooldown = new Map()
const userTicket = require("../schemas/userTicket")


module.exports = {
    name: "messageCreate",
    once: false,

    async execute(message, client) {

        if (message.author.bot) return;

        if (message.channel.isDMBased()) {

            // General Cooldown 10s
            const userId = message.author.id 
            const cooldownTime = 10 * 1000;

            if (cooldown.has(userId)) {
                const timeLeft = cooldown.get(userId) - Date.now();
                if (timeLeft > 0) {
                    const invalid = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("You are sending messages too fast, slow down a bit!")
                    message.channel.send({embeds: [invalid],}).then((a) => {
                        setTimeout(() => a.delete().catch(() => {}), 10000); // Deletes after 10 seconds
                    });
                    return;
                }
            }

            cooldown.set(userId, Date.now() + cooldownTime);
            setTimeout(() => cooldown.delete(userId), cooldownTime);
            const usertk = await userTicket.findOne({ userId: userId})

            if (usertk) { 

                const guild = client.guilds.cache.get(usertk.guildId)
                const ticketchannel = await guild.channels.fetch(usertk.ticketChannelId).catch(() => null);

                if (!guild) {
                    console.error(`Guild ${usertk.guildId} not found.`);
                    return;
                }

                if (!ticketchannel) {
                    
                    await userTicket.deleteMany({ userId: message.author.id })

                    const noChnnel = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("Unable to establish connection to the selected server. An error has occurred, please report this to the server moderation team.")
                    .addFields(
                        { name:"\n", value: `> Ticket channel has been deleted or closed unexpectedly. User may submit a new ticket.`}
                    )
                    .setFooter(
                        { text: "If you think this is an error, please contact the development team immediately." }
                    );
                    message.author.send({
                        embeds: [noChnnel]
                    })
                    
                    console.error(`Deleting previous data of ${message.author.id}.`);
                    return;
                }
                // timeNow()
                const now = new Date();
                
                //user message recorded
                const recorded = new EmbedBuilder()
                .setColor("Green")
                .setTitle("**Message Sent**")
                .setDescription(message.content)
                .setFooter({
                    iconURL: message.author.avatarURL(),
                    text: `${message.author.tag} (${message.author.id})` 
                })
                .setTimestamp(now)

                await message.author.send({
                    embeds: [recorded]
                })
                
                // sending  to sv
                const ticket = new EmbedBuilder()
                .setColor("Green")
                .setTitle("**Message Received**")
                .setDescription(message.content)
                .setFooter({
                    iconURL: message.author.avatarURL(),
                    text: `${message.author.tag} (${message.author.id})` 
                })
                .setTimestamp(now);

                await ticketchannel.send({
                    embeds: [ticket]
                })

                console.log("Cancelled sending selection menu as the ticket is ongoing")

                return;

            }

            // Select Server
            const DevSV = client.guilds.cache.get(servers.Dev_Server)   
            const JXND = client.guilds.cache.get(servers.JaxinaDomain)

            const serverselection = new StringSelectMenuBuilder()
			.setCustomId('servers')
			.setPlaceholder('Select a server')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(`${DevSV}`)
					.setDescription('Dev server')
					.setValue('devsv'),

                new StringSelectMenuOptionBuilder()
					.setLabel(`${JXND}`)
					.setDescription('Supported server')
					.setValue('supsv1')    
            )

            const row = new ActionRowBuilder()
			.addComponents(serverselection);

            const success = new EmbedBuilder()
                .setColor(config.defaultclr)
                .setTitle("**Server selection**")
                .setDescription(`Before creating a ticket, please select a desired server for contacting. You may find the information about the supported servers below:`)
                .addFields(
                    {name: `\n`, value: `> 🔧 **[${DevSV}](https://discord.gg)** \n> ** **\n> **Server type:** \`Dev Server\` \n> **Member counts:** \`${DevSV.memberCount}\`\n> **Application status:** \`Online\``, inline: true},
                    {name: `\n`, value: `> ✅ **[${JXND}](https://discord.gg/jjZMNjzzjQ)** \n> ** **\n> **Server type:** \`Supported server\` \n> **Member counts:** \`${JXND.memberCount}\`\n> **Application status:** \`Online\``, inline: true},
                )
                .setFooter({
                    text: "📝 If the application is unavailable, please contact the developers for further assistance.",
                })
            message.channel.send({ embeds: [success], components: [row] })

            console.log("Received DM: " + message.content);
        }
    }
}


 
