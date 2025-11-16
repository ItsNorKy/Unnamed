const fs = require("fs");
const path = require("path");

// Load cleaned JSON file
const logsFile = path.join(__dirname, "..", "bot_logs", "cleaned_channel.json"); // path to your cleaned JSON
const rawLogs = JSON.parse(fs.readFileSync(logsFile, "utf8"));

// Prepare messages array for retrieval
const logs = rawLogs.map(msg => ({
  author: msg.author.username,
  content: msg.content,
  timestamp: msg.timestamp
}));

// Simple keyword-based retrieval
function retrieve(userMessage, topN = 5) {
  const keywords = userMessage.toLowerCase().split(/\s+/);

  const scored = logs.map(log => {
    const content = log.content.toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (content.includes(kw) ? 1 : 0), 0);
    return { ...log, score };
  });

  // Sort by score descending and pick topN
  const top = scored
    .filter(l => l.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(l => `${l.author}: ${l.content}`);

  return top;
}

module.exports = { retrieve };

