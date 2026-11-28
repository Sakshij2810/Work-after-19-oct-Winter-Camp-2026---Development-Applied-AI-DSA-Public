import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main() {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant. Use the available tools when they are needed to answer the user's question.",
    },
    {
      role: "user",
      content: "Tell me who is Sakshi Kalyan Jadhav.",
    },
  ];

  const tools = [
    // tool schema / defination
    // get-weather
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "",
        parameters: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "",
            },
          },
          required: ["city"],
        },
      },
    },

    // bash
    {
      type: "function",
      function: {
        name: "bash",
        description: "",
        parameters: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "",
            },
          },
          required: ["command"],
        },
      },
    },
  ];

  // ---------------------------------------- STEP 1 (STREAM): Send user message and available tool definitions to LLM ----------------------------------------
  const stream = await client.chat.completions.create({
    messages,
    model: "openai/gpt-oss-20b",
    stream: true,
    tools,
    tool_choice: "auto",
  });

  for await (const chunk of stream) {
    const toolCalls = chunk.choices[0]?.delta.tool_calls;

    if (toolCalls) {
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function?.name;
        const functionArguments = toolCall.function?.arguments;

        if (functionName !== "get_weather" && functionName !== "bash") {
          throw new Error("Tool call doesnt exits");
        }

        if (
          toolCall.id &&
          functionArguments &&
          toolCall.function?.name === "get_weather"
        ) {
          const weatherResponse = getWeather(functionArguments);
          messages.push({
            role: "tool",
            content: weatherResponse,
            tool_call_id: toolCall.id,
          });
        } else if (
          toolCall.id &&
          functionArguments &&
          toolCall.function?.name === "bash"
        ) {
          const bashResponse = bash(functionArguments);
          messages.push({
            role: "tool",
            content: bashResponse,
            tool_call_id: toolCall.id,
          });
        }
      }
    }

    const content = chunk.choices[0]?.delta.content;
    messages.push({ role: "assistant", content });
    process.stdout.write(content || "");
  }

  // ---------------------------------------- 2.TOOLS ----------------------------------------

  //  getWeather Tool
  function getWeather(city: string) {
    return `${city} temp: 34.5`;
  }

  //  bash Tool
  function bash(command: string) {
    return "ls";
  }
}
