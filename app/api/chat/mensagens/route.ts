import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET: Buscar mensagens de um projeto ou todas
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projeto_id = searchParams.get('projeto_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('chat_mensagens')
      .select('*')
      .eq('user_id', session.user.id)
      .order('criado_em', { ascending: true })
      .limit(limit)

    // Filtra por projeto se fornecido
    if (projeto_id) {
      if (projeto_id === 'null') {
        query = query.is('projeto_id', null)
      } else {
        query = query.eq('projeto_id', projeto_id)
      }
    }

    const { data: mensagens, error } = await query

    if (error) {
      console.error('Erro ao buscar mensagens:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar mensagens' },
        { status: 500 }
      )
    }

    return NextResponse.json({ mensagens })
  } catch (error: any) {
    console.error('Erro na API de mensagens:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// DELETE: Deletar mensagens de um projeto
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projeto_id = searchParams.get('projeto_id')

    if (!projeto_id) {
      return NextResponse.json(
        { error: 'projeto_id é obrigatório' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('chat_mensagens')
      .delete()
      .eq('user_id', session.user.id)

    if (projeto_id === 'null') {
      query = query.is('projeto_id', null)
    } else {
      query = query.eq('projeto_id', projeto_id)
    }

    const { error } = await query

    if (error) {
      console.error('Erro ao deletar mensagens:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar mensagens' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar mensagens:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
