const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js")
const config = require("../config.json")
const servers = require("../servers.json")
const cooldown = new Map()
const { handleInteraction } = require("../events/SelectMenu")

module.exports = {
    name: "messageCreate",
    once: false,

    execute(message, client, interaction) {

        if (message.author.bot) return;

        if (message.channel.isDMBased()) {

            // Genera Cooldown 10s
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
                    {name: `\n`, value: `> 🔧 **[${DevSV}](https://discord.gg/hmD9EdUCxV)** \n> ** **\n> **Server type:** \`Dev Server\` \n> **Member counts:** \`${DevSV.memberCount}\`\n> **Application status:** \`Online\``, inline: true},
                    {name: `\n`, value: `> ✅ **Supported server** \n> ** **\n> **Server type:** \`Supported server\` \n> **Member counts:** \`    \`\n> **Application status:** \`Online\``, inline: true},
                )
                .setFooter({
                    text: "📝 If the application is unavailable, please contact the developers for further assistance.",
                })
            message.channel.send({ embeds: [success], components: [row] })

            console.log("Received DM: " + message.content);
        }
    }
}


// To be implemented:
// Schema / Mongoose Database for storing User's Server Data
 
