import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  formatarHistorico,
  removerThinkingBlocks,
  validarEscopoSAP,
} from '@/lib/prompts/chatprompt'
import { ChatRequest } from '@/types/chat'
import { createProviderManager } from '@/lib/providers/provider-manager'

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new Response(
        encoder.encode(
          JSON.stringify({ type: 'error', error: 'Não autenticado' })
        ),
        { status: 401 }
      )
    }

    const body: ChatRequest = await request.json()
    const { mensagem, projeto_id, contexto_projeto, historico = [] } = body

    // Validação básica
    if (!mensagem || mensagem.trim().length === 0) {
      return new Response(
        encoder.encode(
          JSON.stringify({ type: 'error', error: 'Mensagem vazia' })
        ),
        { status: 400 }
      )
    }

    // Validação de escopo SAP (opcional, a IA também valida)
    const validacao = validarEscopoSAP(mensagem)
    if (!validacao.isValid) {
      console.warn('Mensagem fora do escopo SAP:', validacao.reason)
    }

    // Salva mensagem do usuário no banco
    const { data: mensagemUser, error: errorUser } = await supabase
      .from('chat_mensagens')
      .insert({
        user_id: session.user.id,
        projeto_id: projeto_id || null,
        role: 'user',
        conteudo: mensagem,
        conteudo_limpo: mensagem,
      })
      .select()
      .single()

    if (errorUser) {
      console.error('Erro ao salvar mensagem do usuário:', errorUser)
    }

    // Formata histórico para a API
    const mensagensFormatadas = formatarHistorico(historico, contexto_projeto)

    // Adiciona mensagem atual
    mensagensFormatadas.push({
      role: 'user',
      content: mensagem,
    })

    // Cria stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Cria provider manager para o usuário
          const providerManager = await createProviderManager(session.user.id)

          let respostaCompleta = ''

          // Stream dos chunks usando o provider configurado
          for await (const chunk of providerManager.generateContentStream(
            mensagensFormatadas,
            {
              temperature: 0.7,
              maxTokens: 4096,
              topP: 0.9,
            }
          )) {
            const content = chunk.content || ''

            if (content) {
              respostaCompleta += content

              // Envia chunk para o cliente
              const data = JSON.stringify({
                type: 'token',
                content,
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Remove thinking blocks
          const respostaLimpa = removerThinkingBlocks(respostaCompleta)

          // Salva resposta da IA no banco
          const { data: mensagemIA, error: errorIA } = await supabase
            .from('chat_mensagens')
            .insert({
              user_id: session.user.id,
              projeto_id: projeto_id || null,
              role: 'assistant',
              conteudo: respostaCompleta,
              conteudo_limpo: respostaLimpa,
            })
            .select()
            .single()

          if (errorIA) {
            console.error('Erro ao salvar mensagem da IA:', errorIA)
          }

          // Envia sinal de conclusão
          const doneData = JSON.stringify({
            type: 'done',
            mensagem_id: mensagemIA?.id,
          })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))

          controller.close()
        } catch (error: any) {
          console.error('Erro no stream:', error)

          const errorData = JSON.stringify({
            type: 'error',
            error: error?.message || 'Erro ao processar mensagem',
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
    console.error('Erro na API de chat:', error)
    return new Response(
      encoder.encode(
        JSON.stringify({
          type: 'error',
          error: error?.message || 'Erro interno',
        })
      ),
      { status: 500 }
    )
  }
}
