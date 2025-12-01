import Groq from 'groq-sdk'
import { AICallConfig, AIResponse, AIStreamChunk } from '@/types/providers'

export class GroqMultiClient {
  private client: Groq

  constructor(apiKey?: string) {
    this.client = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
    })
  }

  /**
   * Gera uma resposta completa (não streaming)
   */
  async generateContent(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<AICallConfig>
  ): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: config?.model || 'llama-3.3-70b-versatile',
        messages: messages.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 4096,
        top_p: config?.topP ?? 0.9,
        stream: false,
      })

      const choice = completion.choices[0]

      return {
        content: choice.message.content || '',
        finishReason: choice.finish_reason || 'stop',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      }
    } catch (error: any) {
      console.error('Erro ao chamar Groq:', error)
      throw new Error(`Groq API Error: ${error.message}`)
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
      const stream = await this.client.chat.completions.create({
        model: config?.model || 'llama-3.3-70b-versatile',
        messages: messages.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 4096,
        top_p: config?.topP ?? 0.9,
        stream: true,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        const done = chunk.choices[0]?.finish_reason !== null

        yield {
          content,
          done,
        }
      }

      yield {
        content: '',
        done: true,
      }
    } catch (error: any) {
      console.error('Erro ao fazer streaming com Groq:', error)
      throw new Error(`Groq Stream Error: ${error.message}`)
    }
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Responda apenas: OK' }],
        max_tokens: 10,
      })

      const resposta = completion.choices[0]?.message?.content || ''

      return {
        success: true,
        message: `Conexão estabelecida com sucesso. Resposta: ${resposta}`,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Erro ao conectar com Groq',
      }
    }
  }
}

/**
 * Factory function para criar cliente Groq
 */
export function createGroqClient(apiKey?: string): GroqMultiClient {
  return new GroqMultiClient(apiKey)
}
