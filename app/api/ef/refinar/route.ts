import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { refinarEspecificacaoFuncional } from '@/lib/providers/groq'
import { EFFormData } from '@/types/ef'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const formData: EFFormData = await request.json()

    if (!formData.titulo || !formData.modulo_sap || !formData.empresa) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    const resultado = await refinarEspecificacaoFuncional(formData, user.id)

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error || 'Erro ao processar a especificação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: resultado.data,
    })
  } catch (error: any) {
    console.error('Erro na API de refinamento:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
