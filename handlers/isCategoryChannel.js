const { ChannelType, Guild } = require("discord.js")

/**
 * 
 * @param { Guild } guild 
 * @param { String } channelId 
 * @returns { Promise<boolean> } 
 */

async function isCategoryChannel(guild, channelId) {

    try {

        const channel = await guild.channels.fetch(channelId) 

        if (channel && channel.type === ChannelType.GuildCategory) {

            return true; 

        } else {

            return false;
        }

    } catch (error) {

        console.log(`Error fetching channel`, error)
        return false;
        
    }
}

module.exports = { isCategoryChannel }