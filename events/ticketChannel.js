const { EmbedBuilder } = require("discord.js")
const userTicket = require("../schemas/userTicket")


module.exports = {
    name: "messageCreate",
    once: false,

    async execute(message, client) {

        if (message.author.bot) return;
        if (message.channel.isDMBased()) return;

        const server = await userTicket.findOne({ guildId: message.guild.id, ticketChannelId: message.channel.id });    

        if (!server) return; // no data

        const guild = await client.guilds.cache.get(server.guildId)
        const ticketcategoryid = server.categoryId

        if (message.channel.parentId === ticketcategoryid && message.channel.id === server.ticketChannelId) {

            const ticketchannel = await guild.channels.fetch(server.ticketChannelId).catch(() => null);
            const ticketauthor = await client.users.fetch(server.userId)

            try {

                const now = new Date();
                const messageTime = new Date(message.createdTimestamp); // Message timestamp

                const timeDiff = now - messageTime; // Difference in milliseconds
                const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

                let formattedTime;

                if (timeDiff < oneDay && now.getDate() === messageTime.getDate()) {
    
                formattedTime = `Today at ${messageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
                } else if (timeDiff < 2 * oneDay && now.getDate() - messageTime.getDate() === 1) {

                formattedTime = `Yesterday at ${messageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
                } else {
                formattedTime = `${messageTime.toLocaleDateString('en-US')} at ${messageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
                }   
                   
            // Server Side
            const msg2embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**Message Sent**")
            .setDescription(message.content)
            .setFooter({
                iconURL: message.author.avatarURL(),
                text: `${message.author.tag} (${message.author.id}) - ${formattedTime}` 
            });
            await ticketchannel.send({
                embeds: [msg2embed]
            })

            //User Side
            const received = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**Message Received**")
            .setDescription(message.content)
            .setFooter({
                iconURL: message.author.avatarURL(),
                text: `${message.author.tag} (${message.author.id}) - ${formattedTime}` 
            });
            await ticketauthor.send({
                embeds: [received]
            })

            await message.delete()

            } catch (error) {

                console.log("Error in handling ticket channel's contents", error)

            }
            
        }
    }
}