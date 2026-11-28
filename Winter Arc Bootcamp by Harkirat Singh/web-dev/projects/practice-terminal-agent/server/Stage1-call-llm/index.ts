import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// stream
export async function stage1() {
  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpfull assistant.",
      },
      { role: "user", content: "Tell me about yourself" },
    ],
    model: "openai/gpt-oss-20b",
  });

  process.stdout.write(response.choices[0]?.message.content || "");
}
