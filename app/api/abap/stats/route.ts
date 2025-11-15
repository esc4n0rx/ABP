import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AbapStats } from '@/types/abap'

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

    // Busca estatísticas do usuário usando a view
    const { data: stats, error: statsError } = await supabase
      .from('abap_user_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      // PGRST116 = nenhum registro encontrado (usuário novo)
      console.error('Erro ao buscar estatísticas:', statsError)
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas', details: statsError.message },
        { status: 500 }
      )
    }

    // Se não houver dados, retorna stats zeradas
    const statsData: AbapStats = stats || {
      total_programas: 0,
      programas_gerados: 0,
      programas_refinados: 0,
      programas_rascunho: 0,
      programas_recentes: 0,
      ultima_geracao: null,
    }

    // Busca tipos mais usados
    const { data: tiposData, error: tiposError } = await supabase
      .from('abap_tipos_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('total', { ascending: false })
      .limit(5)

    if (tiposError && tiposError.code !== 'PGRST116') {
      console.error('Erro ao buscar tipos:', tiposError)
    }

    const statsCompletas: AbapStats = {
      ...statsData,
      tipos_mais_usados: tiposData || [],
    }

    return NextResponse.json(statsCompletas, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas ABAP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}
