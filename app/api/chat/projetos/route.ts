import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChatProjeto } from '@/types/chat'

// GET: Listar projetos do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Busca projetos com resumo
    const { data: projetos, error } = await supabase
      .from('chat_projetos_resumo')
      .select('*')
      .eq('user_id', session.user.id)
      .order('atualizado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar projetos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar projetos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ projetos })
  } catch (error: any) {
    console.error('Erro na API de projetos:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// POST: Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body: Partial<ChatProjeto> = await request.json()

    // Validação
    if (!body.nome || body.nome.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome do projeto é obrigatório' },
        { status: 400 }
      )
    }

    // Cria projeto
    const { data: projeto, error } = await supabase
      .from('chat_projetos')
      .insert({
        user_id: session.user.id,
        nome: body.nome,
        descricao: body.descricao || '',
        contexto: body.contexto || '',
        cor: body.cor || '#2b6cfd',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar projeto:', error)
      return NextResponse.json(
        { error: 'Erro ao criar projeto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ projeto })
  } catch (error: any) {
    console.error('Erro na API de projetos:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
