import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  gerarPromptABAP,
  gerarPromptRefinamentoABAP,
  removerThinkingBlocks,
  extrairJSON,
  validarRespostaABAP,
  sanitizarJSON,
} from '@/lib/prompts/abapprompt'
import { AbapFormData } from '@/types/abap'
import { createProviderManager } from '@/lib/providers/provider-manager'

interface GerarAbapRequest {
  formData: AbapFormData
  perguntasERespostas?: Array<{ pergunta: string; resposta: string }>
  modo?: 'inicial' | 'refinamento'
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        encoder.encode(
          JSON.stringify({ type: 'error', error: 'Não autenticado' })
        ),
        { status: 401 }
      )
    }

    const body: GerarAbapRequest = await request.json()
    const { formData, perguntasERespostas, modo = 'inicial' } = body

    if (!formData || !formData.tipo_programa) {
      return new Response(
        encoder.encode(
          JSON.stringify({
            type: 'error',
            error: 'Dados do formulário inválidos',
          })
        ),
        { status: 400 }
      )
    }

    if (formData.modo_criacao === 'manual' && !formData.nome_programa) {
      return new Response(
        encoder.encode(
          JSON.stringify({
            type: 'error',
            error: 'Nome do programa é obrigatório',
          })
        ),
        { status: 400 }
      )
    }

    const systemPrompt =
      modo === 'refinamento' && perguntasERespostas
        ? gerarPromptRefinamentoABAP(formData, perguntasERespostas)
        : gerarPromptABAP(formData)

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const providerManager = await createProviderManager(user.id)

          let respostaCompleta = ''
          let bufferTemporario = ''

          for await (const chunk of providerManager.generateContentStream(
            [
              {
                role: 'user',
                content: systemPrompt,
              },
            ],
            {
              temperature: 0.3,
              maxTokens: 8000,
              topP: 0.9,
            }
          )) {
            const content = chunk.content || ''

            if (content) {
              respostaCompleta += content
              bufferTemporario += content

              const data = JSON.stringify({
                type: 'token',
                content,
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          const respostaLimpa = removerThinkingBlocks(respostaCompleta)
          const jsonLimpo = extrairJSON(respostaLimpa)
          const validacao = validarRespostaABAP(respostaLimpa)

          if (!validacao.isValid) {

            const errorData = JSON.stringify({
              type: 'error',
              error: validacao.error || 'Resposta da IA inválida',
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
            return
          }

          let jsonParaParsear = validacao.jsonExtraido || jsonLimpo

          jsonParaParsear = sanitizarJSON(jsonParaParsear)

          let respostaJSON: any
          try {
            respostaJSON = JSON.parse(jsonParaParsear)
          } catch (parseError: any) {

            const errorData = JSON.stringify({
              type: 'error',
              error: `Erro ao processar resposta da IA: ${parseError.message}. Tente novamente.`,
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
            return
          }

          const doneData = JSON.stringify({
            type: 'done',
            resultado: respostaJSON,
            raw_response: respostaCompleta,
          })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))

          controller.close()
        } catch (error: any) {
          console.error('Erro no stream de geração ABAP:', error)

          const errorData = JSON.stringify({
            type: 'error',
            error:
              error?.message ||
              'Erro ao gerar código ABAP. Tente novamente.',
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Erro na API de geração ABAP:', error)
    return new Response(
      encoder.encode(
        JSON.stringify({
          type: 'error',
          error: error?.message || 'Erro interno do servidor',
        })
      ),
      { status: 500 }
    )
  }
}
