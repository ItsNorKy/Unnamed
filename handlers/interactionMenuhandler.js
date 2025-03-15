function handleInteraction(interaction, client) {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === "servers") {
        const selectedValue = interaction.values[0];

        if (selectedValue === "devsv") {
            interaction.reply({
                content: "You selected **Dev Server**!",
                ephemeral: true, // Only visible to the user
            });
        } else if (selectedValue === "supsv1") {
            interaction.reply({
                content: "You selected **Supported Server**!",
                ephemeral: true,
            });
        }
    }
}

module.exports = { handleInteraction };
