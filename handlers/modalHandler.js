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

        } else { // NEW DATA
            
            try {
                
            await interaction.guild.channels.create({

                    name: "ticket-logs",
                    type: ChannelType.GuildText,
                    parent: categoryid,
                    permissionOverwrites: [
                    {
                        id: interaction.guild.members.me.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages],
                    },
            
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    }
                ]
            }).then(async(a) => {

                await ServerTicketCat.create({ guildId, categoryId: categoryid, allowedRoles: [], appstatus: "Online", logsChannelID: a.id})

            })
            } catch (error) {

                const errormsg = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Unable to create logs channel. An error has occurred, please report this to the server moderation team.")
                .addFields(
                    { name: "\n", value: `**Missing Required Permissions:**\n** **\n> \`Manage Channels\`\n> \`View Channel\`\n> \`Send Messages\`\n> \`Manage Messages\`\n> \`Manage Permissions\`` },
                    { name: "\n", value: "Please make sure the application is granted the required permissions for the ticket category, its role permissions in general or the role position." }
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