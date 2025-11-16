const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "logs", "exports", "clean_logs.json"); // your full export
const OUTPUT_DIR = path.join(__dirname, "logs", "exports", "split_logs");
const CHUNK_SIZE = 10000; // messages per file

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

let allMessages = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));

// Sort by timestamp ascending (oldest first)
allMessages.sort((a, b) => a.timestamp - b.timestamp);

let fileCount = 0;
for (let i = 0; i < allMessages.length; i += CHUNK_SIZE) {
  const chunk = allMessages.slice(i, i + CHUNK_SIZE);
  const fname = path.join(OUTPUT_DIR, `messages_${fileCount * CHUNK_SIZE + 1}-${fileCount * CHUNK_SIZE + chunk.length}.json`);
  fs.writeFileSync(fname, JSON.stringify(chunk, null, 2), "utf8");
  console.log(`Saved ${fname}`);
  fileCount++;
}

console.log(`Split ${allMessages.length} messages into ${fileCount} files.`);

