// lib/moderation.js
const axios = require("axios");
require("dotenv").config();

// Server-specific words
const bannedWords = ["clanker"]; 

async function aiModerationCheck(text) {
  if (process.env.USE_OPENAI_MODERATION !== "true") return { safe: true, reason: null };
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { safe: true, reason: null };

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/moderations",
      { input: text },
      { headers: { Authorization: `Bearer ${key}` } }
    );
    const flagged = res.data.results?.[0]?.flagged;
    return { safe: !flagged, reason: flagged ? "ai_moderation_flagged" : null };
  } catch (e) {
    console.warn("Moderation API error:", e.message);
    return { safe: true, reason: null }; // fallback permissive
  }
}

async function isSafeText(text) {
  if (!text || !text.trim()) return true;

  const lower = text.toLowerCase();

  // Rule-based blacklist
  if (bannedWords.some(w => lower.includes(w))) return false;

  // Block typical sexual/gore/violent/offensive words
  const blacklistPatterns = [
    /porn/i,
    /nsfw/i,
    /kill\s+yourself/i,
    /\b(nigg|fag|slur)\b/i // extend list with server-specific slurs
  ];
  if (blacklistPatterns.some(r => r.test(text))) return false;

  // Optional AI moderation
  const aiCheck = await aiModerationCheck(text);
  if (!aiCheck.safe) return false;

  return true;
}

module.exports = { isSafeText };

