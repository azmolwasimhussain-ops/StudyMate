import { OllamaProvider } from "./ollama";
import { AIProvider } from "@/types/ai";
import { DEFAULT_AI_PROVIDER, DEFAULT_AI_MODEL } from "@/lib/constants/ai";

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) {
    const providerType = process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER;
    switch (providerType) {
      case "ollama":
      default:
        _provider = new OllamaProvider();
        break;
    }
  }
  return _provider;
}

export async function checkAIAvailability(): Promise<{
  available: boolean;
  provider: string;
  model: string;
}> {
  const provider = getAIProvider();
  const available = await provider.isAvailable();
  return {
    available,
    provider: process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER,
    model: provider.getModelName() || (process.env.AI_MODEL || DEFAULT_AI_MODEL),
  };
}
