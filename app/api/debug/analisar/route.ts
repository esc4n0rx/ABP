import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { gerarPromptDebug, validarRespostaDebug } from "@/lib/prompts/debugprompt"
import { AnaliseDebugRequest } from "@/types/debug"
import { createProviderManager } from "@/lib/providers/provider-manager"

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

    // Cria provider manager para o usuário
    const providerManager = await createProviderManager(user.id)

    // Chama a IA usando o provider configurado
    const response = await providerManager.generateContent(
      [
        {
          role: "user",
          content: systemPrompt,
        },
      ],
      {
        temperature: 0.3,
        maxTokens: 4000,
        topP: 0.9,
      }
    )

    const respostaIA = response.content || ""

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
