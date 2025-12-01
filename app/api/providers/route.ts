import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CreateProviderRequest, UpdateProviderRequest } from '@/types/providers'

/**
 * GET - Lista todos os providers do usuário
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

    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar providers:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar providers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('Erro na API de providers:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

/**
 * POST - Cria um novo provider
 */
export async function POST(request: NextRequest) {
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

    const body: CreateProviderRequest = await request.json()

    // Validação
    if (!body.provider_name || !body.api_key) {
      return NextResponse.json(
        { success: false, error: 'Provider e API key são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se já existe um provider deste tipo
    const { data: existing } = await supabase
      .from('ai_providers')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider_name', body.provider_name)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Você já tem um provider deste tipo configurado' },
        { status: 400 }
      )
    }

    // Se é o primeiro provider ou foi marcado como padrão, define como padrão
    const { count } = await supabase
      .from('ai_providers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const isFirstProvider = count === 0
    const isDefault = body.is_default || isFirstProvider

    const { data, error } = await supabase
      .from('ai_providers')
      .insert({
        user_id: user.id,
        provider_name: body.provider_name,
        api_key: body.api_key,
        model_name: body.model_name,
        is_active: true,
        is_default: isDefault,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar provider:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar provider' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Erro na API de providers:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualiza um provider
 */
export async function PATCH(request: NextRequest) {
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
    const providerId = searchParams.get('id')

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'ID do provider é obrigatório' },
        { status: 400 }
      )
    }

    const body: UpdateProviderRequest = await request.json()

    const { data, error } = await supabase
      .from('ai_providers')
      .update(body)
      .eq('id', providerId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar provider:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar provider' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Erro na API de providers:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove um provider
 */
export async function DELETE(request: NextRequest) {
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
    const providerId = searchParams.get('id')

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'ID do provider é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('ai_providers')
      .delete()
      .eq('id', providerId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar provider:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar provider' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Erro na API de providers:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
