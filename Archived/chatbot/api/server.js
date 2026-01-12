// api/server.js
require("dotenv").config() //{ path: "../../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const { isSafeText } = require("../lib/moderation.js");
const { buildPrompt } = require("../lib/persona.js");
const { loadMemory, pushMemory } = require("../lib/memory.js");
const { retrieveSemantic, logsWithEmbeddings, getEmbedding } = require("../lib/smRetrieve.js");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.API_PORT || 3000;
const GROQ_KEY = process.env.GROQ_API_KEY;

// ---------------------------------------------------------------------
//  Groq LLM call (Llama 3.1 8B)
// ---------------------------------------------------------------------
async function callLLM(prompt) {
  if (!GROQ_KEY) return "No Groq API key configured.";

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: prompt }
        ],
        max_tokens: 350,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("Groq LLM Error:", err.response?.data || err.message);
    return "Jiari is having trouble thinking right now. Please try again later.";
  }
}

// ---------------------------------------------------------------------
//  /chat route (main chatbot endpoint)
// ---------------------------------------------------------------------
app.post("/chat", async (req, res) => {
  try {
    const { userId, userName, message } = req.body;
    if (!message || !userId)
      return res.status(400).json({ error: "userId and message required" });

    // 1) Mod check
    const safe = await isSafeText(message);
    if (!safe) {
      return res.json({
        reply: "Oh dear... I can't help with that topic. Can we talk about something else?"
      });
    }

    // 2) Semantic retrieval
    const embedding = await getEmbedding(message);
    const relevantLogs = await retrieveSemantic(embedding, logsWithEmbeddings, 5);

    // 3) Memory load
    const memory = loadMemory(userId);

    // 4) Build Jiari prompt
    const prompt = buildPrompt({
      userMessage: message,
      relevantLogs,
      memory
    });

    // 5) Groq call
    const llmReply = await callLLM(prompt);

    // 6) Post-filter
    const safeReply = (await isSafeText(llmReply))
      ? llmReply
      : "I'm sorry sweetheart, I can't discuss that.";

    // 7) Save memory
    pushMemory(userId, `User: ${message}`);
    pushMemory(userId, `Jiari: ${safeReply}`);

    // 8) Respond
    res.json({ reply: safeReply });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({
      reply: "Jiari is having trouble thinking right now."
    });
  }
});

// ---------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Jiari API running on port ${PORT} (Groq Llama 3.1 8B)`);
});

