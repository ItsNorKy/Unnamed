// smRetrieve.js — CommonJS compatible with Xenova (ESM-only)
const fs = require("fs");
const path = require("path");

// Dynamic ESM import wrapper for Xenova
async function loadXenova() {
  return await import("@xenova/transformers");
}

// Load embedding files dynamically
const embedDir = path.join(__dirname, "..", "logs", "exports", "embeddings");
const embedFiles = fs.readdirSync(embedDir)
  .filter(f => f.endsWith(".json"))
  .sort();

let logsWithEmbeddings = [];
for (const file of embedFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(embedDir, file), "utf8"));
  logsWithEmbeddings.push(...data);
}
console.log(`Loaded ${logsWithEmbeddings.length} embeddings.`);

// Cosine similarity
function cosineSim(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

// Retrieve top N messages
function retrieveSemantic(userEmb, logs, limit = 5) {
  if (!logs || logs.length === 0) return [];

  return logs
    .map(log => ({
      ...log,
      score: cosineSim(userEmb, log.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);               // ← prevents explosion
}

// Lazy-loaded pipeline instance
let embedder = null;

async function getEmbedding(text) {
  if (!embedder) {
    console.log("Loading Xenova embedding model (lazy)...");

    const { pipeline } = await loadXenova();
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  const result = await embedder(text, { pooling: "mean", normalize: true });

  // Xenova returns { data: Float32Array }
  return Array.from(result.data);
}

module.exports = {
  retrieveSemantic,
  getEmbedding,
  logsWithEmbeddings
};





