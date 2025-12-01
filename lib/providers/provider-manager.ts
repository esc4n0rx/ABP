import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProviderName, AIProvider, AICallConfig, AIResponse, AIStreamChunk } from '@/types/providers'
import { GroqMultiClient, createGroqClient } from './groq-multi'
import { GeminiClient, createGeminiClient } from './gemini'
import { OpenAIClient, createOpenAIClient } from './openai'
import { AnthropicClient, createAnthropicClient } from './anthropic'

type AIClient = GroqMultiClient | GeminiClient | OpenAIClient | AnthropicClient

/**
 * Gerenciador centralizado de providers de IA
 * Responsável por selecionar e utilizar o provider configurado pelo usuário
 */
export class ProviderManager {
  private userId: string
  private provider: AIProvider | null = null
  private client: AIClient | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Inicializa o provider padrão do usuário
   */
  async initialize(): Promise<void> {
    const supabase = await createServerSupabaseClient()

    // Busca o provider padrão do usuário
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_default', true)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      // Se não há provider configurado, usa Groq como padrão (free)
      console.log('Nenhum provider configurado, usando Groq padrão')
      this.provider = {
        id: 'default',
        user_id: this.userId,
        provider_name: 'groq',
        api_key: '',
        is_active: true,
        is_default: true,
        model_name: 'llama-3.3-70b-versatile',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      this.client = createGroqClient()
      return
    }

    this.provider = data
    this.client = this.createClient(data)
  }

  /**
   * Cria um cliente baseado nas configurações do provider
   */
  private createClient(provider: AIProvider): AIClient {
    switch (provider.provider_name) {
      case 'groq':
        return createGroqClient(provider.api_key || undefined)
      case 'gemini':
        return createGeminiClient(provider.api_key, provider.model_name)
      case 'openai':
        return createOpenAIClient(provider.api_key)
      case 'anthropic':
        return createAnthropicClient(provider.api_key)
      default:
        throw new Error(`Provider não suportado: ${provider.provider_name}`)
    }
  }

  /**
   * Gera conteúdo usando o provider configurado
   */
  async generateContent(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<AICallConfig>
  ): Promise<AIResponse> {
    if (!this.client || !this.provider) {
      await this.initialize()
    }

    if (!this.client) {
      throw new Error('Nenhum provider disponível')
    }

    // Merge config com as configurações do provider
    const finalConfig: Partial<AICallConfig> = {
      ...config,
      provider: this.provider!.provider_name,
      model: config?.model || this.provider!.model_name || undefined,
    }

    const response = await this.client.generateContent(messages, finalConfig)

    // Registra o uso
    await this.trackUsage(response.usage?.totalTokens || 0, 'unknown')

    return response
  }

  /**
   * Gera conteúdo com streaming
   */
  async *generateContentStream(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<AICallConfig>
  ): AsyncGenerator<AIStreamChunk> {
    if (!this.client || !this.provider) {
      await this.initialize()
    }

    if (!this.client) {
      throw new Error('Nenhum provider disponível')
    }

    const finalConfig: Partial<AICallConfig> = {
      ...config,
      provider: this.provider!.provider_name,
      model: config?.model || this.provider!.model_name || undefined,
    }

    let totalTokens = 0

    for await (const chunk of this.client.generateContentStream(messages, finalConfig)) {
      // Estima tokens (muito aproximado)
      totalTokens += chunk.content.length / 4
      yield chunk
    }

    // Registra o uso
    await this.trackUsage(Math.floor(totalTokens), 'unknown')
  }

  /**
   * Registra o uso no banco de dados
   */
  private async trackUsage(tokensUsed: number, requestType: string): Promise<void> {
    if (!this.provider || this.provider.id === 'default') {
      return // Não registra uso do provider padrão
    }

    try {
      const supabase = await createServerSupabaseClient()

      await supabase.from('ai_usage_tracking').insert({
        user_id: this.userId,
        provider_id: this.provider.id,
        model_name: this.provider.model_name || 'unknown',
        tokens_used: tokensUsed,
        request_type: requestType,
      })
    } catch (error) {
      console.error('Erro ao registrar uso:', error)
    }
  }

  /**
   * Obtém o provider atual
   */
  getProvider(): AIProvider | null {
    return this.provider
  }

  /**
   * Verifica se o provider está inicializado
   */
  isInitialized(): boolean {
    return this.client !== null && this.provider !== null
  }
}

/**
 * Factory function para criar um ProviderManager
 */
export async function createProviderManager(userId: string): Promise<ProviderManager> {
  const manager = new ProviderManager(userId)
  await manager.initialize()
  return manager
}

/**
 * Obtém o provider padrão do usuário
 */
export async function getUserDefaultProvider(userId: string): Promise<AIProvider | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    // Retorna Groq como padrão
    return {
      id: 'default',
      user_id: userId,
      provider_name: 'groq',
      api_key: '',
      is_active: true,
      is_default: true,
      model_name: 'llama-3.3-70b-versatile',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return data
}
