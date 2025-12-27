const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, Collection } = require("discord.js");
const { pullOnce } = require("../../gacha/algorithm");
const { loadUser, saveUser } = require("../../gacha/userData");
const { renderGachaResult } = require("../../gacha/result_canvas");
const GachaPull = require("../../gacha/pull_schema");
const { banners, activeBanners } = require("../../gacha/data");
const fs = require("fs");
const path = require("path");
const cooldowns = new Collection();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pull")
    .setDescription("Perform a gacha pull! (BETA FEATURE)")
    .addStringOption(option =>
      option
        .setName("banner")
        .setDescription("Select a limited banner")
        .addChoices(
          { name: "Featured Resonator", value: "ftres" },
          { name: "Rerun Resonator", value: "rerunres" },
          { name: "Second Rerun Resonator ", value: "rerunres2" }
        )
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Number of pulls")
        .addChoices(
          { name: "Single Pull (1x)", value: 1 },
          { name: "Ten Pull (10x)", value: 10 }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();
    const cooldownAmount = 10 * 1000;

    if (cooldowns.has(userId)) {
      const expiration = cooldowns.get(userId);
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        const cd = new EmbedBuilder()
          .setColor("Red")
          .setDescription(`The command is on cooldown. Please wait ${remaining}s before trying again.`);
        return interaction.reply({ embeds: [cd], flags: 64 });
      }
    }

    cooldowns.set(userId, now + cooldownAmount);
    setTimeout(() => cooldowns.delete(userId), cooldownAmount);

    await interaction.deferReply();

    const bannerOption = interaction.options.getString("banner"); // "ftres" or "rerunres"
    const amount = interaction.options.getInteger("amount");

    const userState = await loadUser(userId);
    const results = [];

    for (let i = 0; i < amount; i++) {
      results.push(pullOnce(userState, bannerOption));
    }

    // Resolve banner info at the time of pull
    const bannerKey = bannerOption;
    const bannerName = activeBanners[bannerKey];
    const featured5Star = banners[bannerName]?.featured5Star || null;
    const featured4Stars = banners[bannerName]?.featured4Stars || [];

    // Save pull history with banner data snapshot
    await GachaPull.insertMany(
      results.map(r => ({
        userId,
        username: interaction.user.username,
        name: r.name,
        rarity: r.rarity,
        banner: bannerName,        
        bannerKey,                 
        featured5Star,             
        featured4Stars,            
        timestamp: new Date()
      }))
    );

    await saveUser(userState);

    const special = results.some(
      result => result && result.name && result.name.toLowerCase().includes("lingyang")
    );
    if (special) {
      const videoPath = path.resolve(__dirname, "../../gacha/assets/special.mp4");
      if (fs.existsSync(videoPath)) {
        const video = new AttachmentBuilder(videoPath, { name: "special.mp4" });
        await interaction.editReply({
          content: "Holy moly, you pulled the femboy!",
          files: [video]
        });
      } else {
        await interaction.editReply({
          content: "Holy moly, you pulled the femboy! (No video found)"
        });
      }
      await new Promise(resolve => setTimeout(resolve, 13000));
    }

    results.sort((a, b) => b.rarity - a.rarity);
    const highestRarity = Math.max(...results.map(r => r.rarity));
    const rarityColors = { 3: 0xa7ebfb, 4: 0xd68fd9, 5: 0xffd700 };
    const embedColor = rarityColors[highestRarity] || 0xa7ebfb;

    const description = results
      .map((item, index) => `**${index + 1}.** ${item.name}`)
      .join("\n");

    const image = await renderGachaResult(results);
    const attachment = new AttachmentBuilder(image, { name: "pull_result.jpeg" });

    const embed = new EmbedBuilder()
      .setTitle("**Convene Result**")
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail("https://static.wikia.nocookie.net/wutheringwaves/images/c/cb/Icon_Convene.png/revision/latest?cb=20250923100828")
      .setDescription(description)
      .setColor(embedColor)
      .setImage("attachment://pull_result.jpeg")
      .setFooter({
        text: `5✦: ${userState.pity5}/80 - 4✦: ${userState.pity4}/10`
      });

    await interaction.editReply({
      embeds: [embed],
      files: [attachment]
    });
  }
};


