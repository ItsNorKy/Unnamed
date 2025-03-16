const { EmbedBuilder, ChannelType, PermissionsBitField } = require("discord.js")
const config = require("../config.json")
const servers = require("../servers.json")
const { isCategoryChannel } = require("./isCategoryChannel")
const ServerTicketCat =  require("../schemas/schemaServer")


async function loadModal(interaction, client) {
    
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "categorysetup") {

    const categoryid = interaction.fields.getTextInputValue("category")
    const category = interaction.guild.channels.cache.get(categoryid)
    const guildId = interaction.guild.id

    if (categoryid.length != 19) {

        const invalid = new EmbedBuilder()
        .setColor("Red")
        .setDescription("Invalid category ID. Please provide a valid category ID.")
        interaction.reply({embeds: [invalid], flags: 64})

    } else {

        if (await isCategoryChannel(interaction.guild, categoryid)) {

        const existingCategory = await ServerTicketCat.findOne({ guildId })

        if (existingCategory) {

            existingCategory.categoryId = categoryid
            await existingCategory.save()

            const getcategory = interaction.guild.channels.cache.get(categoryid)

            await getcategory.permissionOverwrites.edit(interaction.guild.id, {
                [PermissionsBitField.Flags.ViewChannel]: false,
            })
            await getcategory.permissionOverwrites.edit(interaction.guild.members.me.id, {
                [PermissionsBitField.Flags.ViewChannel]: true,
                [PermissionsBitField.Flags.SendMessages]: true,
                [PermissionsBitField.Flags.ManageChannels]: true,
                [PermissionsBitField.Flags.ManageMessages]: true,
            });

        } else { // NEW DATA
            
            try {

            // Create Ticket Category

            const getcategory = interaction.guild.channels.cache.get(categoryid)

            await getcategory.permissionOverwrites.edit(interaction.guild.id, {
                [PermissionsBitField.Flags.ViewChannel]: false,
            })

            await getcategory.permissionOverwrites.edit(interaction.guild.members.me.id, {
                [PermissionsBitField.Flags.ViewChannel]: true,
                [PermissionsBitField.Flags.SendMessages]: true,
                [PermissionsBitField.Flags.ManageChannels]: true,
                [PermissionsBitField.Flags.ManageMessages]: true,
            });
        
            //Create logs channel inside Ticket Category    
            const logschannel = await interaction.guild.channels.create({

                name: "ticket-logs",
                type: ChannelType.GuildText,
                parent: getcategory.id,
            })
        
                await logschannel.lockPermissions() // Sync perm with Category

                await ServerTicketCat.create({ guildId, categoryId: category.id, allowedRoles: [], appstatus: "Online", logsChannelID: logschannel.id})

            } catch (error) {

                const errormsg = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Unable to create logs channel. An error has occurred, please report this to the server moderation team.")
                .addFields(
                    { name: "\n", value: "> The bot has not been properly setup for this server. Please run the `/ticket setup` first. For further assistance, please contact the development team." }
                )
                .setFooter(
                    { text: "If you think this is an error, please contact the development team immediately." }
                );
                interaction.reply({
                    embeds: [errormsg], flags: 64
                })

                console.log("There was an error creating the `ticket-logs` channel:", error)
            }
        }

        const success = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`Successfully assigned ticket category to the following category: \`${category.name}\` with the ID of \`${categoryid}\``)
        interaction.reply({embeds: [success], flags: 64})

        } else {

            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Invalid category ID. Please provide a valid category ID.")
            interaction.reply({embeds: [invalid], flags: 64})

            }
       
        }
    }
}

module.exports = { loadModal }