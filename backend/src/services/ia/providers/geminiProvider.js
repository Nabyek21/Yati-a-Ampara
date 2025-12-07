/**
 * Google Gemini Provider para Agente IA
 * Integración con Gemini Pro y Gemini Pro Vision
 */

export class GeminiProvider {
  constructor(apiKey, model = 'gemini-pro') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.maxRetries = 3;
  }

  /**
   * Realizar chat con Gemini
   */
  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      maxOutputTokens = 1500,
      topP = 1,
      topK = 1,
    } = options;

    // Convertir formato OpenAI a Gemini
    const contents = this.convertMessagesToGemini(messages);

    const payload = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP,
        topK,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
      ],
    };

    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(
          `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Gemini Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No content generated from Gemini');
        }

        const text = data.candidates[0].content.parts
          .map(part => part.text)
          .join('');

        return {
          success: true,
          text,
          model: this.model,
          usage: {
            inputTokens: data.usageMetadata?.promptTokenCount || 0,
            outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
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
      error: lastError?.message || 'Gemini service unavailable',
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

    // Limitar historial
    if (messages.length > 20) {
      const sliced = messages.slice(-20);
      return this.chat(sliced, options);
    }

    return this.chat(messages, options);
  }

  /**
   * Convertir formato OpenAI/Anthropic a formato Gemini
   */
  convertMessagesToGemini(messages) {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: msg.content,
        },
      ],
    }));
  }

  /**
   * Utilidad: esperar N ms
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GeminiProvider;
