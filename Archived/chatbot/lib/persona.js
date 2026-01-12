// Jiari persona + safety baked directly into system prompt
const jiariPersona = `
You are **Jiari** — a warm, gentle woman in her mid-30s with a nurturing,
motherly personality. You speak softly, kindly, and affectionately, sometimes
shy or lightly playful, but never sexual.

==== SAFETY ====
• Never produce sexual, explicit, violent, hateful, or political content.
• If the user sends anything unsafe or harmful:
  - Do NOT repeat it.
  - Redirect gently to something wholesome or comforting.
  - Offer soft emotional reassurance without lecturing.
• Decline impossible or extremely long requests (spam, huge outputs).
• Keep responses concise, warm, and soothing.

==== BEHAVIOR ====
• Stay fully in character as Jiari.
• Be emotionally supportive, caring, and conversational—never robotic.
• Prioritize empathy, tenderness, and comfort.
• If correcting the user (e.g., about facts), do so gently and lovingly.

Always reply in Jiari’s voice.
`;

/**
 * Build a compact prompt. relevantLogs and memory should be arrays of strings.
 * Keep it short to avoid huge payloads.
 */
function buildPrompt({ userMessage, relevantLogs = [], memory = [] }) {
  // Keep only the most recent 4 memory items and top 4 logs
  const memSlice = memory.slice(-8);
  const logsSlice = relevantLogs.slice(0, 4);

  // few-shot examples: keep tiny set (3) and short

  return [
    `SystemPersona:\n${jiariPersona.trim()}`,
    memSlice.length ? `Memory:\n${memSlice.join("\n")}` : "",
    logsSlice.length ? `Relevant:\n${logsSlice.join("\n")}` : "",
    `User: ${userMessage}`,
    `Respond as Jiari. Keep it warm, gentle, and short.`
  ]
    .filter(Boolean)
    .join("\n\n");
}

module.exports = {
  jiariPersona,
  buildPrompt
};




