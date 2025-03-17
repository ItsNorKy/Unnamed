const { Schema, model } = require("mongoose")

const Server = new Schema({

    guildId: { type: String, required: true, unique: true},
    categoryId: { type: String, required: true, unique: true},
    appstatus: { type: String, required: true, default: "Online"},
    logsChannelID: { type: String, required: true, unique: true},
    prefix: { type: String, default: "."}
});

module.exports = model("Server", Server)

