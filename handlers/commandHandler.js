async function loadCommands(client) {

    const { REST, Routes } = require('discord.js');
    require("dotenv")
    const token = process.env.TOKEN
    const { clientid, guildid } = require('../config.json');
    const { loadFiles } = require("../function/fileLoader")
    const ascii = require("ascii-table")
    const table = new ascii().setHeading("Commands", "Status")

    await client.commands.clear();  

    let commandsArray = [];

    const Files = await loadFiles("commands")

    Files.forEach((file) => {
            const command = require(file) 
            client.commands.set(command.data.name, command)
            commandsArray.push(command.data.toJSON());

            table.addRow(command.data.name, "Success")
    })

client.commands.set(commandsArray)

const rest = new REST({version: '10'}).setToken(token);

( async () => {
    try { 

        console.log("Process has been completed")

        await rest.put(
        
            Routes.applicationGuildCommands( // Routes.applicationCommands(clientId) - Global commands
                clientid,
                guildid,
            ),
            { body: commandsArray}
        )
    } catch (error) {
        console.log(error)
    }
})()

return console.log(table.toString(), "\nCommands loaded")

}

module.exports = { loadCommands }