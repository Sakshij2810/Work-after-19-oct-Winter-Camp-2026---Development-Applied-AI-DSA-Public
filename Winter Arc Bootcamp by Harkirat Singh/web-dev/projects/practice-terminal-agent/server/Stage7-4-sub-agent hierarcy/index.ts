import Groq from "groq-sdk";
import { promisify } from "node:util";
import { exec } from "node:child_process";

// types
type ChatMessage = Groq.Chat.ChatCompletionMessageParam;
type ToolMessage = Groq.Chat.ChatCompletionToolMessageParam;
type ToolCall = Groq.Chat.ChatCompletionMessageToolCall;

const MAX_AGENT_DEPTH = 4;

// STEP 1: Call LLM
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// stage 7 : stream + tool calling + agent loop + 4 sub-agent hierarcy
export async function stage7() {
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
      const toolResults = await executeToolCalls(collectedToolCalls, 1);
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
You are the root parent agent at Level 1.

You must delegate the user's task to a sub-agent.
Do not perform the task yourself.
Return the final result received from your sub-agent.
    `.trim(),
  },
  {
    role: "user",
    content: `
We need to check the current weather in Pune.

Create the following delegation chain:

1. You (Level 1) delegate to a Level 2 sub-agent.
2. Level 2 must delegate to a Level 3 sub-agent.
3. Level 3 must delegate to a Level 4 sub-agent.
4. Level 4 must call get_weather for Pune.

Each agent must wait for its child to finish and return the result to its own parent.

Do not skip any level.
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

// const subAgentTools = tools.slice(0, 2); // The child should access get_weather and bash, but it should not be able to delegate to another sub-agent yet. That's Stage 7.
const subAgentTools = tools;

// TOOL CALLS EXECUTION

async function executeToolCalls(
  toolCalls: ToolCall[],
  currentDepth: number,
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

      case "delegate_to_sub_agent":
        if (currentDepth >= MAX_AGENT_DEPTH) {
          functionResponse =
            "Maximum agent depth reached. Cannot delegate further.";
          break;
        }

        functionResponse = await runSubAgent(
          functionArgs.task,
          currentDepth + 1,
        );

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
async function runSubAgent(task: string, currentDepth: number) {
  console.log(`\n🤖 Sub-Agent started at Level ${currentDepth}`);
  console.log("Assigned task:", task);

  const maxTurns = 10;
  let turnCounter = 0;

  const subAgentMessages: ChatMessage[] = [
    {
      role: "system",
      content: `
You are an autonomous sub-agent operating at Level ${currentDepth}.

Your responsibilities:
1. Understand the task assigned by your parent.
2. Use available tools to complete your task.
3. If the task can be broken into independent subtasks, delegate them using delegate_to_sub_agent.
4. If delegation is unnecessary, execute the task yourself using available tools.
5. Never delegate beyond Level 4.
6. Return your findings to your parent agent.
7. Do not invent results.
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

      const toolResults = await executeSubAgentToolCalls(
        collectedToolCalls,
        currentDepth,
      );
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
  currentDepth: number,
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

      case "delegate_to_sub_agent":
        if (currentDepth >= MAX_AGENT_DEPTH) {
          functionResponse =
            "Maximum agent depth reached. Cannot delegate further.";
          break;
        }

        functionResponse = await runSubAgent(
          functionArgs.task,
          currentDepth + 1,
        );
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
