import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProgramaABAP, TabelaABAP, CampoABAP, FuncaoModuloABAP, CodigoGerado } from '@/types/abap'

interface SalvarAbapRequest {
  programa: Omit<ProgramaABAP, 'id' | 'user_id' | 'criado_em' | 'atualizado_em'>
  tabelas?: TabelaABAP[]
  campos?: CampoABAP[]
  funcoes_modulos?: FuncaoModuloABAP[]
  processos?: string[]
  regras_negocio?: string[]
}

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

    const body: SalvarAbapRequest = await request.json()
    const { programa, tabelas, campos, funcoes_modulos, processos, regras_negocio } = body

    // Validação básica
    if (!programa || !programa.nome_programa || !programa.tipo_programa) {
      return NextResponse.json(
        { error: 'Dados do programa inválidos' },
        { status: 400 }
      )
    }

    console.log('Salvando programa ABAP:', {
      nome: programa.nome_programa,
      tipo: programa.tipo_programa,
      status: programa.status,
    })

    // Inicia transação - insere programa principal
    const { data: programaData, error: programaError } = await supabase
      .from('programas_abap')
      .insert({
        user_id: session.user.id,
        nome_programa: programa.nome_programa,
        tipo_programa: programa.tipo_programa,
        descricao: programa.descricao || '',
        status: programa.status || 'rascunho',
        objetivo: programa.objetivo || '',
        logica_negocio: programa.logica_negocio || '',
        especificacao: programa.especificacao || '',
        ef_upload: programa.ef_upload || null,
        ef_arquivo: programa.ef_arquivo || null,
        contexto_especifico: programa.contexto_especifico || null,
        codigo_gerado: programa.codigo_gerado || null,
        perguntas_ia: programa.perguntas_ia || null,
        respostas_usuario: programa.respostas_usuario || null,
      })
      .select()
      .single()

    if (programaError) {
      console.error('Erro ao salvar programa:', programaError)
      return NextResponse.json(
        { error: 'Erro ao salvar programa', details: programaError.message },
        { status: 500 }
      )
    }

    const programaId = programaData.id

    // Salva tabelas relacionadas
    if (tabelas && tabelas.length > 0) {
      const tabelasData = tabelas.map((t) => ({
        programa_id: programaId,
        nome_tabela: t.nome_tabela,
        descricao: t.descricao || '',
        tipo: t.tipo,
        alias: t.alias || null,
        campos_usados: t.campos_usados || null,
      }))

      const { error: tabelasError } = await supabase
        .from('abap_tabelas')
        .insert(tabelasData)

      if (tabelasError) {
        console.error('Erro ao salvar tabelas:', tabelasError)
        // Continua mesmo com erro em tabelas
      }
    }

    // Salva campos customizados
    if (campos && campos.length > 0) {
      const camposData = campos.map((c) => ({
        programa_id: programaId,
        nome_campo: c.nome_campo,
        tabela: c.tabela || null,
        descricao: c.descricao || '',
        tipo_dado: c.tipo_dado || 'CHAR',
        tamanho: c.tamanho || null,
        obrigatorio: c.obrigatorio || false,
      }))

      const { error: camposError } = await supabase
        .from('abap_campos')
        .insert(camposData)

      if (camposError) {
        console.error('Erro ao salvar campos:', camposError)
      }
    }

    // Salva funções/módulos
    if (funcoes_modulos && funcoes_modulos.length > 0) {
      const funcoesData = funcoes_modulos.map((f) => ({
        programa_id: programaId,
        nome: f.nome,
        tipo: f.tipo,
        descricao: f.descricao || '',
        parametros: f.parametros || null,
      }))

      const { error: funcoesError } = await supabase
        .from('abap_funcoes_modulos')
        .insert(funcoesData)

      if (funcoesError) {
        console.error('Erro ao salvar funções:', funcoesError)
      }
    }

    // Salva processos
    if (processos && processos.length > 0) {
      const processosData = processos.map((p, index) => ({
        programa_id: programaId,
        ordem: index + 1,
        descricao: p,
      }))

      const { error: processosError } = await supabase
        .from('abap_processos')
        .insert(processosData)

      if (processosError) {
        console.error('Erro ao salvar processos:', processosError)
      }
    }

    // Salva regras de negócio
    if (regras_negocio && regras_negocio.length > 0) {
      const regrasData = regras_negocio.map((r, index) => ({
        programa_id: programaId,
        ordem: index + 1,
        descricao: r,
      }))

      const { error: regrasError } = await supabase
        .from('abap_regras_negocio')
        .insert(regrasData)

      if (regrasError) {
        console.error('Erro ao salvar regras de negócio:', regrasError)
      }
    }

    console.log('Programa ABAP salvo com sucesso:', programaId)

    return NextResponse.json(
      {
        success: true,
        programa_id: programaId,
        programa: programaData,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao salvar programa ABAP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}

// Endpoint para atualizar programa existente
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body: { id: string } & Partial<SalvarAbapRequest> = await request.json()
    const { id, programa } = body

    if (!id || !programa) {
      return NextResponse.json(
        { error: 'ID e dados do programa são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualiza programa
    const { data: programaData, error: programaError } = await supabase
      .from('programas_abap')
      .update({
        nome_programa: programa.nome_programa,
        tipo_programa: programa.tipo_programa,
        descricao: programa.descricao,
        status: programa.status,
        objetivo: programa.objetivo,
        logica_negocio: programa.logica_negocio,
        especificacao: programa.especificacao,
        codigo_gerado: programa.codigo_gerado,
        contexto_especifico: programa.contexto_especifico,
        perguntas_ia: programa.perguntas_ia,
        respostas_usuario: programa.respostas_usuario,
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (programaError) {
      console.error('Erro ao atualizar programa:', programaError)
      return NextResponse.json(
        { error: 'Erro ao atualizar programa', details: programaError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        programa: programaData,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar programa ABAP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}
