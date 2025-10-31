const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "messageCreate",
  once: false,

  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channel.isDMBased()) return;

//cd
    if (!client.cooldowns) client.cooldowns = new Map();

    const userId = message.author.id;
    const now = Date.now();
    const cooldownTime = 60 * 1000; // 10 seconds

    //check if cd
    const lastTrigger = client.cooldowns.get(userId);
    if (lastTrigger && now - lastTrigger < cooldownTime) return;

    const triggers = [
      {
        words: [
          'kms', 
          'kill myself',
          'hang myself', 
          'jump off', 
          'kill my self',
          'hang my self',
          'commit suicide',
          'kys',
          'kill yourself',
          'end yourself'
        ],
        file: './Vids/dontkyslowres.mp4'
      },
      {
        words: [
          'lonely', 
          'evernight'
        ],
        file: './Vids/lonelylowres.mp4'
      },
      {
         regexes: [
          /\bagnes\b/i,
          /\bagnes tachyon\b/i,
          /\btachyon\b/i
        ],
        file: './Vids/agnes4lowres.mp4'
      },
      {
        regexes: [
          /\bntr\b/i,
          /\bnarita top road\b/i,
          /\bnetori\b/i,
          /\bnetorare\b/i,
          /\bnarita\b/i
        ],
        file: './Vids/NTRlowres.mp4'
      }
    ];

    const content = message.content.toLowerCase();

    for (const { words, regexes, file } of triggers) {
      const matched =
        (words && words.some(word => content.includes(word))) ||
        (regexes && regexes.some(regex => regex.test(content)));

      if (matched) {
        try {
          await message.reply({ files: [file] });
          client.cooldowns.set(userId, now); // set cooldown after triggering
        } catch (err) {
          console.error(err);
        }
        break; // stop after first match
      }
    }
  }
};



 
