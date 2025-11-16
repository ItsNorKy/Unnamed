const fs = require("fs");
const path = require("path");

const rawLogs = JSON.parse(fs.readFileSync("./genchat.json", "utf8"));

const cleanLogs = rawLogs.filter(msg => {
  if (msg.isBot) return false;
  if (!msg.content || msg.content.trim() === "") return false;
  if (msg.content.startsWith("!") || msg.content.startsWith("/")) return false;
  return true;
});

fs.writeFileSync("./clean_logs.json", JSON.stringify(cleanLogs, null, 2), "utf8");
console.log(`Cleaned ${cleanLogs.length} messages`);
