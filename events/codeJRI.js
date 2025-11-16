// events/codeJRI.js
const fs = require("fs");
const path = require("path");
const { isSafeText } = require("../chatbot/lib/moderation");
const { loadMemory, pushMemory } = require("../chatbot/lib/memory");
const { buildPrompt, jiariPersona } = require("../chatbot/lib/persona");
const { retrieveSemantic, getEmbedding } = require("../chatbot/lib/smRetrieve");
const queue = require("../chatbot/lib/queue");

const axios = require("axios");

const RESPONSE_CHANNEL = "1430212367765209232";

// Rate limit map: per user 1.2 sec min gap
const cooldowns = new Map();

function sanitizeText(s, maxLen = 300) {
  if (!s) return "";
  let t = String(s);

  // Remove mentions
  t = t.replace(/<@!?\d+>/g, "");

  // Remove custom emoji
  t = t.replace(/<a?:\w+:\d+>/g, "");

  // Preserve non-ASCII characters (Chinese, Japanese, etc.)
  t = t.replace(/[^\S\r\n]+/g, " ").trim();

  // Safe substring by code points (multi-byte aware)
  const chars = [...t]; // spread into Unicode code points
  if (chars.length > maxLen) {
    return chars.slice(0, maxLen - 3).join("") + "...";
  }

  return t;
}

// Extract a human-friendly text from a retrieved "log" item (handles many shapes)
function extractLogText(item) {
  if (!item) return "";
  if (typeof item === "string") return sanitizeText(item);
  // common keys
  const keys = ["text", "content", "message", "msg", "body", "excerpt"];
  for (const k of keys) {
    if (typeof item[k] === "string" && item[k].trim()) {
      return sanitizeText(item[k]);
    }
  }
  // If the item has a nested shape like { data: { text: ... } }
  if (item.data && typeof item.data === "object") {
    for (const k of keys) {
      if (typeof item.data[k] === "string") return sanitizeText(item.data[k]);
    }
  }
  // fallback - stringify small
  try {
    return sanitizeText(JSON.stringify(item).slice(0, 300));
  } catch (e) {
    return "";
  }
}


// clamp final prompt length
function clamp(text, max = 4000) {
  if (!text) return "";
  const chars = [...text]; // Unicode-safe
  return chars.length > max ? chars.slice(chars.length - max).join("") : text;
}

module.exports = {
  name: "messageCreate",
  once: false,

  async execute(message, client) {
    try {
      if (message.author.bot) return;

      const isDM = message.channel.type === 1;
      if (!isDM && message.channel.id !== RESPONSE_CHANNEL) return;

      const repliedToBot = message.reference
        ? (await message.channel.messages.fetch(message.reference.messageId)).author.id === client.user.id
        : false;
      const pingedBot = message.mentions.has(client.user.id);
      if (!repliedToBot && !pingedBot) return;

      const userMessage = message.cleanContent.trim();
      if (!userMessage) return;

      // rate-limit per user
      const now = Date.now();
      const last = cooldowns.get(message.author.id) || 0;
      if (now - last < 1200) {
        return message.reply("Oh dear… slow down a little sweetheart, I’m trying my best to keep up…");
      }
      cooldowns.set(message.author.id, now);

      // moderation check (you kept this)
      const safe = await isSafeText(userMessage);
      if (!safe) {
        await message.reply({
        content: "I'm sorry sweetheart… let's talk about something gentle and wholesome instead, okay?"
        });
    return;
      }

      // === LOG MESSAGE TO FILE ===
      const logsDir = path.join(__dirname, "..", "bot_logs");
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
      const fname = path.join(logsDir, `${message.channel.id}.jsonl`);
      fs.appendFileSync(
        fname,
        JSON.stringify({
          id: message.id,
          channelId: message.channel.id,
          authorId: message.author.id,
          authorName: message.author.username,
          content: userMessage,
          timestamp: message.createdTimestamp
        }) + "\n",
        "utf8"
      );

      // === LOAD MEMORY ===
      const memoryRaw = loadMemory(message.author.id) || [];
      const memory = memoryRaw.slice(-50).map(m => sanitizeText(m, 500));

      // === SEMANTIC RETRIEVAL ===
      let userEmb = null;
      try {
        userEmb = await getEmbedding(userMessage);
      } catch (e) {
        console.error("getEmbedding failed:", e && e.message ? e.message : e);
      }

      let rawRelevant = [];
      if (userEmb) {
        rawRelevant = retrieveSemantic(userEmb, client.logsEmbeddings || [], 5);
      }

      // normalize rawRelevant to array of strings
      const relevantLogs = (rawRelevant || [])
        .map(extractLogText)
        .filter(Boolean)
        .slice(0, 4); // keep top 4 only

      // === BUILD PROMPT ===
      const prompt = buildPrompt({ userMessage: sanitizeText(userMessage, 1000), relevantLogs, memory });
      const finalPrompt = clamp(prompt, 1500);

      // === CALL LOCAL API ===
  const reply = await queue.enqueue(message.author.id, async () => {
  const API_URL = "http://localhost:3000/chat";
  let result = "Jiari couldn't think right now. Try again later.";

  try {
    const replyResponse = await axios.post(
      API_URL,
      {
        userId: message.author.id,
        userName: message.author.username,
        message: finalPrompt
      },
      { timeout: 60000 }
    );

    if (replyResponse?.data?.reply && typeof replyResponse.data.reply === "string") {
      result = replyResponse.data.reply;
    } else {
      console.warn(
        "Unexpected /chat response shape:",
        replyResponse && replyResponse.data
      );
    }
 } catch (e) {
    if (e.response) {
        console.error("Chat API error response:", {
            status: e.response.status,
            data: typeof e.response.data === "string"
                ? e.response.data
                : JSON.stringify(e.response.data).slice(0, 2000)
        });

        // --- Handle RATE LIMIT 429 gracefully ---
        if (e.response.status === 429) {
            return (
              "Sweetheart… I’m trying to keep up, but I’m a little overwhelmed…\n" +
              "Give me just a moment, okay? I’ll be right here…"
            );
        }
    } else {
        console.error("Chat API request failed:", e?.message || e);
    }

    // Fallback for other errors
    return (
      "I'm sorry sweetie... I'm having trouble thinking right now. Maybe we can try again in a moment? " +
      "Oh dear, maybe we can comeback to this topic again later on?"
    );
}


  return result;
  });

      // === MEMORY UPDATE ===
      pushMemory(message.author.id, `User: ${userMessage}`);
      pushMemory(message.author.id, `Jiari: ${reply}`);
      const { maybeSummarize } = require("../chatbot/lib/summarizer");

      await maybeSummarize(message.author.id);

      if (/^(No|You're wrong|Actually)/i.test(userMessage)) {
        pushMemory(message.author.id, `Correction (uncertain): ${userMessage}`);
      }

      // === SEND REPLY ===
      await message.channel.sendTyping();
      const delay = Math.min(3000, 500 + reply.length * 10); // 0.5–3 seconds
      await new Promise(res => setTimeout(res, delay));

      await message.reply({ content: reply });

    } catch (err) {
      console.error("Error in messageCreate event:", err);
    }
  }
};





