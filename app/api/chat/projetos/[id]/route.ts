import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChatProjeto } from '@/types/chat'

// GET: Buscar projeto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: projeto, error } = await supabase
      .from('chat_projetos')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (error || !projeto) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ projeto })
  } catch (error: any) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// PUT: Atualizar projeto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body: Partial<ChatProjeto> = await request.json()

    const { data: projeto, error } = await supabase
      .from('chat_projetos')
      .update({
        nome: body.nome,
        descricao: body.descricao,
        contexto: body.contexto,
        cor: body.cor,
      })
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar projeto:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar projeto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ projeto })
  } catch (error: any) {
    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// DELETE: Deletar projeto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { error } = await supabase
      .from('chat_projetos')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Erro ao deletar projeto:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar projeto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar projeto:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
