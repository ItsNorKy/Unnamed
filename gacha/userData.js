// userData.js
const UserGacha = require("../schemas/schemaGch");

async function loadUser(userId) {
  let user = await UserGacha.findOne({ userId });
  if (!user) {
    user = new UserGacha({ userId });
    await user.save();
  }
  return user;
}

async function saveUser(user) {
  await user.save();
}

module.exports = { loadUser, saveUser };
