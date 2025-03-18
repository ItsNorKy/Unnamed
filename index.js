const { Client, GatewayIntentBits, Partials, Collection} = require("discord.js")
const { Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent } = GatewayIntentBits
const { User, Message, GuildMember, Channel } = Partials
require("dotenv").config()

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent],
  partials: [User, Message, GuildMember, Channel]
})

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

client.login(process.env.TOKEN).then(() => console.log("Bot is online!"))
.catch(err => console.error("Login Error:", err));