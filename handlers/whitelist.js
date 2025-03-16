async function addAllowedRole(guildId, roleId) {
    const server = await schemaServer.findOneAndUpdate(
        { guildId: guildId }, // Find by guild ID
        { $addToSet: { allowedRoles: roleId } }, // Add role if not already in array
        { new: true, upsert: true } // Create if not found
    );
}

async function removeAllowedRole(guildId, roleId) {
    const server = await schemaServer.findOneAndUpdate(
        { guildId: guildId },
        { $pull: { allowedRoles: roleId } }, // Remove role ID from array
        { new: true }
    );
}

async function getAllowedRoles(guildId) {
    const server = await schemaServer.findOne({ guildId: guildId });
    return server ? server.allowedRoles : [];
}

module.exports = { addAllowedRole, removeAllowedRole, getAllowedRoles }