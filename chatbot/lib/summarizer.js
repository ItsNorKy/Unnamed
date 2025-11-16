const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Where your memory is stored
const MEMORY_DIR = path.join(__dirname, "..", "memory");

// Summarizer function
async function summarizeMemories(memoryChunk) {
  const text = memoryChunk.join("\n");

  try {
    const response = await axios.post(
      "http://localhost:3000/chat",
      {
        userId: "system",
        userName: "system",
        message:
          `Summarize the following memories into a very short, compact, emotion-aware summary. ` +
          `Keep Jiari's perspective and do NOT include specific quotes:\n\n${text}`
      },
      { timeout: 30000 }
    );

    return response.data.reply || "Unable to summarize.";
  } catch (e) {
    console.error("Summarization failed:", e.message);
    return "Summary unavailable (error).";
  }
}


// Trigger summarization when memory is too large
async function maybeSummarize(userId) {
  const file = path.join(MEMORY_DIR, `${userId}.json`);
  if (!fs.existsSync(file)) return;

  let memory = JSON.parse(fs.readFileSync(file, "utf8"));
  if (memory.length < 50) return; // Threshold

  const chunk = memory.slice(0, 30);      // Oldest 30
  const keep = memory.slice(30);          // Keep newer 20+

  const summary = await summarizeMemories(chunk);

  const summaryEntry =
    `SummaryBlock: ${summary}`;

  const newMemory = [...keep, summaryEntry];

  fs.writeFileSync(file, JSON.stringify(newMemory, null, 2), "utf8");
  console.log(`Summarized memory for user ${userId}.`);
}

module.exports = {
  maybeSummarize
};
