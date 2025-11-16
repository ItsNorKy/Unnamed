const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const sv = require("../../servers.json")

const token = "OTM3MTc1MTM3NzQ3MzQ5NTQ0.G_41T5.JJSjw-HcHBNlWLwn_mY6Ypr83iL3tJVs0yXNo8"
const GUILD_ID = sv.SSv2;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
  if (!guild) {
    console.log("❌ Guild not found.");
    return;
  }

  console.log(`📁 Exporting messages from server: ${guild.name}`);

  // Ensure export folder exists
  const exportFolder = path.join(__dirname, "exports");
  if (!fs.existsSync(exportFolder)) {
    fs.mkdirSync(exportFolder);
  }

  const channels = guild.channels.cache.filter(
    (ch) => ch.isTextBased() && ch.type !== 4
  );

  for (const [channelId, channel] of channels) {
    console.log(`\n📌 Exporting #${channel.name} (${channelId})`);

    let messages = [];
    let lastID = null;

    while (true) {
      const options = { limit: 100 };
      if (lastID) options.before = lastID;

      try {
        const fetched = await channel.messages.fetch(options);
        if (fetched.size === 0) break;

        fetched.forEach((msg) => {
          messages.push({
            id: msg.id,
            author: {
              id: msg.author.id,
              username: msg.author.username,
            },
            content: msg.content,
            timestamp: msg.createdTimestamp,
            attachments: msg.attachments.map((a) => a.url),
            embeds: msg.embeds,
          });
        });

        lastID = fetched.last().id;
        process.stdout.write(`Fetched: ${messages.length} messages\r`);
      } catch (err) {
        console.log(`❌ Failed to fetch messages for #${channel.name}`);
        break;
      }
    }

    // Reverse to oldest → newest
    messages.reverse();

    const filePath = path.join(exportFolder, `${channel.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

    console.log(`\n✔ Saved ${messages.length} messages → exports/${channel.name}.json`);
  }

  console.log("\n🎉 Export complete!");
  process.exit();
});

client.login(token);

