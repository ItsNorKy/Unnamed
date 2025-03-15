const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js")
const config = require("../../config.json")
const emotes = require("../../emotes.json")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("View information of a user")
    .addUserOption(option => 
        option
        .setName('user')
        .setDescription("Specify the user")
    ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute (interaction) {
        const target = interaction.options.getMember('user') ?? interaction.member
       
        if (target.bot) {

        const error = new EmbedBuilder()
        .setColor(config.errorclr)
        .setDescription("Unable to display the user information tab as this user is an application/bot")
        interaction.reply({
            embeds: [error],
            ephemeral: true
        })

        } else {

        const joined = parseInt(target.joinedTimestamp / 1000)
        const created = parseInt(target.user.createdTimestamp / 1000)

        // NEW ACCOUNT DETECTION
        if (interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {  // CHECK FOR PERMISSIONS - MODERATOR ONLY

        if ((Date.now() / 1000) - created < 1814000) { // BELOW 3 WEEKS - Time in seconds

            const info = new EmbedBuilder()
            .setTitle("**Information tab**")
            .setURL("https://discord.gg/UmNFmWrf") // ** Replace with tech server invite URL **
            .setColor(config.defaultclr)
            .addFields(
                { name: `\n<:Username:${emotes.Username}> **Username**`, value: `\`\`\`${target.user.username}\`\`\``, inline: true},
                { name: `<:ID:${emotes.ID}> **UserID**`, value: `\`\`\`${target.id}\`\`\``, inline: true},
                { name: `\n`, value: `** **`},
                { name: `<:Discord:${emotes.Discord}> **Created**`, value: `<t:${created}:D>`, inline: true},
                { name: `<:Joined:${emotes.Joined}> **Joined**`, value: `<t:${joined}:D>`, inline: true},
            )
            .setThumbnail((await user.fetch()).displayAvatarURL())
            .setImage((await target.user.fetch()).bannerURL({ dynamic : true , size : 2048 }))
            .setFooter({
                text: "⚠️ New account detected - This is only visible to server moderators ⚠️",
            })
            interaction.reply({
                embeds: [info],
                ephemeral: true
            }) 

        } else { // IF OLDER THAN 3 WEEKS
            
        const info = new EmbedBuilder()
        .setTitle("**Information tab**")
        .setURL("https://discord.gg/UmNFmWrf") // ** Replace with tech server invite URL **
        .setColor(config.defaultclr)
        .addFields(
            { name: `\n<:Username:${emotes.Username}> **Username**`, value: `\`\`\`${target.user.username}\`\`\``, inline: true},
            { name: `<:ID:${emotes.ID}> **UserID**`, value: `\`\`\`${target.id}\`\`\``, inline: true},
            { name: `\n`, value: `** **`},
            { name: `<:Discord:${emotes.Discord}> **Created**`, value: `<t:${created}:D>`, inline: true},
            { name: `<:Joined:${emotes.Joined}> **Joined**`, value: `<t:${joined}:D>`, inline: true},
        )
        .setThumbnail((await target.user.fetch()).displayAvatarURL())
        .setImage((await target.user.fetch()).bannerURL({ dynamic : true , size : 2048 }))
        interaction.reply({
            embeds: [info],
            ephemeral: true
        }) 
                }

            } else { // FOR NON-MODERATORS (DEFAULT VIEW)

                const info = new EmbedBuilder()
                .setTitle("**Information tab**")
                .setURL("https://discord.gg/UmNFmWrf") // ** Replace with tech server invite URL **
                .setColor(config.defaultclr)
                .addFields(
                    { name: `\n<:Username:${emotes.Username}> **Username**`, value: `\`\`\`${target.user.username}\`\`\``, inline: true},
                    { name: `<:ID:${emotes.ID}> **UserID**`, value: `\`\`\`${target.id}\`\`\``, inline: true},
                    { name: `\n`, value: `** **`},
                    { name: `<:Discord:${emotes.Discord}> **Created**`, value: `<t:${created}:D>`, inline: true},
                    { name: `<:Joined:${emotes.Joined}> **Joined**`, value: `<t:${joined}:D>`, inline: true},
                )
                .setThumbnail((await target.user.fetch()).displayAvatarURL())
                .setImage((await target.user.fetch()).bannerURL({ dynamic : true , size : 2048 }))
                interaction.reply({
                    embeds: [info],
                    ephemeral: true
                }) 
            }
        }
    }
}
