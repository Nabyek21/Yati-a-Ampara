/**
 * OpenAI Provider para Agente IA
 * Integración con GPT-3.5-turbo y GPT-4
 */

export class OpenAIProvider {
  constructor(apiKey, model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://api.openai.com/v1';
    this.maxRetries = 3;
  }

  /**
   * Realizar chat con OpenAI
   */
  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1500,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
    } = options;

    const payload = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
    };

    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`OpenAI Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          text: data.choices[0].message.content,
          model: this.model,
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          },
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries - 1) {
          // Esperar antes de reintentar (backoff exponencial)
          await this.delay(1000 * Math.pow(2, attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'OpenAI service unavailable',
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
  async chatWithHistory(userMessage, history = [], options = {}) {
    const messages = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    // Limitar historial a últimas 10 mensajes para evitar contexto muy largo
    if (messages.length > 20) {
      const sliced = messages.slice(-20);
      return this.chat(sliced, options);
    }

    return this.chat(messages, options);
  }

  /**
   * Utilidad: esperar N ms
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default OpenAIProvider;
