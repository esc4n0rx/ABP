import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { AICallConfig, AIResponse, AIStreamChunk } from '@/types/providers'

export class GeminiClient {
  private client: GoogleGenerativeAI
  private model: GenerativeModel

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash-exp') {
    this.client = new GoogleGenerativeAI(apiKey)
    this.model = this.client.getGenerativeModel({ model: modelName })
  }

  /**
   * Gera uma resposta completa (não streaming)
   */
  async generateContent(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<AICallConfig>
  ): Promise<AIResponse> {
    try {
      // Converte mensagens para o formato do Gemini
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

      const lastMessage = messages[messages.length - 1].content

      const chat = this.model.startChat({
        history,
        generationConfig: {
          temperature: config?.temperature ?? 0.7,
          maxOutputTokens: config?.maxTokens ?? 4096,
          topP: config?.topP ?? 0.9,
        },
      })

      const result = await chat.sendMessage(lastMessage)
      const response = result.response
      const text = response.text()

      return {
        content: text,
        finishReason: response.candidates?.[0]?.finishReason || 'stop',
        usage: {
          promptTokens: 0, // Gemini não retorna uso de tokens por padrão
          completionTokens: 0,
          totalTokens: 0,
        },
      }
    } catch (error: any) {
      console.error('Erro ao chamar Gemini:', error)
      throw new Error(`Gemini API Error: ${error.message}`)
    }
  }

  /**
   * Gera uma resposta com streaming
   */
  async *generateContentStream(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<AICallConfig>
  ): AsyncGenerator<AIStreamChunk> {
    try {
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

      const lastMessage = messages[messages.length - 1].content

      const chat = this.model.startChat({
        history,
        generationConfig: {
          temperature: config?.temperature ?? 0.7,
          maxOutputTokens: config?.maxTokens ?? 4096,
          topP: config?.topP ?? 0.9,
        },
      })

      const result = await chat.sendMessageStream(lastMessage)

      for await (const chunk of result.stream) {
        const text = chunk.text()
        yield {
          content: text,
          done: false,
        }
      }

      yield {
        content: '',
        done: true,
      }
    } catch (error: any) {
      console.error('Erro ao fazer streaming com Gemini:', error)
      throw new Error(`Gemini Stream Error: ${error.message}`)
    }
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.model.generateContent('Responda apenas: OK')
      const text = result.response.text()

      return {
        success: true,
        message: `Conexão estabelecida com sucesso. Resposta: ${text}`,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Erro ao conectar com Gemini',
      }
    }
  }
}

/**
 * Factory function para criar cliente Gemini
 */
export function createGeminiClient(apiKey: string, modelName?: string): GeminiClient {
  return new GeminiClient(apiKey, modelName)
}
