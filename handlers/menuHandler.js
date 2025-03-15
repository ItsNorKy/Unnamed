const { EmbedBuilder } = require("discord.js")
const config = require("../config.json")
const servers = require("../servers.json")
const selected = require("../utilities/selected")

async function loadMenu(interaction, client) {


    if (!interaction.isStringSelectMenu()) return; 
    if (interaction.customId !== "servers") return; 

    const DevSV = client.guilds.cache.get(servers.Dev_Server)   
    const JXND = client.guilds.cache.get(servers.JaxinaDomain)

    const selectedValue = interaction.values[0];
    let success
    if (selectedValue === "devsv") {

        success = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`**${DevSV}\**`)
        .setThumbnail(`${DevSV.iconURL()}`)
        .setDescription(`Successfully created a ticket for \`${DevSV}\`. Please wait for a staff member to respond to your ticket.`)
        .addFields(
            { name: "**Please note:**", value: `- There will be a minimum of 10 seconds cooldown per message, please keep the conversation civilized and respect other party.\n- Staff members reserve the rights to close, freeze and block your ticket.\n- For technical problems regarding the application, please contact the development team.`},
        )
        .setFooter({
            text: "All messages from this ticket will be monitored or logged for development purposes."
        })

    } else if (selectedValue === "supsv1") {

        success = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`**${JXND}**`)
        .setThumbnail(`${DevSV.iconURL()}`)
        .setDescription(`Successfully created a ticket for \`${JXND}\`. Please wait for a staff member to respond to your ticket.`)
        .addFields(
            { name: "**Please note:**", value: `- There will be a minimum of 10 seconds cooldown per message, please keep the conversation civilized and respect other party.\n- Staff members reserve the rights to close, freeze and block your ticket.\n- For technical problems regarding the application, please contact the development team.`},
        )
        .setFooter({
            text: "All messages from this ticket will be monitored or logged for development purposes."
        })
    }

    selected.add(interaction.user.id);
    console.log(`[INFO] User ${interaction.user.id} added to selected`);

    await interaction.update({
        embeds: [success],
        components: [] 
    });
}

module.exports = { loadMenu, selected };


