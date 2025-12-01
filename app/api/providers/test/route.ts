import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProviderName } from '@/types/providers'
import { createGroqClient } from '@/lib/providers/groq-multi'
import { createGeminiClient } from '@/lib/providers/gemini'
import { createOpenAIClient } from '@/lib/providers/openai'
import { createAnthropicClient } from '@/lib/providers/anthropic'

/**
 * POST - Testa a conexão com um provider
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { provider_name, api_key, model_name } = body as {
      provider_name: ProviderName
      api_key: string
      model_name?: string
    }

    if (!provider_name) {
      return NextResponse.json(
        { success: false, error: 'Provider é obrigatório' },
        { status: 400 }
      )
    }

    let result: { success: boolean; message: string }

    try {
      switch (provider_name) {
        case 'groq':
          const groqClient = createGroqClient(api_key || undefined)
          result = await groqClient.testConnection()
          break
        case 'gemini':
          if (!api_key) {
            return NextResponse.json(
              { success: false, error: 'API key é obrigatória para Gemini' },
              { status: 400 }
            )
          }
          const geminiClient = createGeminiClient(api_key, model_name)
          result = await geminiClient.testConnection()
          break
        case 'openai':
          if (!api_key) {
            return NextResponse.json(
              { success: false, error: 'API key é obrigatória para OpenAI' },
              { status: 400 }
            )
          }
          const openaiClient = createOpenAIClient(api_key)
          result = await openaiClient.testConnection()
          break
        case 'anthropic':
          if (!api_key) {
            return NextResponse.json(
              { success: false, error: 'API key é obrigatória para Anthropic' },
              { status: 400 }
            )
          }
          const anthropicClient = createAnthropicClient(api_key)
          result = await anthropicClient.testConnection()
          break
        default:
          return NextResponse.json(
            { success: false, error: 'Provider não suportado' },
            { status: 400 }
          )
      }

      return NextResponse.json(result)
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: error?.message || 'Erro ao testar conexão',
      })
    }
  } catch (error: any) {
    console.error('Erro na API de teste de providers:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
