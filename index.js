const { Client, GatewayIntentBits, Partials, Collection} = require("discord.js")
const { Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent } = GatewayIntentBits
const { User, Message, GuildMember, Channel } = Partials
require("dotenv").config()
const token = process.env.TOKEN;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent],
  partials: [User, Message, GuildMember, Channel]
})

const { loadEvents } = require("./handlers/eventHandler")
const { loadCommands } = require("./handlers/commandHandler")
const { mongodb } = require("./handlers/mongodb")

client.config = require("./config.json")
client.events = new Collection()
client.commands = new Collection()

loadEvents(client)
loadCommands(client)
mongodb().catch(console.dir)

module.exports = { client }

client.login(token)