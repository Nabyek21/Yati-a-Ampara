/**
 * Anthropic Provider para Agente IA
 * Integración con Claude (Claude 3 Sonnet, Opus, Haiku)
 */

export class AnthropicProvider {
  constructor(apiKey, model = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.apiVersion = '2024-06-01';
    this.maxRetries = 3;
  }

  /**
   * Realizar chat con Anthropic
   */
  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1500,
      system = null,
    } = options;

    const payload = {
      model: this.model,
      messages,
      max_tokens: maxTokens,
      temperature,
    };

    if (system) {
      payload.system = system;
    }

    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Anthropic Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          text: data.content[0].text,
          model: this.model,
          usage: {
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens,
          },
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries - 1) {
          await this.delay(1000 * Math.pow(2, attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Anthropic service unavailable',
    };
  }

  /**
   * Generar texto completamente
   */
  async generateText(prompt, options = {}) {
    const messages = [{ role: 'user', content: prompt }];
    return this.chat(messages, options);
  }

  /**
   * Chat con historial de conversación
   */
  async chatWithHistory(userMessage, history = [], systemPrompt = null, options = {}) {
    const messages = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    // Limitar historial
    if (messages.length > 20) {
      const sliced = messages.slice(-20);
      return this.chat(sliced, { ...options, system: systemPrompt });
    }

    return this.chat(messages, { ...options, system: systemPrompt });
  }

  /**
   * Utilidad: esperar N ms
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default AnthropicProvider;
