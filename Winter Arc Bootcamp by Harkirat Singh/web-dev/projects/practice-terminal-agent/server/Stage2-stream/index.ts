import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// stream
export async function stage2() {
  const stream = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpfull assistant.",
      },
      { role: "user", content: "Tell me about yourself" },
    ],
    model: "openai/gpt-oss-20b",
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta.content || "");
  }
}
