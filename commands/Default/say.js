const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send messages via bot")
    .addChannelOption(Channel => 
        Channel
        .setName("channel")
        .setDescription("Specify the channel to send the message to")
    )
    .addStringOption(Message => 
        Message
        .setName("message")
        .setDescription("The message you want to send")
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute (interaction) {

        if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) {

            const channel = interaction.options.getChannel('channel') ?? interaction.channel
            const message = interaction.options.getString('message') 

            interaction.deferReply().then(() => {  
            interaction.deleteReply().then(() => {  
            channel.send(message)
            } 
        )})

        } else {
            const invalid = new EmbedBuilder()
            .setColor("Red")
            .setDescription("You do not have enough permission to perform this action.")
            interaction.reply({embeds: [invalid], ephemeral: true})
        }
    }
}
