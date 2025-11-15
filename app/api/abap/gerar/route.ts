import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import {
  gerarPromptABAP,
  gerarPromptRefinamentoABAP,
  removerThinkingBlocks,
  extrairJSON,
  validarRespostaABAP,
  sanitizarJSON,
} from '@/lib/prompts/abapprompt'
import { AbapFormData } from '@/types/abap'
import { logger } from '@/lib/utils/logger'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
})

interface GerarAbapRequest {
  formData: AbapFormData
  perguntasERespostas?: Array<{ pergunta: string; resposta: string }>
  modo?: 'inicial' | 'refinamento'
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação (usa getUser para maior segurança)
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

    // Validação básica
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

    // Validação de nome do programa (apenas para modo manual)
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

    // Gera o prompt apropriado
    const systemPrompt =
      modo === 'refinamento' && perguntasERespostas
        ? gerarPromptRefinamentoABAP(formData, perguntasERespostas)
        : gerarPromptABAP(formData)

    logger.info('=== INICIANDO GERAÇÃO ABAP ===', {
      tipo: formData.tipo_programa,
      nome: formData.nome_programa,
      modo_criacao: formData.modo_criacao,
      modo_geracao: modo,
      temEF: !!formData.ef_texto,
      temPerguntas: !!perguntasERespostas,
      numPerguntas: perguntasERespostas?.length || 0,
    })

    logger.logPromptEnviado(systemPrompt)

    // Cria stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Chama API Groq com stream
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: 'user',
                content: systemPrompt,
              },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3, // Temperatura baixa para consistência de código
            max_completion_tokens: 8000, // Código pode ser longo
            top_p: 0.9,
            stream: true,
          })

          let respostaCompleta = ''
          let bufferTemporario = ''

          // Stream dos chunks
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || ''

            if (content) {
              respostaCompleta += content
              bufferTemporario += content

              // Envia chunks para o cliente em tempo real
              // Mas não envia blocos <thinking> (serão removidos depois)
              const data = JSON.stringify({
                type: 'token',
                content,
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          logger.info('Resposta completa recebida da IA', {
            tamanho: respostaCompleta.length,
          })

          logger.logRespostaIA(respostaCompleta, modo)

          // Remove thinking blocks da resposta completa
          const respostaLimpa = removerThinkingBlocks(respostaCompleta)
          logger.logRespostaLimpa(respostaLimpa)

          // Extrai JSON da resposta
          const jsonLimpo = extrairJSON(respostaLimpa)
          logger.logJSONExtraido(jsonLimpo)

          // Valida a resposta
          const validacao = validarRespostaABAP(respostaCompleta)

          if (!validacao.isValid) {
            logger.logErroValidacao(validacao.error || 'Erro desconhecido', respostaCompleta)

            logger.error('DETALHES DO ERRO DE VALIDAÇÃO', {
              erro: validacao.error,
              erroDetalhado: validacao.erroDetalhado,
              jsonExtraido: validacao.jsonExtraido,
              respostaLimpa: respostaLimpa.substring(0, 1000),
              respostaCompleta: respostaCompleta.substring(0, 1000),
            })

            const errorData = JSON.stringify({
              type: 'error',
              error: validacao.error || 'Resposta da IA inválida',
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
            return
          }

          // Parse do JSON (usa o JSON extraído da validação se disponível)
          let jsonParaParsear = validacao.jsonExtraido || jsonLimpo

          // Sanitiza caracteres de controle problemáticos antes do parse
          jsonParaParsear = sanitizarJSON(jsonParaParsear)

          let respostaJSON: any
          try {
            respostaJSON = JSON.parse(jsonParaParsear)
          } catch (parseError: any) {
            logger.error('ERRO AO PARSEAR JSON FINAL', {
              erro: parseError.message,
              jsonTruncado: jsonParaParsear.substring(0, 500),
              tamanhoJSON: jsonParaParsear.length,
            })

            const errorData = JSON.stringify({
              type: 'error',
              error: `Erro ao processar resposta da IA: ${parseError.message}. Tente novamente.`,
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
            return
          }

          logger.logSucesso(respostaJSON.tipo, {
            tipo: respostaJSON.tipo,
            temCodigo: !!respostaJSON.codigo_principal,
            numPerguntas: respostaJSON.perguntas?.length || 0,
            numCodigosAdicionais: respostaJSON.codigos_adicionais?.length || 0,
          })

          // Envia sinal de conclusão com os dados processados
          const doneData = JSON.stringify({
            type: 'done',
            resultado: respostaJSON,
            raw_response: respostaCompleta, // Para debug/logs
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
