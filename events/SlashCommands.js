const { ChatInputCommandInteraction } = require("discord.js")

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */
    execute(interaction, client) {
        if (!interaction.isChatInputCommand) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) 
        return interaction.reply({
        content: "Command is outdated", 
        flags: 64
    })

    if (command.developer && interaction.user.id !== "590827375189557259") 
        return interaction.reply({
            content: "Insufficient permission to execute this command",
            flags: 64
        })
    command.execute(interaction, client);
    }
}