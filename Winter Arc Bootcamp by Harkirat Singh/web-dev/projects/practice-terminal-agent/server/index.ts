import { main as groq } from "./src/provider/groq";
import { stage1 } from "./Stage1-call-llm";
import { stage2 } from "./Stage2-stream";
import { stage3 } from "./Stage3-toolCalling-without-stream";
import { stage4 } from "./Stage4-toolCalling-with-stream";
import { stage5 } from "./Stage5-agent-loop";

// groq();

// stage1(); // 1. stage: call callLLM
// stage2(); // 2. stage: stream output
// stage3(); // 3. stage: tool calling without stream
// stage4(); // 4. stage: tool calling with stream
stage5(); // 5. stage: stream + tool calling + agent loop
