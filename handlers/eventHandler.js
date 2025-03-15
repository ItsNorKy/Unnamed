const { loadFiles } = require("../function/fileLoader")

async function loadEvents(client) {

    const ascii = require("ascii-table")
    const table = new ascii().setHeading("Events", "Status")
    const Files = await loadFiles("events")

    Files.forEach((file) => {
        const event = require(file)
        const execute = (...args) => event.execute(...args, client)
        client.events.set(event.name, execute)

        if (event.rest) {
            if (event.once) client.rest.once(event.name, execute)
            else client.rest.on(event.name, execute)

        } else {

            if (event.once) client.once(event.name, execute)
            else client.on(event.name, execute)
        }

        table.addRow(event.name, "Success")
    })

    return console.log(table.toString(), "\nLoaded Events")
    
}

module.exports = { loadEvents }