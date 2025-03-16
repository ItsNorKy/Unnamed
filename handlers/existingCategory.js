const schemaServer = require("../schemas/schemaServer")

async function getCategoryForServer(guildId) {

    const data = await schemaServer.findOne({ guildId, categoryId })
    
}

module.exports = { getCategoryForServer }