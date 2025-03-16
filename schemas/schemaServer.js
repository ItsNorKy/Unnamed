const { Schema, model } = require("mongoose")

const Server = new Schema({

    guildId: { type: String, required: true, unique: true},
    categoryId: { type: String, required: true, unique: true},
    allowedRoles: { type: [String], default: []},
    appstatus: { type: String, required: true, default: "Online"},

});

module.exports = model("Server", Server)

