const { EmbedBuilder, ChannelType, PermissionsBitField } = require("discord.js")
const config = require("../config.json")
const servers = require("../servers.json")
const { isCategoryChannel } = require("./isCategoryChannel")
const ServerTicketCat =  require("../schemas/schemaServer")


async function loadModal(interaction, client) {
    
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === "categorysetup") {

        const categoryid = interaction.fields.getTextInputValue("category").trim()
        const logsid = interaction.fields.getTextInputValue("logs").trim()
        const logs = logsid ? interaction.guild.channels.cache.get(logsid): null

        const guildId = interaction.guild.id

        if (!categoryid && !logsid) { // if both answers are blank
            const errormsg = new EmbedBuilder()
            .setColor("Red")
            .setDescription("You must provide at least one valid Category ID or Text Channel ID. No changes have been made to the ticket configurations")
            return interaction.reply({ embeds: [errormsg], flags: 64 });
        }

        if (!categoryid || await isCategoryChannel(interaction.guild, categoryid) && !logsid || (logs && logs.type === ChannelType.GuildText)) {

            const existingCategory = await ServerTicketCat.findOne({ guildId })

            if (categoryid) existingCategory.categoryId = categoryid 
            if (logsid) existingCategory.logsChannelID = logsid
            await existingCategory.save() // Updating existing Ticket Category to a new one

            const getcategory = interaction.guild.channels.cache.get(categoryid)
            const getticket = interaction.guild.channels.cache.get(logsid)


            if (!getcategory) {

                console.log("No new Category id provided, skipping")

            } else {

                if (!getcategory.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ViewChannel)) {
                
                    const errormsg = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("Unable to setup the ticket category. An error has occurred, please report this to the server moderation team.")
                    .addFields(
                        { name: "\n", value: "> The application is missing `View Messages` permission for this category, please ensure that the required permissions are granted before using the setup command. For further assistance, please contact the development team." }
                    )
                    .setFooter(
                        { text: "If you think this is an error, please contact the development team immediately." }
                    );
                    return interaction.reply({
                        embeds: [errormsg], flags: 64
                    })
                }

                await getcategory.permissionOverwrites.edit(interaction.guild.id, {
                    [PermissionsBitField.Flags.ViewChannel]: false, // Disable view messages for @everyone
                })
                await getcategory.permissionOverwrites.edit(interaction.guild.members.me.id, {
                    [PermissionsBitField.Flags.ViewChannel]: true,
                    [PermissionsBitField.Flags.SendMessages]: true,
                    [PermissionsBitField.Flags.ManageChannels]: true,
                    [PermissionsBitField.Flags.ManageMessages]: true,
                }); // Adding required permissions to ensure no permission is missing for the application to operate properly

            }

            if (!getticket) {

                console.log("No new Ticket Logs Channel ID provided, skipping")

            } else {

            if (!getticket.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ViewChannel)) {
                
                const errormsg = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Unable to setup the ticket logs channel. An error has occurred, please report this to the server moderation team.")
                .addFields(
                    { name: "\n", value: "> The application is missing `View Messages` permission for this channel, please ensure that the required permissions are granted before using the setup command. For further assistance, please contact the development team." }
                )
                .setFooter(
                    { text: "If you think this is an error, please contact the development team immediately." }
                );
                return interaction.reply({
                    embeds: [errormsg], flags: 64
                })
            }

            await getticket.lockPermissions() // sync permissions

        }

        const categoryText = categoryid ? `\`<#${categoryid}>\`\n> (${categoryid})` : "No new changes have been made to this setting";
        const logsText = logsid ? `<#${logsid}>\n> (${logsid})` : "No new changes have been made to this setting";

        const success = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`Successfully updated ticket configurations, information about the new changes can be found below:`)
        .addFields(
            {name: "\n", value: `> **New Ticket Category**\n> ** **\n> ${categoryText}`, inline: true},
            {name: "\n", value: `> **New Ticket Logs Channel**\n> ** **\n> ${logsText}`, inline: true},
        )
        interaction.reply({embeds: [success], flags: 64})

        } else {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Invalid Category ID or Channel ID. Please make sure you have correctly enter the IDs.")
            interaction.reply({embeds: [invalid], flags: 64})

        }
    }
}

module.exports = { loadModal }