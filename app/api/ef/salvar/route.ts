import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EspecificacaoFuncional, MembroEquipe, TabelaSAP, ModuloSAP } from '@/types/ef'

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

    const body = await request.json()
    const { ef, equipe, tabelas, modulos } = body

    // Insere a EF principal
    const { data: efData, error: efError } = await supabase
      .from('especificacoes_funcionais')
      .insert({
        user_id: session.user.id,
        titulo: ef.titulo,
        versao: ef.versao,
        descricao: ef.descricao,
        status: 'refinado',
        modulo_sap: ef.modulo_sap,
        empresa: ef.empresa,
        tipo_programa: ef.tipo_programa,
        visao_geral: ef.visao_geral,
        motivo_ef: ef.motivo_ef,
        especificacao_detalhada: ef.especificacao_detalhada,
        conteudo_refinado: ef.conteudo_refinado,
      })
      .select()
      .single()

    if (efError) {
      console.error('Erro ao salvar EF:', efError)
      return NextResponse.json(
        { error: 'Erro ao salvar especificação funcional' },
        { status: 500 }
      )
    }

    const efId = efData.id

    // Insere membros da equipe
    if (equipe && equipe.length > 0) {
      const equipeData = equipe.map((membro: MembroEquipe) => ({
        ef_id: efId,
        nome: membro.nome,
        cargo: membro.cargo,
        email: membro.email,
      }))

      const { error: equipeError } = await supabase
        .from('ef_equipe')
        .insert(equipeData)

      if (equipeError) {
        console.error('Erro ao salvar equipe:', equipeError)
      }
    }

    // Insere tabelas SAP
    if (tabelas && tabelas.length > 0) {
      const tabelasData = tabelas.map((tabela: TabelaSAP) => ({
        ef_id: efId,
        nome_tabela: tabela.nome_tabela,
        descricao: tabela.descricao,
        tipo: tabela.tipo,
      }))

      const { error: tabelasError } = await supabase
        .from('ef_tabelas_sap')
        .insert(tabelasData)

      if (tabelasError) {
        console.error('Erro ao salvar tabelas:', tabelasError)
      }
    }

    // Insere módulos
    if (modulos && modulos.length > 0) {
      const modulosData = modulos.map((modulo: ModuloSAP) => ({
        ef_id: efId,
        nome_modulo: modulo.nome_modulo,
        descricao: modulo.descricao,
        tipo: modulo.tipo,
      }))

      const { error: modulosError } = await supabase
        .from('ef_modulos')
        .insert(modulosData)

      if (modulosError) {
        console.error('Erro ao salvar módulos:', modulosError)
      }
    }

    return NextResponse.json({
      success: true,
      data: efData,
    })
  } catch (error: any) {
    console.error('Erro ao salvar EF:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
