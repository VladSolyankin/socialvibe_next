import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";
import {
  experimental_buildLlama2Prompt,
  experimental_buildOpenAssistantPrompt,
} from "ai/prompts";

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.NEXT_PUBLIC_HF_TOKEN);

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  const response = Hf.textGenerationStream({
    model: "meta-llama/Meta-Llama-3-8B-Instruct",
    inputs: experimental_buildOpenAssistantPrompt(messages),
    parameters: {
      max_new_tokens: 200,
      // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
      typical_p: 0.2,
      repetition_penalty: 1,
      truncate: 1000,
      return_full_text: false,
    },
  });

  // Convert the response into a friendly text-stream
  const stream = HuggingFaceStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
