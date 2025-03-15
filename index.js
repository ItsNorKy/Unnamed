const { Client, GatewayIntentBits, Partials, Collection} = require("discord.js")
const { Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent } = GatewayIntentBits
const { User, Message, GuildMember, Channel } = Partials

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent],
  partials: [User, Message, GuildMember, Channel]
})

const { loadEvents } = require("./handlers/eventHandler")
const { loadCommands } = require("./handlers/commandHandler")

client.config = require("./config.json")
client.events = new Collection()
client.commands = new Collection()

loadEvents(client)
loadCommands(client)

module.exports = { client }

client.login(client.config.token)