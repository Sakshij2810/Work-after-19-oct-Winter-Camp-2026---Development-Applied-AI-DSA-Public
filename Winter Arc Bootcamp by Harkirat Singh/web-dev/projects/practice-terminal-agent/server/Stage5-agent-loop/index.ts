import Groq from "groq-sdk";
import { promisify } from "node:util";
import { exec } from "node:child_process";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function stage5() {
  const maxTurns = 10;
  let turnNumber = 0;

  while (turnNumber < maxTurns) {
    const stream = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      stream: true,
      messages,
      tools,
      tool_choice: "auto",
    });

    let collectedContent = "";
    let finishReason = "";

    // These are fragments of one tool call, not two complete tool calls. You need to reconstruct them using their index.

    const toolCallsByIndex = new Map<
      number,
      {
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }
    >();

    /* 
    Chunk 1: id = call_123, name = get_weather, arguments = {"ci
    Chunk 2: arguments = ty":"Pune"}
*/
    for await (const chunk of stream) {
      const choice = chunk.choices[0];

      // 1. if its content
      if (choice?.delta.content) {
        collectedContent += choice.delta.content;
      }

      // 2. if its a tool call
      if (choice?.delta.tool_calls) {
        // const toolCalls = choice?.delta.tool_calls;
        // collectedToolCalls.push(...toolCalls);

        for (const delta of choice.delta.tool_calls) {
          const existing = toolCallsByIndex.get(delta.index) ?? {
            id: "",
            type: "function" as const,
            function: { name: "", arguments: "" },
          };

          if (delta.id) existing.id = delta.id;
          if (delta.function?.name)
            existing.function.name += delta.function.name;
          if (delta.function?.arguments)
            existing.function.arguments += delta.function.arguments;

          toolCallsByIndex.set(delta.index, existing);
        }
      }

      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }
    }

    const collectedToolCalls: Groq.Chat.ChatCompletionMessageToolCall[] =
      Array.from(toolCallsByIndex.values()).map((toolCall) => {
        if (!toolCall.id || !toolCall.function.name) {
          throw new Error(`Incomplete streamed tool call`);
        }

        return toolCall;
      });

    messages.push({
      role: "assistant",
      content: collectedContent,
      ...(collectedToolCalls.length > 0
        ? { tool_calls: collectedToolCalls }
        : {}),
    });

    // check for any other tool calls
    if (collectedToolCalls.length > 0 && finishReason === "tool_calls") {
      console.log(
        `Turn ${turnNumber + 1} of ${maxTurns}: Executing tool calls`,
      );
      const toolResults = await executeToolCalls(collectedToolCalls);
      messages.push(...toolResults);
      turnNumber++;
      continue;
    } else if (collectedToolCalls.length === 0 && finishReason === "stop") {
      console.log(`Turn ${turnNumber + 1} of ${maxTurns}: Finished`);
      console.log(collectedContent);
      return;
    } else {
      console.log(
        `Turn ${
          turnNumber + 1
        } of ${maxTurns}: Unknown finish reason: ${finishReason}`,
      );
      return;
    }
  }

  console.log(`Turn ${turnNumber + 1} of ${maxTurns}: Exhausted all turns`);
}

// ---------- helpers

const messages: Groq.Chat.ChatCompletionMessageParam[] = [
  { role: "system", content: "Your are usefull assistant" },
  { role: "user", content: "What's the weather in Pune, Mumbai, Delhi" },
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

// TOOL CALLS EXECUTION
type ToolMessage = Groq.Chat.ChatCompletionToolMessageParam;

async function executeToolCalls(
  toolCalls: Groq.Chat.ChatCompletionMessageToolCall[],
): Promise<ToolMessage[]> {
  let results: ToolMessage[] = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    console.log(
      `Executing tool call: ${functionName} with arguments:`,
      functionArgs,
    );

    let functionResponse: unknown;

    switch (functionName) {
      case "get_weather":
        functionResponse = await getWeather(functionArgs.city);
        break;

      case "bash":
        functionResponse = await bashTool(functionArgs.command);
        break;

      default:
        throw new Error(`Unknown tool call: ${functionName}`);
    }

    results.push({
      role: "tool",
      content: JSON.stringify(functionResponse),
      tool_call_id: toolCall.id,
    });
  }

  return results;
}

// TOOLS FUNCTIONS

// getWeather
interface GeoData {
  results?: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }[];
}

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
  };
}
async function getWeather(city: string) {
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
}

// bashTool
const execAsync = promisify(exec);

async function bashTool(command: string) {
  console.log(`$ running command: ${command}`);

  try {
    const result = await execAsync(command, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024,
      timeout: 30_000,
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
}
