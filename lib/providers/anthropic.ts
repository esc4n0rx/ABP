import Anthropic from '@anthropic-ai/sdk'
import { AICallConfig, AIResponse, AIStreamChunk } from '@/types/providers'

export class AnthropicClient {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
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
      // Anthropic requer system message separado
      const systemMessage = messages.find((m) => m.role === 'system')
      const conversationMessages = messages
        .filter((m) => m.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      const response = await this.client.messages.create({
        model: config?.model || 'claude-sonnet-4-5-20250929',
        max_tokens: config?.maxTokens ?? 4096,
        temperature: config?.temperature ?? 0.7,
        top_p: config?.topP ?? 0.9,
        system: systemMessage?.content,
        messages: conversationMessages,
      })

      const content =
        response.content[0].type === 'text' ? response.content[0].text : ''

      return {
        content,
        finishReason: response.stop_reason || 'end_turn',
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      }
    } catch (error: any) {
      console.error('Erro ao chamar Anthropic:', error)
      throw new Error(`Anthropic API Error: ${error.message}`)
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
      const systemMessage = messages.find((m) => m.role === 'system')
      const conversationMessages = messages
        .filter((m) => m.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      const stream = await this.client.messages.create({
        model: config?.model || 'claude-sonnet-4-5-20250929',
        max_tokens: config?.maxTokens ?? 4096,
        temperature: config?.temperature ?? 0.7,
        top_p: config?.topP ?? 0.9,
        system: systemMessage?.content,
        messages: conversationMessages,
        stream: true,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield {
              content: event.delta.text,
              done: false,
            }
          }
        } else if (event.type === 'message_stop') {
          yield {
            content: '',
            done: true,
          }
        }
      }
    } catch (error: any) {
      console.error('Erro ao fazer streaming com Anthropic:', error)
      throw new Error(`Anthropic Stream Error: ${error.message}`)
    }
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Responda apenas: OK' }],
      })

      const content =
        response.content[0].type === 'text' ? response.content[0].text : ''

      return {
        success: true,
        message: `Conexão estabelecida com sucesso. Resposta: ${content}`,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Erro ao conectar com Anthropic',
      }
    }
  }
}

/**
 * Factory function para criar cliente Anthropic
 */
export function createAnthropicClient(apiKey: string): AnthropicClient {
  return new AnthropicClient(apiKey)
}
