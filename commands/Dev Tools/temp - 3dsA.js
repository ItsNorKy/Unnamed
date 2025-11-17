// starttimeout.js
const { SlashCommandBuilder } = require("discord.js");
const loops = require("../timeoutLoopManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("starttimeout")
        .setDescription("Start looping 5-minute timeout on a member")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("The member to timeout loop")
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.options.getMember("user");

        if (!member)
            return interaction.reply({ content: "Cannot find that member.", ephemeral: true });

        const msg = loops.startLoop(member);
        return interaction.reply({ content: msg });
    }
};
