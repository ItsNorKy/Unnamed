const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, AttachmentBuilder } = require("discord.js")
module.exports = {
    name: "messageCreate",
    once: false,

    async execute(message, client) {

        if (message.author.bot) return;

        if (message.channel.isDMBased()) return;

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
            words: [

                    'agnes', 
                    'tachyon'

                ],
            file: './Vids/agnes4lowres.mp4'
        },

        {
            regexes: [

                    /\bntr\b/i,
                    /\bnarita top road\b/i,
                    /\bnetori\b/i,
                    /\bnetorare\b/i
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
    } catch (err) {
      console.error(err);
    }
    break; // stop after the first match
    }
        }
    }
}


 
