const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const GachaPull = require("../../gacha/pull_schema");
const { featured5Star, standard5Stars } = require("../../gacha/data");
const config = require("../../config.json");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// register fonts
registerFont(path.join(__dirname, "../../gacha/assets/fonts/LaguSansBold.otf"), {
  family: "LaguSansBold",
});

registerFont(path.join(__dirname, "../../gacha/assets/fonts/NotoSansSymbols2-Regular.ttf"), {
  family: "NotoSymbols",
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View convene statistics")
    .addUserOption(option =>
      option.setName("user").setDescription("Check another user's convene stats")
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const targetUser = interaction.options.getUser("user") || interaction.user;
      const userId = targetUser.id;

      if (targetUser.bot) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Unable to display user's convene stats. This user is an application/bot"),
          ],
        });
      }

      const pulls = await GachaPull.find({ userId }).sort({ timestamp: 1 }).lean();
      if (!pulls.length) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Unable to display user's convene stats. This user has no pull records"),
          ],
        });
      }

      // rarity count
      const totalPulls = pulls.length;
      const rarityCounts = { 3: 0, 4: 0, 5: 0 };
      for (const p of pulls) rarityCounts[p.rarity]++;

      // 50/50 wins ===
      const fiveStars = pulls.filter(p => p.rarity === 5);
      const total5 = fiveStars.length;
      const featuredWins = fiveStars.filter(
        p => p.name === featured5Star || !standard5Stars.includes(p.name)
      ).length;
      const featuredPercent = total5 ? (featuredWins / total5) * 100 : 0;

      // avg & median pity
      const pities = [];
      let counter = 0;
      for (const p of pulls) {
        counter++;
        if (p.rarity === 5) {
          pities.push(counter);
          counter = 0;
        }
      }
      const avgPity = pities.length
        ? pities.reduce((a, b) => a + b, 0) / pities.length
        : null;
      const medianPity = pities.length
        ? (() => {
            const sorted = [...pities].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2
              ? sorted[mid]
              : (sorted[mid - 1] + sorted[mid]) / 2;
          })()
        : null;

      // create canvas
      const width = 640;
      const height = 360;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // === Background ===
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // header
      ctx.fillStyle = "#ffffff";
      ctx.font = '20px "LaguSansBold"';
      ctx.fillText(`${targetUser.username}'s Pull Distribution`, 20, 30);

      // data for pie
      const data = [
        { value: rarityCounts[5] || 0, color: "#FFD700" },
        { value: rarityCounts[4] || 0, color: "#D68FD9" },
        { value: rarityCounts[3] || 0, color: "#A7EBFB" },
      ];

      const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
      const cx = 320;
      const cy = 180;
      const radius = 120;
      let startAngle = -Math.PI / 2;

      // draw pie
      for (const d of data) {
        const slice = (d.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        startAngle += slice;
      }

      // inner donut hole
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#0b1220";
      ctx.fill();

      // bottom text details
      ctx.fillStyle = "#bbbbbb";
      ctx.font = '14px "LaguSansBold"';
      ctx.fillText(`Total pulls: ${totalPulls}`, 20, 330);
      ctx.fillText(
        `50/50 wins: ${featuredWins} (${featuredPercent.toFixed(2)}%)`,
        20,
        350
      );
      ctx.fillText(
        `Avg. pity: ${avgPity ? avgPity.toFixed(2) : "N/A"}`,
        260,
        350
      );
      ctx.fillText(
        `Median pity: ${medianPity ? medianPity.toFixed(1) : "N/A"}`,
        420,
        350
      );

      // export img
      const buffer = canvas.toBuffer("image/png");
      const attachment = new AttachmentBuilder(buffer, { name: "gacha_stats.png" });

      // embed
      const embed = new EmbedBuilder()
        .setTitle("**Overall Convene Statistics**")
        .setAuthor({
          name: targetUser.username,
          iconURL: targetUser.displayAvatarURL({ dynamic: true }),
        })
        .setColor(config.defaultclr || 0x00aeff)
        .setThumbnail(
          "https://static.wikia.nocookie.net/wutheringwaves/images/d/d9/The_Black_Shores_Emblem.png/revision/latest?cb=20240529084501"
        )
        .setDescription(
          [
            `> **Total Pulls:** ${totalPulls}`,
            `> **5✦:** ${rarityCounts[5]} (\`${(
              (rarityCounts[5] / totalPulls) *
              100
            ).toFixed(2)}%\`)`,
            `> **4✦:** ${rarityCounts[4]} (\`${(
              (rarityCounts[4] / totalPulls) *
              100
            ).toFixed(2)}%\`)`,
            `> **3✦:** ${rarityCounts[3]} (\`${(
              (rarityCounts[3] / totalPulls) *
              100
            ).toFixed(2)}%\`)`,
            ``,
            `> **50/50 Wins:** ${featuredWins}/${total5} (\`${featuredPercent.toFixed(
              2
            )}%\`)`,
            `> **Average Pity:** ${avgPity ? avgPity.toFixed(2) : "N/A"}`,
            `> **Median Pity:** ${medianPity ? medianPity.toFixed(1) : "N/A"}`,
          ].join("\n")
        )
        .setImage("attachment://gacha_stats.png")
        .setFooter({
          text: `Last pull: ${new Date(
            pulls[pulls.length - 1].timestamp
          ).toLocaleString()}`,
        });

      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error("Error generating stats:", err);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while generating stats."),
        ],
      });
    }
  },
};




