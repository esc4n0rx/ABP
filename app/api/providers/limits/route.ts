import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET - Lista os limites dos modelos
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const providerName = searchParams.get('provider')

    let query = supabase
      .from('ai_model_limits')
      .select('*')
      .order('provider_name', { ascending: true })

    if (providerName) {
      query = query.eq('provider_name', providerName)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar limites:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar limites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('Erro na API de limites:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
