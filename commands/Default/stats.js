// commands/gacha/stats.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GachaPull = require("../../gacha/pull_schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View convene statistics")
    .addUserOption(option =>
      option.setName("user").setDescription("Check another user's stats")
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const userId = targetUser.id;

    if (targetUser.bot)
      return interaction.reply({
        content: "Bots don’t have stats.",
        flags: 64
      });

    const pulls = await GachaPull.find({ userId });
    if (!pulls.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("This user has not made any pulls yet.")
        ],
        flags: 64
      });
    }

    const totalPulls = pulls.length;
    const rarityCounts = { 3: 0, 4: 0, 5: 0 };
    for (const pull of pulls) {
      rarityCounts[pull.rarity] = (rarityCounts[pull.rarity] || 0) + 1;
    }

    const percent = r => ((rarityCounts[r] / totalPulls) * 100).toFixed(2);
    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Gacha Stats`)
      .setColor(0xffd700)
      .setDescription(
        [
          `**Total Pulls:** ${totalPulls}`,
          `**5★:** ${rarityCounts[5] || 0} (${percent(5)}%)`,
          `**4★:** ${rarityCounts[4] || 0} (${percent(4)}%)`,
          `**3★:** ${rarityCounts[3] || 0} (${percent(3)}%)`
        ].join("\n")
      )
      .setFooter({
        text: `Last pull: ${pulls[pulls.length - 1].timestamp.toLocaleString()}`
      });

    await interaction.reply({ embeds: [embed] });
  }
};

