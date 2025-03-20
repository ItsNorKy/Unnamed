const { EmbedBuilder } = require("discord.js")
const userTicket = require("../schemas/userTicket")

module.exports = {
    name: "messageCreate",
    once: false,

    async execute(message, client) {

        if (message.author.bot) return;
        if (message.channel.isDMBased()) return;
        if (message.content.startsWith(".")) return; // placeholder for server prefix (using global prefix "." for now)

        const server = await userTicket.findOne({ guildId: message.guild.id, ticketChannelId: message.channel.id });    

        if (!server) return; // no data

        const guild = await client.guilds.cache.get(server.guildId)
        const ticketcategoryid = server.categoryId

        if (message.channel.parentId === ticketcategoryid && message.channel.id === server.ticketChannelId) {

            const ticketchannel = await guild.channels.fetch(server.ticketChannelId).catch(() => null);
            const ticketauthor = await client.users.fetch(server.userId)

            try {

                const now = new Date();

            await message.delete() // Remove message in channel
                   
            // Server Side
            const msg2embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**Message Sent**")
            .setDescription(message.content)
            .setFooter({
                iconURL: message.author.avatarURL(),
                text: `${message.author.tag} (${message.author.id})` 
            })
            .setTimestamp(now);

            await ticketchannel.send({
                embeds: [msg2embed]
            })

            //User Side
            const received = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**Message Received**")
            .setDescription(message.content)
            .setFooter({
                text: `Anonymous User` 
            })
            .setTimestamp(now);
            await ticketauthor.send({
                embeds: [received]
            })

            } catch (error) {

                console.log("Error in handling ticket channel's contents", error)

            }
            
        }
    }
}