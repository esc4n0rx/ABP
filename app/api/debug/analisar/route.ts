import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import Groq from "groq-sdk"
import { gerarPromptDebug, validarRespostaDebug } from "@/lib/prompts/debugprompt"
import { AnaliseDebugRequest } from "@/types/debug"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body: AnaliseDebugRequest = await request.json()
    const { dados } = body

    // Validação básica
    if (!dados || !dados.tipo) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Validações específicas por tipo
    if (dados.tipo === "SMQ2") {
      if (!dados.nome_funcao || !dados.nome_fila || !dados.detalhes_ocorrencia) {
        return NextResponse.json(
          { success: false, error: "Dados de SMQ2 incompletos" },
          { status: 400 }
        )
      }
    } else if (dados.tipo === "ABAP") {
      if (!dados.nome_programa || !dados.descricao_problema || !dados.codigo_abap) {
        return NextResponse.json(
          { success: false, error: "Dados de análise ABAP incompletos" },
          { status: 400 }
        )
      }
    } else if (dados.tipo === "CENARIO") {
      if (!dados.transacao || !dados.descricao_cenario || !dados.descricao_problema) {
        return NextResponse.json(
          { success: false, error: "Dados de análise de cenário incompletos" },
          { status: 400 }
        )
      }
    }

    // Gera o prompt apropriado
    const systemPrompt = gerarPromptDebug(dados)

    console.log(`[DEBUG API] Iniciando análise ${dados.tipo}`)

    // Chama API Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: systemPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_completion_tokens: 4000,
      top_p: 0.9,
    })

    const respostaIA = chatCompletion.choices[0]?.message?.content || ""

    if (!respostaIA) {
      return NextResponse.json(
        { success: false, error: "IA não retornou resposta" },
        { status: 500 }
      )
    }

    console.log(`[DEBUG API] Resposta recebida da IA, tamanho: ${respostaIA.length}`)

    // Valida a resposta
    const validacao = validarRespostaDebug(respostaIA)

    if (!validacao.isValid) {
      console.error("[DEBUG API] Resposta inválida:", validacao.error)
      return NextResponse.json(
        {
          success: false,
          error: `Resposta da IA inválida: ${validacao.error}`,
        },
        { status: 500 }
      )
    }

    console.log(`[DEBUG API] Análise ${dados.tipo} concluída com sucesso`)

    return NextResponse.json({
      success: true,
      data: validacao.dados,
    })
  } catch (error: any) {
    console.error("[DEBUG API] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao processar análise",
      },
      { status: 500 }
    )
  }
}
