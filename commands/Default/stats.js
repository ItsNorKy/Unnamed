// commands/gacha/stats.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GachaHistory = require("../../gacha/history_schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View convene statistics")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Check another user's stats")
    ),

  async execute(interaction) {

    const targetUser = interaction.options.getUser("user") || interaction.user;
    const userId = targetUser.id;

    if (targetUser.bot) return; // check if bot 

    const history = await GachaHistory.findOne({ userId });
    if (!history || !history.pulls.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`Unable to display user's convene stats. This user has not made any pulls yet.`)
        ],
        flags: 64
      });
    }

    const totalPulls = history.totalPulls;
    const rarityCounts = { 3: 0, 4: 0, 5: 0 };
    for (const pull of history.pulls) {
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
      .setFooter({ text: `Last updated: ${history.lastUpdated.toLocaleString()}` });

    await interaction.editReply({ embeds: [embed] });
  }
};
