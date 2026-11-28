import Groq from "groq-sdk";
import { promisify } from "node:util";
import { exec } from "node:child_process";

type ChatMessage = Groq.Chat.ChatCompletionMessageParam;
type ToolMessage = Groq.Chat.ChatCompletionToolMessageParam;
type ToolCall = Groq.Chat.ChatCompletionMessageToolCall;

// STEP 1: Call LLM
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// stage 6 : stream + tool calling + agent loop + sub-agent
export async function stage6() {
  const maxTurns = 10;
  let turnNumber = 0;

  // STEP 2: Agent Loop
  while (turnNumber < maxTurns) {
    // STEP 3: Implement Stream

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

    const collectedToolCalls: ToolCall[] = Array.from(
      toolCallsByIndex.values(),
    ).map((toolCall) => {
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

const messages: ChatMessage[] = [
  {
    role: "system",
    content: `
You are a parent AI agent responsible for coordinating sub-agents.

When asked to delegate tasks:
1. You MUST use delegate_to_sub_agent.
2. Create a separate sub-agent for each city.
3. Each sub-agent must independently call get_weather exactly once for its assigned city.
4. Do not call get_weather yourself for delegated tasks.
5. Wait for all sub-agent results.
6. Once you receive all results, summarize the temperatures of all cities in a comparison table.
7. Do not invent or estimate weather information. Use only the returned tool results.
    `.trim(),
  },
  {
    role: "user",
    content: `
Use three separate sub-agents to check the current weather temperatures of these cities:

1. Pune
2. Mumbai
3. Delhi

Each sub-agent must:
- Handle only one assigned city.
- Call the get_weather tool for that city.
- Return the complete weather result to the parent agent.

After receiving all three results, compare their temperatures and present a summary table.
    `.trim(),
  },
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

  // delegate_to_sub_agent
  {
    type: "function",
    function: {
      name: "delegate_to_sub_agent",
      description:
        "Delegate an independent task to a sub-agent. The sub-agent will execute the task and return its findings.",
      parameters: {
        type: "object",
        properties: {
          task: {
            type: "string",
            description: "The specific task assigned to the sub-agent.",
          },
        },
        required: ["task"],
      },
    },
  },
];

const subAgentTools = tools.slice(0, 2); // The child should access get_weather and bash, but it should not be able to delegate to another sub-agent yet. That's Stage 7.

// TOOL CALLS EXECUTION

async function executeToolCalls(toolCalls: ToolCall[]): Promise<ToolMessage[]> {
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

      case "delegate_to_sub_agent":
        functionResponse = await runSubAgent(functionArgs.task);
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

// runSubAgent
async function runSubAgent(task: string) {
  console.log("\n🤖 Sub-Agent started");
  console.log("Assigned task:", task);

  const maxTurns = 10;
  let turnCounter = 0;

  const subAgentMessages: ChatMessage[] = [
    {
      role: "system",
      content: `
You are a weather research sub-agent.

You will receive a task for one city.
You MUST call the get_weather tool exactly once for that city.
Do not answer using your own knowledge.
Return the complete weather result received from the tool to the parent agent.
  `.trim(),
    },
    {
      role: "user",
      content: task,
    },
  ];

  while (turnCounter < maxTurns) {
    // sub-agent llm call
    const stream = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: subAgentMessages,
      tools: subAgentTools,
      tool_choice: "auto",
      stream: true,
    });

    let collectedContent = "";
    let finishReason = "";

    const toolCallIndexMap = new Map<
      number,
      {
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }
    >();

    for await (const chunk of stream) {
      const choice = chunk.choices[0];

      // 1. add content
      if (choice?.delta.content) {
        collectedContent += choice.delta.content;
      }

      // 2. add tool calls
      const toolCalls = choice?.delta.tool_calls;

      if (toolCalls) {
        for (const delta of toolCalls) {
          let existingToolCall = toolCallIndexMap.get(delta.index) ?? {
            id: "",
            type: "function" as const,
            function: { name: "", arguments: "" },
          };

          if (delta.id) existingToolCall.id = delta.id;
          if (delta.function?.name)
            existingToolCall.function.name += delta.function.name;
          if (delta.function?.arguments)
            existingToolCall.function.arguments += delta.function.arguments;

          toolCallIndexMap.set(delta.index, existingToolCall);
        }
      }

      // 3. add finish reason
      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }
    }

    // Convert reconstructed tool calls
    const collectedToolCalls: ToolCall[] = Array.from(
      toolCallIndexMap.values(),
    ).map((toolCall) => {
      if (!toolCall.id || !toolCall.function.name) {
        throw new Error("Incomplete sub-agent tool call");
      }

      return toolCall;
    });

    // Save child's assistant response
    subAgentMessages.push({
      role: "assistant",
      content: collectedContent,
      ...(collectedToolCalls.length > 0
        ? { tool_calls: collectedToolCalls }
        : {}),
    });

    if (collectedToolCalls.length > 0 && finishReason === "tool_calls") {
      console.log(`Sub-agent turn ${turnCounter + 1}: Executing tool calls`);

      const toolResults = await executeSubAgentToolCalls(collectedToolCalls);
      subAgentMessages.push(...toolResults);
      turnCounter++;
      continue;
    }

    // Child completed its task
    if (collectedToolCalls.length === 0 && finishReason === "stop") {
      console.log("🤖 Sub-Agent finished:", collectedContent);
      return collectedContent; // return this to parent
    }

    console.log("Sub-agent stopped:", finishReason);
    return `Sub-agent stopped unexpectedly: ${finishReason}`;
  }

  return "Sub-agent exhausted its maximum turns.";
}

// sub-agent helpers
async function executeSubAgentToolCalls(
  toolCalls: ToolCall[],
): Promise<ToolMessage[]> {
  let results: ToolMessage[] = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    let functionResponse;

    switch (functionName) {
      case "get_weather":
        functionResponse = await getWeather(functionArgs.city);
        break;

      case "bash":
        functionResponse = await bashTool(functionArgs.command);
        break;

      default: {
        throw new Error(`Unknown sub-agent tool: ${functionName}`);
      }
    }

    results.push({
      role: "tool",
      content: JSON.stringify(functionResponse),
      tool_call_id: toolCall.id,
    });
  }

  return results;
}
