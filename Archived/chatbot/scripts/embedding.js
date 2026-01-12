const fs = require("fs");
const path = require("path");
const { pipeline } = require("@xenova/transformers");

// Paths
const botLogsDir = path.join(__dirname, "..", "logs", "exports");
const messagesDir = path.join(botLogsDir, "split_logs"); // folder containing 23 files
const embeddingsDir = path.join(botLogsDir, "embeddings"); // folder to save embeddings

if (!fs.existsSync(embeddingsDir)) fs.mkdirSync(embeddingsDir);

// Flatten nested arrays safely
function flattenArray(arr) {
  if (!Array.isArray(arr)) return [arr];
  return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flattenArray(val) : val), []);
}

async function main() {
  const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("Embedding model loaded.");

  const files = fs.readdirSync(messagesDir).filter(f => f.endsWith(".json"));
  console.log(`Found ${files.length} message files.`);

  for (const file of files) {
    const messagesFile = path.join(messagesDir, file);
    const embeddingsFile = path.join(embeddingsDir, file.replace(".json", "_emb.json"));

    const messages = JSON.parse(fs.readFileSync(messagesFile, "utf8"));
    const allEmbeddings = [];

    console.log(`Processing ${file} (${messages.length} messages)...`);

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i].content;
      if (!msg || !msg.trim()) continue;

      const embeddingTensor = await embedder(msg, { pooling: "mean" });
      const embedding = Array.isArray(embeddingTensor) ? flattenArray(embeddingTensor) : [embeddingTensor];

      allEmbeddings.push({
        id: messages[i].id,
        author: messages[i].author.username,
        content: msg,
        embedding
      });

      if ((i + 1) % 100 === 0) console.log(`  Processed ${i + 1}/${messages.length}`);
    }

    fs.writeFileSync(embeddingsFile, JSON.stringify(allEmbeddings, null, 2));
    console.log(`Saved embeddings to ${embeddingsFile}`);
  }

  console.log("All files processed!");
}

main().catch(err => console.error(err));





