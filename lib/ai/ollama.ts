import {
  AIProvider,
  GenerateTextOptions,
  GenerateTextResult,
} from "@/types/ai";
import {
  DEFAULT_OLLAMA_BASE_URL,
  DEFAULT_AI_MODEL,
  AI_TIMEOUT_MS,
} from "@/lib/constants/ai";

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;
  private verifiedModel: string | null = null;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
    this.model = process.env.AI_MODEL || DEFAULT_AI_MODEL;
  }

  getModelName(): string {
    return this.verifiedModel || this.model;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(AI_TIMEOUT_MS.TAGS_FETCH),
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

    const exact = available.find(
      (m) =>
        m === this.model ||
        m.startsWith(`${this.model}:`) ||
        this.model.startsWith(m)
    );
    if (exact) {
      this.verifiedModel = exact;
      return exact;
    }

    const gemma = available.find((m) => m.toLowerCase().includes("gemma"));
    if (gemma) {
      this.verifiedModel = gemma;
      return gemma;
    }

    this.verifiedModel = available[0];
    return available[0];
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(AI_TIMEOUT_MS.HEALTH_CHECK),
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
      signal: AbortSignal.timeout(AI_TIMEOUT_MS.TEXT_GENERATION),
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
      signal: AbortSignal.timeout(AI_TIMEOUT_MS.EMBEDDING),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding || [];
  }
}
