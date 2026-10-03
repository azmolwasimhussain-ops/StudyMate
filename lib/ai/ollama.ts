/**
 * Ollama AI Provider
 * Connects to local Ollama server running open-weight models (Gemma, Llama, Qwen, etc.)
 */

import {
  AIProvider,
  AIMessage,
  GenerateTextOptions,
  GenerateTextResult,
} from "./provider";

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;
  private verifiedModel: string | null = null;

  constructor() {
    this.baseUrl =
      process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    this.model =
      process.env.AI_MODEL || "gemma2:2b";
  }

  getModelName(): string {
    return this.verifiedModel || this.model;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.models || []).map((m: { name: string }) => m.name);
    } catch {
      return [];
    }
  }

  async resolveActiveModel(): Promise<string> {
    if (this.verifiedModel) return this.verifiedModel;
    const available = await this.getAvailableModels();
    if (available.length === 0) return this.model;

    // Check preferred configured model
    const exact = available.find(
      (m) => m === this.model || m.startsWith(`${this.model}:`) || this.model.startsWith(m)
    );
    if (exact) {
      this.verifiedModel = exact;
      return exact;
    }

    // Prefer gemma if available
    const gemma = available.find((m) => m.toLowerCase().includes("gemma"));
    if (gemma) {
      this.verifiedModel = gemma;
      return gemma;
    }

    // Otherwise use first available model
    this.verifiedModel = available[0];
    return available[0];
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
    const { messages, temperature = 0.7 } = options;
    const activeModel = await this.resolveActiveModel();

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: activeModel,
        messages,
        stream: false,
        options: {
          temperature,
          num_predict: options.maxTokens || 2048,
        },
      }),
      signal: AbortSignal.timeout(120000), // 2 minute timeout for local inference
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${error}`);
    }

    const data = await response.json();

    return {
      content: data.message?.content || "",
      model: data.model || activeModel,
      usage: {
        promptTokens: data.prompt_eval_count,
        completionTokens: data.eval_count,
      },
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const activeModel = await this.resolveActiveModel();
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: activeModel,
        prompt: text,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding || [];
  }
}
