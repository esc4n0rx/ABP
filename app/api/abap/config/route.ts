import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface AbapGenerationConfig {
  id?: string
  user_id: string
  estilo_codigo: 'oo' | 'puro'
  usar_clean_code: boolean
  usar_performance_otimizada: boolean
  usar_tratamento_erros: boolean
  usar_documentacao_inline: boolean
  nivel_complexidade: 'simples' | 'medio' | 'avancado'
  created_at?: string
  updated_at?: string
}

// GET - Buscar configuração do usuário
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

    // Buscar configuração do usuário
    const { data: config, error } = await supabase
      .from('abap_generation_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Se não existe configuração, retorna configuração padrão
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: {
            estilo_codigo: 'oo',
            usar_clean_code: true,
            usar_performance_otimizada: true,
            usar_tratamento_erros: true,
            usar_documentacao_inline: true,
            nivel_complexidade: 'medio',
          },
        })
      }

      console.error('Erro ao buscar configuração:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar configuração' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: config,
    })
  } catch (error: any) {
    console.error('Erro na API de configuração ABAP:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar configuração
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

    const body = await request.json()
    const {
      estilo_codigo,
      usar_clean_code,
      usar_performance_otimizada,
      usar_tratamento_erros,
      usar_documentacao_inline,
      nivel_complexidade,
    } = body

    // Validações
    if (!['oo', 'puro'].includes(estilo_codigo)) {
      return NextResponse.json(
        { success: false, error: 'Estilo de código inválido' },
        { status: 400 }
      )
    }

    if (!['simples', 'medio', 'avancado'].includes(nivel_complexidade)) {
      return NextResponse.json(
        { success: false, error: 'Nível de complexidade inválido' },
        { status: 400 }
      )
    }

    // Verificar se já existe configuração
    const { data: existingConfig } = await supabase
      .from('abap_generation_config')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const configData = {
      user_id: user.id,
      estilo_codigo,
      usar_clean_code: usar_clean_code ?? true,
      usar_performance_otimizada: usar_performance_otimizada ?? true,
      usar_tratamento_erros: usar_tratamento_erros ?? true,
      usar_documentacao_inline: usar_documentacao_inline ?? true,
      nivel_complexidade: nivel_complexidade ?? 'medio',
    }

    let result

    if (existingConfig) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from('abap_generation_config')
        .update(configData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar configuração:', error)
        return NextResponse.json(
          { success: false, error: 'Erro ao atualizar configuração' },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from('abap_generation_config')
        .insert(configData)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar configuração:', error)
        return NextResponse.json(
          { success: false, error: 'Erro ao criar configuração' },
          { status: 500 }
        )
      }

      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('Erro na API de configuração ABAP:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Resetar para configuração padrão
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

    const { error } = await supabase
      .from('abap_generation_config')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar configuração:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao resetar configuração' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuração resetada para padrão',
    })
  } catch (error: any) {
    console.error('Erro na API de configuração ABAP:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
