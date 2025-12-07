/**
 * Índice de Providers de IA
 * Exporta todos los providers disponibles
 */

import OpenAIProvider from './openaiProvider.js';
import AnthropicProvider from './anthropicProvider.js';
import GeminiProvider from './geminiProvider.js';

export {
  OpenAIProvider,
  AnthropicProvider,
  GeminiProvider,
};

/**
 * Factory para crear provider basado en nombre
 */
export function createProvider(providerName, apiKey, model) {
  const providers = {
    openai: OpenAIProvider,
    anthropic: AnthropicProvider,
    claude: AnthropicProvider, // alias
    gemini: GeminiProvider,
    google: GeminiProvider, // alias
  };

  const ProviderClass = providers[providerName.toLowerCase()];

  if (!ProviderClass) {
    throw new Error(
      `Unknown provider: ${providerName}. Available: ${Object.keys(providers).join(', ')}`
    );
  }

  return new ProviderClass(apiKey, model);
}

export default {
  createProvider,
  OpenAIProvider,
  AnthropicProvider,
  GeminiProvider,
};
