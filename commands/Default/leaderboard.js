const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const GachaPull = require("../../gacha/pull_schema");
const { featured5Star } = require("../../gacha/data");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View global gacha leaderboards")
    .addStringOption(option =>
      option
        .setName("category")
        .setDescription("Select which leaderboard to view")
        .setRequired(true)
        .addChoices(
          { name: "Total Pulls", value: "total" },
          { name: "50/50 Win Streaks", value: "streaks" },
          { name: "Lingyang Pulls", value: "lingyang" }
        )
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const category = interaction.options.getString("category");

    const usernameCache = new Map();

    async function getUsername(userId) {
      if (usernameCache.has(userId)) return usernameCache.get(userId);

      try {
        const user = await interaction.client.users.fetch(userId);
        const username = user.username || "Unknown";
        usernameCache.set(userId, username);
        return username;
      } catch {
        usernameCache.set(userId, "Unknown");
        return "Unknown";
      }
    }

    try {
      let leaderboardData = [];
      let embedTitle = "";

      // total pulls
      if (category === "total") {
        embedTitle = "Total Pulls Leaderboard";
        leaderboardData = await GachaPull.aggregate([
          { $group: { _id: "$userId", username: { $first: "$username" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 50 },
        ]);
      }

      //  5/50
      else if (category === "streaks") {
        embedTitle = "50/50 Win Streak Leaderboard";
        const allUsers = await GachaPull.distinct("userId");
        const streakData = [];

        for (const userId of allUsers) {
          const pulls = await GachaPull.find({ userId }).sort({ timestamp: 1 }).lean();
          let currentStreak = 0;
          let longestStreak = 0;

          for (const p of pulls) {
            if (p.rarity === 5) {
              const isFeatured = p.name === featured5Star;
              if (isFeatured) {
                currentStreak++;
                if (currentStreak > longestStreak) longestStreak = currentStreak;
              } else {
                currentStreak = 0;
              }
            }
          }

          if (longestStreak > 0) {
            streakData.push({
              _id: userId,
              username: pulls[0]?.username || "Unknown",
              count: longestStreak,
            });
          }
        }

        leaderboardData = streakData.sort((a, b) => b.count - a.count).slice(0, 50);
      }

      // lingyang lb
      else if (category === "lingyang") {
        embedTitle = "Lingyang Pulls Leaderboard";
        leaderboardData = await GachaPull.aggregate([
          { $match: { name: "Lingyang" } },
          { $group: { _id: "$userId", username: { $first: "$username" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 50 },
        ]);
      }

      if (!leaderboardData.length) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("No leaderboard data available."),
          ],
        });
      }

      //fetch username
       for (const entry of leaderboardData) {
        entry.username = await getUsername(entry._id);
      }

      // pagination setup
      const pageSize = 10;
      const pages = [];
      for (let i = 0; i < leaderboardData.length; i += pageSize) {
        pages.push(leaderboardData.slice(i, i + pageSize));
      }
      let currentPage = 0;

      // desc builder
      const generateDescription = (pageData, startIndex) => {
        return pageData
          .map((entry, i) => {
            const rank = startIndex + i + 1;
            const userId = entry._id || "Unknown";
            const value = entry.count;
            let prefix = `Top ${rank}.`;
            if (rank === 1) prefix = "Top 1.";
            else if (rank === 2) prefix = "Top 2.";
            else if (rank === 3) prefix = "Top 3.";

            const label =
            category === "streaks" ? "win streaks" :
            category === "lingyang" ? "femboys" :
            "pulls";

            return `**${prefix}** <@${userId}> — \`${value} ${label}\``;
          })
          .map((line, i) => {
            const absoluteRank = startIndex + i;
            if (absoluteRank === 2) return `${line}\n** **\n━━━━━━━━ \`Top 3\` ━━━━━━━━━\n`;
            if (absoluteRank === 9) return `${line}\n** **\n━━━━━━━━━ \`Top 10\` ━━━━━━━━━\n`;
            if (absoluteRank === 24) return `${line}\n** **\n━━━━━━━━━ \`Top 25\` ━━━━━━━━━\n`;
            if (absoluteRank === 49) return `${line}\n** **\n━━━━━━━━━ \`Top 50\` ━━━━━━━━━\n`;
            return line;
          })
          .join("\n");
      };

      const generateEmbed = (pageIndex) => {
        const pageData = pages[pageIndex];
        const startIndex = pageIndex * pageSize;

        return new EmbedBuilder()
          .setTitle(`**${embedTitle}**`)
          .setThumbnail("https://static.wikia.nocookie.net/wutheringwaves/images/d/d9/The_Black_Shores_Emblem.png/revision/latest?cb=20240529084501")
          .setColor(config.defaultclr || 0x00aeff)
          .setDescription(generateDescription(pageData, startIndex))
          .setFooter({
            text: `Page ${pageIndex + 1}/${pages.length}`,
          })
          .setTimestamp();
      };

      //first page
      if (pages.length === 1) {
        // Only one page — no buttons
        return interaction.editReply({
          embeds: [generateEmbed(0)],
        });
      }

      // add nav buttons (if more than one page)
      const prevBtn = new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("⏮️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const nextBtn = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("⏭️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(pages.length <= 1);

      const row = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

      const msg = await interaction.editReply({
        embeds: [generateEmbed(currentPage)],
        components: [row],
      });

      const collector = msg.createMessageComponentCollector({
        time: 120000, // 2 minutes
      });

      collector.on("collect", async (btnInt) => {
        if (btnInt.user.id !== interaction.user.id) {
          const er = EmbedBuilder()
          .setColor("Red")
          .setDescription("Unable to interact with this button. This embed is being used by someone else.")
          return btnInt.reply({ embeds: [er], flags: 64 });
        }

        if (btnInt.customId === "prev" && currentPage > 0) currentPage--;
        else if (btnInt.customId === "next" && currentPage < pages.length - 1) currentPage++;

        prevBtn.setDisabled(currentPage === 0);
        nextBtn.setDisabled(currentPage === pages.length - 1);

        await btnInt.update({
          embeds: [generateEmbed(currentPage)],
          components: [new ActionRowBuilder().addComponents(prevBtn, nextBtn)],
        });
      });

      collector.on("end", async () => {
        prevBtn.setDisabled(true);
        nextBtn.setDisabled(true);
        await msg.edit({
          components: [new ActionRowBuilder().addComponents(prevBtn, nextBtn)],
        });
      });
    } catch (err) {
      console.error("Leaderboard error:", err);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while generating the leaderboard."),
        ],
      });
    }
  },
};
