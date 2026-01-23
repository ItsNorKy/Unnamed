// deploy-commands.js
const { REST, Routes } = require('discord.js');
require("dotenv").config()

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Clearing guild commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT,
        "1231854587451801612" //Guild ID
      ),
      { body: [] } 
    );

    console.log('Guild commands cleared.');
  } catch (error) {
    console.error(error);
  }
})();
