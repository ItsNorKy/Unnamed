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

            // MaxFileSize

            const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
            const attachmentsArray = [...message.attachments.values()];

            // Separate oversized and normal attachments

            const oversizedFiles = attachmentsArray.filter(att => att.size > MAX_FILE_SIZE);
            const validFiles = attachmentsArray.filter(att => att.size <= MAX_FILE_SIZE);

            if (oversizedFiles.length > 0) {

                await message.delete()

                const oversized = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Unable to send the message. An error has occurred, details can be found below:")
                .addFields(
                    {name: "\n", value: "> The file size exceeds Discord Upload Limits (8 MB), please try again"}
                    )
                await message.channel.send({embeds: [oversized]})
                return;
            }

            const attachmentLinks = validFiles.map(att => `[${att.name}](${att.url})`).join("\n");

            // Server Side
            const msg2embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**Message Sent**")
            .setDescription(message.content ? message.content : "`Empty Message`")
            .setFooter({
                iconURL: message.author.avatarURL(),
                text: `${message.author.tag} (${message.author.id})` 
            })
            .setTimestamp(now);

            //User Side
            const received = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**Message Received**")
            .setDescription(message.content ? message.content : "`Empty Message`")
            .setFooter({
                text: `Anonymous User` 
            })
            .setTimestamp(now);

            if (attachmentLinks.length > 0) {
                msg2embed.addFields({ name: "**Attachments**", value: attachmentLinks });
                received.addFields({ name: "**Attachments**", value: attachmentLinks });
            } 
            
            ticketchannel.send({ embeds: [msg2embed], files: validFiles.map(att => ({ attachment: att.url, name: att.name })) })
            ticketauthor.send({ embeds: [received], files: validFiles.map(att => ({ attachment: att.url, name: att.name })) })

            await message.delete() // delete message


            } catch (error) {

                console.log("Error in handling ticket channel's contents", error)

            }
            
        }
    }
}