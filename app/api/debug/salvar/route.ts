import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AnaliseDebugData, RespostaDebugIA } from "@/types/debug"

interface SalvarAnaliseRequest {
  dados_entrada: AnaliseDebugData
  resposta_ia: RespostaDebugIA
  status?: "analisado" | "resolvido" | "pendente"
}

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

    const body: SalvarAnaliseRequest = await request.json()
    const { dados_entrada, resposta_ia, status = "analisado" } = body

    // Validação básica
    if (!dados_entrada || !resposta_ia) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos" },
        { status: 400 }
      )
    }

    // Insere no banco
    const { data: analise, error: insertError } = await supabase
      .from("analises_debug")
      .insert({
        user_id: user.id,
        tipo_analise: dados_entrada.tipo,
        titulo: resposta_ia.titulo,
        dados_entrada: dados_entrada as any,
        resposta_ia: resposta_ia as any,
        status,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[SALVAR DEBUG] Erro ao inserir:", insertError)
      return NextResponse.json(
        { success: false, error: "Erro ao salvar análise" },
        { status: 500 }
      )
    }

    console.log(`[SALVAR DEBUG] Análise ${dados_entrada.tipo} salva com sucesso`)

    return NextResponse.json({
      success: true,
      data: analise,
    })
  } catch (error: any) {
    console.error("[SALVAR DEBUG] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao salvar análise",
      },
      { status: 500 }
    )
  }
}
