const { OpenAI } = require("openai")
require("dotenv")

async function aiSummary(interaction, client, messages) {

    const openai = new OpenAI({
        apiKey: process.env.OPENAI
    })

    try {

    const response = await openai.responses.create({
        model: 'gpt-4o',
        instructions: 'Summarize the messages, make it professional and not too long',
        input: messages,
      });

    } catch (error) {

        console.error("Error generating AI summary:", error);
        return "No Summary Provided";
    }

}

module.exports = { aiSummary }