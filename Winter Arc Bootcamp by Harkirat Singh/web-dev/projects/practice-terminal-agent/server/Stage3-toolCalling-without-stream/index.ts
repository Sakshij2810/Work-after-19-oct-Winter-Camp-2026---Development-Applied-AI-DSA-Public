import Groq from "groq-sdk";
import { exec } from "node:child_process";
import { promisify } from "node:util";

// -------------------------------- STAGE 2 : [Tool Calling] --------------------------------

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function stage3() {
  console.log("Sending request to the Groq...");
  const startTime = Date.now();
  // -------------------- START --------------------

  // STEP 1: First LLM request
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages,
    tools,
    tool_choice: "auto",
  });

  // STEP 2: Check whether LLM wants to call a tool
  const responseMessage = response.choices[0]?.message;

  if (!responseMessage) {
    console.log("LLM didnt provide any response.");
    return;
  }

  // if there is responseMessage append it to message
  console.log(
    "1st responseMessage pushing to messages.................................................................",
    responseMessage,
  );
  messages.push(responseMessage);

  const toolCalls = responseMessage.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    console.log(responseMessage.content);
    return;
  }

  console.log("Number of tool calls :", toolCalls.length);

  // Execute EVERY requested tool call
  for (const toolCall of toolCalls) {
    // --------------------------------- doubt: why we throw error and not return it
    if (toolCall.type !== "function") {
      throw new Error("Unsupported tool type: ", toolCall.type);
    }

    const functionName = toolCall.function.name;
    const functionArguments = JSON.parse(toolCall.function.arguments) as {
      city?: string;
      command?: string;
      timeout?: number;
    };

    // STEP 3: Backend executes the requested tool: keep appending all toolResults
    let toolResult: unknown;

    if (functionName === "get_weather") {
      if (typeof functionArguments.city !== "string") {
        throw new Error("City argument is missing or invalid");
      }
      toolResult = await getWeather(functionArguments.city);
    } else if (functionName === "bashTool") {
      if (typeof functionArguments.command !== "string") {
        throw new Error("Invalid bash command");
      }
      toolResult = await bashTool(functionArguments.command);
    } else {
      throw new Error(`Unknown tool: ${functionName}`);
    }

    // STEP 4: Add tool result to conversation history

    console.log(
      "Tool result pushing to messages...............................................",
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      },
    );

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(toolResult),
    });
  }

  // STEP 5: Send conversation history back to LLM
  const finalResponse = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages,
    tools,
    tool_choice: "auto",
  });

  console.log(
    "finalResponse............................................................",
    finalResponse,
  );

  // STEP 6: Print final response
  const finalMessage = finalResponse.choices[0]?.message;

  console.log("\nSecond response message:");
  console.log(JSON.stringify(finalMessage, null, 2));

  console.log("\nContent:", finalMessage?.content);
  console.log("\nTool calls:", finalMessage?.tool_calls);

  // -------------------- END --------------------
  console.log(
    `Time taken by Groq: ${(Date.now() - startTime) / 1000} seconds.`,
  );
}

// -------------------------------- HELPERS --------------------------------

const messages: Groq.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant. Use the available tools when they are needed to answer the user's question.",
  },
  { role: "user", content: "Whats the weather in Pune, Mumbai, Delhi." },
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

// TOOLS FUNCTIONS

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
export async function getWeather(city: string) {
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
