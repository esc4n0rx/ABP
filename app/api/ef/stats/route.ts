import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    // Busca estatísticas do usuário
    const { data: stats, error } = await supabase
      .from('especificacoes_funcionais')
      .select('id, status, criado_em')
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas' },
        { status: 500 }
      )
    }

    // Calcula estatísticas
    const total_efs = stats.length
    const efs_publicadas = stats.filter((ef) => ef.status === 'publicado').length
    const efs_refinadas = stats.filter((ef) => ef.status === 'refinado').length
    const efs_rascunho = stats.filter((ef) => ef.status === 'rascunho').length

    // EFs criadas nos últimos 7 dias
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
    const efs_recentes = stats.filter(
      (ef) => new Date(ef.criado_em) >= seteDiasAtras
    ).length

    // Última EF criada
    const ultima_ef = stats.sort(
      (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    )[0]

    return NextResponse.json({
      total_efs,
      efs_publicadas,
      efs_refinadas,
      efs_rascunho,
      efs_recentes,
      ultima_ef_criada: ultima_ef?.criado_em || null,
    })
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
