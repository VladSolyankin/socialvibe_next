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
    query();
  }, []);

  async function query(
    data = {
      inputs: "Hi, how are you?",
    }
  ) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
      {
        headers: {
          Authorization: "Bearer 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",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    console.log(result);
    return result;
  }

  return <div>test</div>;
}
