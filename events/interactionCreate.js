const { Events } = require("discord.js");
const { loadMenu } = require("../handlers/menuHandler");
const { loadModal } = require("../handlers/modalHandler");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        try {
            if (interaction.isStringSelectMenu()) {
                await loadMenu(interaction, client);
                return;
            }

            if (interaction.isModalSubmit()) {
                await loadModal(interaction, client);
                return;
            }

            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);

                if (command.developer && interaction.user.id !== "590827375189557259") {
                    return interaction.reply({
                        content: "Insufficient permission to execute this command",
                        flags: 64,
                    });
                }

                await command.execute(interaction, client);
            }
        } catch (error) {
            console.error("Error handling interaction:", error);
        }
    },
};
