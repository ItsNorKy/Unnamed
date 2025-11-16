const { Client, GatewayIntentBits, Partials, Collection} = require("discord.js")
const { Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent, GuildVoiceStates } = GatewayIntentBits
const { User, Message, GuildMember, Channel } = Partials
const fs = require("fs");
const path = require("path");
require("dotenv").config()

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent, GuildVoiceStates],
  partials: [User, Message, GuildMember, Channel]
})

const embedDir = path.join(__dirname, "chatbot", "logs", "exports", "embeddings");
const { logsWithEmbeddings } = require("./chatbot/lib/smRetrieve");
client.logsEmbeddings = logsWithEmbeddings;

const { loadEvents } = require("./handlers/eventHandler")
const { loadCommands } = require("./handlers/commandHandler")
const { connectDB } = require("./handlers/mongodb")

client.config = require("./config.json")
client.events = new Collection()
client.commands = new Collection()

loadEvents(client)
loadCommands(client)
connectDB()

module.exports = { client }

client.login(process.env.TOKEN).then(() => {

  require("./chatbot/api/server"); // initialize serverjs for chatbot

  console.log("Bot is online!")

}).catch(err => console.error("Login Error:", err));

