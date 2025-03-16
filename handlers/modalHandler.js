const { EmbedBuilder } = require("discord.js")
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

        } else {

            await ServerTicketCat.create({ guildId, categoryId: categoryid, allowedRoles, appstatus})

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