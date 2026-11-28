// custom types

import type Groq from "groq-sdk";

export interface GeoData {
  results?: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }[];
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
  };
}

// streaming tool-call accumulator

export type AssistantMessage = Extract<
  Groq.Chat.ChatCompletionMessageParam,
  { role: "assistant" }
>;

export type CompleteToolCall = NonNullable<
  AssistantMessage["tool_calls"]
>[number];

export type ToolMessage = Extract<
  Groq.Chat.ChatCompletionMessageParam,
  { role: "tool" }
>;

export interface AccumulatedToolCall {
  index: number;
  id?: string;
  function: {
    name: string;
    arguments: string;
  };
}
