// Step 1: Stream LLM Response

import Groq from "groq-sdk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type {
  AccumulatedToolCall,
  AssistantMessage,
  CompleteToolCall,
  GeoData,
  ToolMessage,
  WeatherData,
} from "./types";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function stage4() {
  // STEP 1: First LLM streaming request
  const stream = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages,
    tools,
    tool_choice: "auto",
    stream: true,
  });

  // STEP 2: Collect streamed response
  let collectedContent = "";
  const collectedToolCalls = new Map<number, AccumulatedToolCall>();
  let finishReason: string | null = null;

  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (!choice) continue;

    // Collect and display text
    if (choice.delta.content) {
      collectedContent += choice.delta.content;
      process.stdout.write(choice.delta.content);
    }

    // Collect streamed tool-call fragments
    for (const fragment of choice.delta.tool_calls ?? []) {
      let currentToolCall = collectedToolCalls.get(fragment.index);

      if (!currentToolCall) {
        currentToolCall = {
          index: fragment.index,
          function: {
            name: "",
            arguments: "",
          },
        };

        collectedToolCalls.set(fragment.index, currentToolCall);
      }

      if (fragment.id) {
        currentToolCall.id = fragment.id;
      }

      if (fragment.function?.name) {
        currentToolCall.function.name += fragment.function.name;
      }

      if (fragment.function?.arguments) {
        currentToolCall.function.arguments += fragment.function.arguments;
      }
    }

    if (choice.finish_reason) {
      finishReason = choice.finish_reason;
    }
  }

  // STEP 3: Reconstruct complete tool calls
  const completeToolCalls: CompleteToolCall[] = [];

  for (const accumulated of [...collectedToolCalls.values()].sort(
    (a, b) => a.index - b.index,
  )) {
    if (!accumulated.id || !accumulated.function.name) {
      throw new Error("Incomplete tool call received from the model");
    }

    completeToolCalls.push({
      id: accumulated.id,
      type: "function",
      function: {
        name: accumulated.function.name,
        arguments: accumulated.function.arguments,
      },
    });
  }

  // STEP 4: Add the complete assistant response to conversation history
  const assistantMessage: AssistantMessage = {
    role: "assistant",
    content: collectedContent || null,
    ...(completeToolCalls.length > 0 ? { tool_calls: completeToolCalls } : {}),
  };

  messages.push(assistantMessage);

  // STEP 5: Handle the first response
  if (finishReason === "stop" && completeToolCalls.length === 0) {
    console.log("\n");
    return;
  }

  if (finishReason !== "tool_calls" || completeToolCalls.length === 0) {
    console.log("\nUnexpected finish reason:", finishReason);
    return;
  }

  // STEP 6: Execute tool calls and append results
  console.log("\n\nExecuting tool calls...");

  const results = await executeToolCalls(completeToolCalls);

  messages.push(...results);

  console.log("\nTool results:", results);

  // STEP 7: Second LLM streaming request
  const secondStream = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages,
    tools,
    tool_choice: "auto",
    stream: true,
  });

  // STEP 8: Stream the second response
  let secondResponseContent = "";
  let secondFinishReason: string | null = null;

  for await (const chunk of secondStream) {
    const choice = chunk.choices[0];
    if (!choice) continue;

    if (choice.delta.content) {
      secondResponseContent += choice.delta.content;
      process.stdout.write(choice.delta.content);
    }

    if (choice.finish_reason) {
      secondFinishReason = choice.finish_reason;
    }
  }

  console.log("\n\nSecond response finish reason:", secondFinishReason);
  console.log("Second response content:", secondResponseContent);
}

// -------------------------------- HELPERS --------------------------------

/*
========================================
Messages & Tool Definitions
========================================
*/

const messages: Groq.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant. Use the available tools when they are needed to answer the user's question.",
  },
  //   { role: "user", content: "Whats the weather in Pune, Mumbai, Delhi." },
  { role: "user", content: "Tell me who are you" },
];
const tools = [
  // get_weather
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get weather of the City.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "Name of the City.",
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
      description:
        "This is a bash tool, you can use it for file operations such as read, write, search in file.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description:
              "This is the command which bash tool will perform for you.",
          },
        },
        required: ["command"],
      },
    },
  },
];

/*
========================================
Tool Functions
========================================
*/

const getWeather = async (city: string) => {
  console.log(`getWeather started for ${city}`);
  // Step 1: Get latitude and longitude of the city
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
  );

  if (!geoResponse.ok) {
    throw new Error("Failed to fetch city coordinates");
  }

  const geoData = (await geoResponse.json()) as GeoData;

  const location = geoData.results?.[0];

  if (!location) {
    throw new Error(`City not found: ${city}`);
  }

  const { latitude, longitude, name, country } = location;

  // Step 2: Get current weather using coordinates
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`,
  );

  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather");
  }

  const weatherData = (await weatherResponse.json()) as WeatherData;

  // Step 3: Return useful weather information
  return {
    city: name,
    country,
    temperature: weatherData.current.temperature_2m,
    humidity: weatherData.current.relative_humidity_2m,
    feelsLike: weatherData.current.apparent_temperature,
    windSpeed: weatherData.current.wind_speed_10m,
    weatherCode: weatherData.current.weather_code,
    time: weatherData.current.time,
  };
};

const execAsync = promisify(exec);

const bashTool = async (command: string) => {
  console.log(`$ running command: ${command}`);

  try {
    const result = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 30_000,
      maxBuffer: 1024 * 1024,
    });

    return {
      exitCode: 0,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: String(error),
    };
  }
};

/*
========================================
Tool Execution
========================================
*/

type ToolArguments = Record<string, unknown>;

type ToolHandler = (args: ToolArguments) => Promise<unknown>;

const toolCallMap: Record<string, ToolHandler> = {
  get_weather: async (args) => {
    if (typeof args.city !== "string") {
      throw new Error("Invalid city argument");
    }

    return getWeather(args.city);
  },

  bash: async (args) => {
    if (typeof args.command !== "string") {
      throw new Error("Invalid bash command");
    }

    return bashTool(args.command);
  },
};

async function executeToolCalls(
  toolCalls: CompleteToolCall[],
): Promise<ToolMessage[]> {
  const results: ToolMessage[] = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;

    const functionArgs = JSON.parse(
      toolCall.function.arguments,
    ) as ToolArguments;

    console.log(`Executing tool call: ${functionName}`, functionArgs);

    const functionToCall = toolCallMap[functionName];

    if (!functionToCall) {
      throw new Error(`Unknown tool call: ${functionName}`);
    }

    const functionResponse = await functionToCall(functionArgs);

    results.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content:
        typeof functionResponse === "string"
          ? functionResponse
          : (JSON.stringify(functionResponse) ?? String(functionResponse)),
    });
  }

  return results;
}
