const { Schema, model } = require("mongoose");

const userTicket = new Schema({

    userId: { type: String, required: true},
    guildId: { type: String, required: true},
    categoryId: { type: String, required: true},
    ticketChannelId: { type: String, required: true},
    createdAt: { type: Date, default: Date.now}

});

module.exports = model("UserTicket", userTicket)