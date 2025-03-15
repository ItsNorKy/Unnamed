const { handleInteraction } = require("../events/SelectMenu");

module.exports = {
    name: "interactionCreate",
    once: false,

    async execute(interaction, client) {
        if (interaction.isStringSelectMenu()) {
            await handleInteraction(interaction, client);
        }
    },
};