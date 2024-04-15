"use client";

import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";
import {
  experimental_buildAnthropicMessages,
  experimental_buildAnthropicPrompt,
  experimental_buildLlama2Prompt,
  experimental_buildOpenAIMessages,
  experimental_buildOpenAssistantPrompt,
  experimental_buildStarChatBetaPrompt,
} from "ai/prompts";
import { useEffect } from "react";

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.NEXT_PUBLIC_HF_TOKEN);

export default function TestPage() {
  useEffect(() => {
    async function main() {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant." }],
        model: "gpt-3.5-turbo",
      });

      console.log(completion.choices[0]);
    }
  }, []);

  return <div>test</div>;
}
