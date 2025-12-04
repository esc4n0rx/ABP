import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProgramaABAPListItem } from '@/types/abap'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Obtém parâmetros da query
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const statusParam = searchParams.get('status') // 'gerado', 'refinado', 'rascunho' ou 'gerado,refinado'
    const tipo = searchParams.get('tipo') // tipo_programa
    const search = searchParams.get('search') // busca por nome ou descrição

    // Constrói a query
    let query = supabase
      .from('abap_programas_resumo')
      .select('*')
      .eq('user_id', session.user.id)
      .order('criado_em', { ascending: false })

    // Aplica filtros
    if (statusParam) {
      // Suporta múltiplos status separados por vírgula
      const statusArray = statusParam.split(',').map(s => s.trim()).filter(s => s)

      if (statusArray.length === 1) {
        query = query.eq('status', statusArray[0])
      } else if (statusArray.length > 1) {
        query = query.in('status', statusArray)
      }
    }

    if (tipo) {
      query = query.eq('tipo_programa', tipo)
    }

    if (search) {
      query = query.or(
        `nome_programa.ilike.%${search}%,descricao.ilike.%${search}%`
      )
    }

    // Aplica paginação
    query = query.range(offset, offset + limit - 1)

    const { data: programas, error: programasError } = await query

    if (programasError) {
      console.error('Erro ao buscar programas:', programasError)
      return NextResponse.json(
        { error: 'Erro ao buscar programas', details: programasError.message },
        { status: 500 }
      )
    }

    console.log('Programas encontrados:', {
      total_encontrados: programas?.length || 0,
      user_id: session.user.id,
      filtros: {
        status: statusParam,
        tipo,
        search,
        limit,
        offset,
      },
    })

    // Conta total de registros (sem paginação)
    let countQuery = supabase
      .from('abap_programas_resumo')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (statusParam) {
      // Suporta múltiplos status separados por vírgula
      const statusArray = statusParam.split(',').map(s => s.trim()).filter(s => s)

      if (statusArray.length === 1) {
        countQuery = countQuery.eq('status', statusArray[0])
      } else if (statusArray.length > 1) {
        countQuery = countQuery.in('status', statusArray)
      }
    }

    if (tipo) {
      countQuery = countQuery.eq('tipo_programa', tipo)
    }

    if (search) {
      countQuery = countQuery.or(
        `nome_programa.ilike.%${search}%,descricao.ilike.%${search}%`
      )
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Erro ao contar programas:', countError)
    }

    return NextResponse.json(
      {
        programas: programas || [],
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao buscar programas ABAP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}

// Endpoint para buscar programa específico por ID
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID do programa é obrigatório' },
        { status: 400 }
      )
    }

    // Busca programa completo com relacionamentos
    // Nota: Especificamos os foreign key constraints para evitar ambiguidade
    const { data: programa, error: programaError } = await supabase
      .from('programas_abap')
      .select(
        `
        *,
        tabelas:abap_tabelas!fk_programa_tabelas(*),
        campos:abap_campos!fk_programa_campos(*),
        funcoes:abap_funcoes_modulos!fk_programa_funcoes(*),
        processos:abap_processos!fk_programa_processos(*),
        regras:abap_regras_negocio!fk_programa_regras(*)
      `
      )
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (programaError) {
      console.error('Erro ao buscar programa:', programaError)
      return NextResponse.json(
        { error: 'Programa não encontrado', details: programaError.message },
        { status: 404 }
      )
    }

    return NextResponse.json(programa, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao buscar programa ABAP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}

// Endpoint para deletar programa
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do programa é obrigatório' },
        { status: 400 }
      )
    }

    // Deleta programa (cascade vai deletar relacionamentos)
    const { error: deleteError } = await supabase
      .from('programas_abap')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Erro ao deletar programa:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar programa', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Programa deletado com sucesso' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao deletar programa ABAP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}
