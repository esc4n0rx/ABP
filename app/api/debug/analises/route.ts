import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AnaliseDebugListItem, AnaliseDebugSalva } from "@/types/debug"

// GET - Listar análises recentes
export async function GET(request: NextRequest) {
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

    // Busca parâmetros
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const tipo = searchParams.get("tipo") // Filtro opcional por tipo
    const status = searchParams.get("status") // Filtro opcional por status

    // Monta query
    let query = supabase
      .from("analises_debug")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(limit)

    if (tipo) {
      query = query.eq("tipo_analise", tipo)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: analises, error: selectError } = await query

    if (selectError) {
      console.error("[LISTAR DEBUG] Erro ao buscar:", selectError)
      return NextResponse.json(
        { success: false, error: "Erro ao buscar análises" },
        { status: 500 }
      )
    }

    // Mapeia para o formato de lista
    const analisesLista: AnaliseDebugListItem[] = (analises || []).map((a: any) => ({
      id: a.id,
      tipo_analise: a.tipo_analise,
      titulo: a.titulo,
      resumo: a.resposta_ia?.resumo_problema || "",
      nivel_criticidade: a.resposta_ia?.nivel_criticidade || "MEDIA",
      status: a.status,
      criado_em: a.criado_em,
    }))

    return NextResponse.json({
      success: true,
      data: analisesLista,
      total: analisesLista.length,
    })
  } catch (error: any) {
    console.error("[LISTAR DEBUG] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao buscar análises",
      },
      { status: 500 }
    )
  }
}

// POST - Buscar análise específica por ID
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

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não fornecido" },
        { status: 400 }
      )
    }

    // Busca análise específica
    const { data: analise, error: selectError } = await supabase
      .from("analises_debug")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (selectError || !analise) {
      console.error("[BUSCAR DEBUG] Erro ao buscar:", selectError)
      return NextResponse.json(
        { success: false, error: "Análise não encontrada" },
        { status: 404 }
      )
    }

    const analiseCompleta: AnaliseDebugSalva = {
      id: analise.id,
      user_id: analise.user_id,
      tipo_analise: analise.tipo_analise,
      titulo: analise.titulo,
      dados_entrada: analise.dados_entrada,
      resposta_ia: analise.resposta_ia,
      status: analise.status,
      criado_em: analise.criado_em,
      atualizado_em: analise.atualizado_em,
    }

    return NextResponse.json({
      success: true,
      data: analiseCompleta,
    })
  } catch (error: any) {
    console.error("[BUSCAR DEBUG] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao buscar análise",
      },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar status da análise
export async function PATCH(request: NextRequest) {
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

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID ou status não fornecido" },
        { status: 400 }
      )
    }

    if (!["analisado", "resolvido", "pendente"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status inválido" },
        { status: 400 }
      )
    }

    // Atualiza status
    const { data: analise, error: updateError } = await supabase
      .from("analises_debug")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("[ATUALIZAR DEBUG] Erro ao atualizar:", updateError)
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar análise" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analise,
    })
  } catch (error: any) {
    console.error("[ATUALIZAR DEBUG] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao atualizar análise",
      },
      { status: 500 }
    )
  }
}

// DELETE - Deletar análise
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não fornecido" },
        { status: 400 }
      )
    }

    // Deleta análise
    const { error: deleteError } = await supabase
      .from("analises_debug")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("[DELETAR DEBUG] Erro ao deletar:", deleteError)
      return NextResponse.json(
        { success: false, error: "Erro ao deletar análise" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error("[DELETAR DEBUG] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao deletar análise",
      },
      { status: 500 }
    )
  }
}
