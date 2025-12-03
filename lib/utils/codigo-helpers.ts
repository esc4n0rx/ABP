import {
  CodigoGerado,
  CodigoAdicional,
  TipoArtefatoABAP,
  EstruturaCodigo,
  ArquivoNode,
  GrafoDependencias,
  TipoProgramaABAP
} from '@/types/abap'

// Agrupa códigos adicionais por categoria
export interface CodigosPorCategoria {
  includes: CodigoAdicional[]
  classes: CodigoAdicional[]
  screens: CodigoAdicional[]
  cds: CodigoAdicional[]
  forms: CodigoAdicional[]
  tests: CodigoAdicional[]
  outros: CodigoAdicional[]
}

export function agruparPorCategoria(codigos?: CodigoAdicional[]): CodigosPorCategoria {
  if (!codigos || codigos.length === 0) {
    return {
      includes: [],
      classes: [],
      screens: [],
      cds: [],
      forms: [],
      tests: [],
      outros: []
    }
  }

  const grupos: CodigosPorCategoria = {
    includes: [],
    classes: [],
    screens: [],
    cds: [],
    forms: [],
    tests: [],
    outros: []
  }

  codigos.forEach(codigo => {
    const tipo = codigo.tipo

    if (tipo.includes('INCLUDE')) {
      grupos.includes.push(codigo)
    } else if (tipo.includes('CLASS')) {
      grupos.classes.push(codigo)
    } else if (tipo.includes('SCREEN')) {
      grupos.screens.push(codigo)
    } else if (tipo.includes('CDS')) {
      grupos.cds.push(codigo)
    } else if (tipo.includes('FORM') || tipo === TipoArtefatoABAP.SMARTFORM || tipo === TipoArtefatoABAP.ADOBE_FORM || tipo === TipoArtefatoABAP.SAPSCRIPT) {
      grupos.forms.push(codigo)
    } else if (tipo.includes('TEST')) {
      grupos.tests.push(codigo)
    } else {
      grupos.outros.push(codigo)
    }
  })

  return grupos
}

// Calcula estatísticas do código gerado
export interface EstatisticasCodigo {
  total_arquivos: number
  total_linhas: number
  total_caracteres: number
  tipos_unicos: TipoArtefatoABAP[]
  arquivo_maior: { nome: string; linhas: number } | null
  complexidade: 'baixa' | 'media' | 'alta'
}

export function calcularEstatisticas(codigo: CodigoGerado): EstatisticasCodigo {
  const linhasPrincipal = contarLinhas(codigo.codigo_principal)
  const caracteresPrincipal = codigo.codigo_principal.length

  let linhasAdicionais = 0
  let caracteresAdicionais = 0
  let arquivoMaior: { nome: string; linhas: number } | null = null

  const tiposUnicos = new Set<TipoArtefatoABAP>()

  codigo.codigos_adicionais?.forEach(adicional => {
    const linhas = adicional.linhas || contarLinhas(adicional.codigo)
    linhasAdicionais += linhas
    caracteresAdicionais += adicional.codigo.length
    tiposUnicos.add(adicional.tipo)

    if (!arquivoMaior || linhas > arquivoMaior.linhas) {
      arquivoMaior = { nome: adicional.nome, linhas }
    }
  })

  const totalLinhas = linhasPrincipal + linhasAdicionais
  const totalArquivos = 1 + (codigo.codigos_adicionais?.length || 0)

  let complexidade: 'baixa' | 'media' | 'alta' = 'baixa'
  if (totalLinhas > 500 || totalArquivos > 5) {
    complexidade = 'alta'
  } else if (totalLinhas > 200 || totalArquivos > 3) {
    complexidade = 'media'
  }

  return {
    total_arquivos: totalArquivos,
    total_linhas: totalLinhas,
    total_caracteres: caracteresPrincipal + caracteresAdicionais,
    tipos_unicos: Array.from(tiposUnicos),
    arquivo_maior: arquivoMaior || { nome: 'Código Principal', linhas: linhasPrincipal },
    complexidade
  }
}

// Conta linhas de código
export function contarLinhas(codigo: string): number {
  if (!codigo) return 0
  return codigo.split('\n').length
}

// Ordena códigos por dependência (topological sort)
export function ordenarPorDependencia(codigos: CodigoAdicional[]): CodigoAdicional[] {
  if (!codigos || codigos.length === 0) return []

  // Cria um mapa de nome -> código
  const codigoMap = new Map<string, CodigoAdicional>()
  codigos.forEach(c => codigoMap.set(c.nome, c))

  // Cria grafo de dependências
  const grafo = new Map<string, string[]>()
  const grauEntrada = new Map<string, number>()

  codigos.forEach(codigo => {
    grafo.set(codigo.nome, codigo.dependencias || [])
    grauEntrada.set(codigo.nome, 0)
  })

  // Calcula grau de entrada
  codigos.forEach(codigo => {
    ;(codigo.dependencias || []).forEach(dep => {
      if (grauEntrada.has(dep)) {
        grauEntrada.set(dep, (grauEntrada.get(dep) || 0) + 1)
      }
    })
  })

  // Topological sort (Kahn's algorithm)
  const resultado: CodigoAdicional[] = []
  const fila: string[] = []

  // Adiciona nós sem dependências
  grauEntrada.forEach((grau, nome) => {
    if (grau === 0) fila.push(nome)
  })

  while (fila.length > 0) {
    const nomeAtual = fila.shift()!
    const codigoAtual = codigoMap.get(nomeAtual)
    if (codigoAtual) {
      resultado.push(codigoAtual)

      // Reduz grau de entrada dos dependentes
      ;(codigoAtual.dependencias || []).forEach(dep => {
        const grauAtual = grauEntrada.get(dep) || 0
        grauEntrada.set(dep, grauAtual - 1)
        if (grauAtual - 1 === 0) {
          fila.push(dep)
        }
      })
    }
  }

  // Se não conseguiu ordenar todos (ciclo), retorna original
  return resultado.length === codigos.length ? resultado : codigos
}

// Gera instruções de instalação no SAP
export function gerarInstrucoesInstalacao(
  tipo: TipoProgramaABAP,
  nomePrincipal: string,
  codigos?: CodigoAdicional[]
): string[] {
  const instrucoes: string[] = []

  // Instruções baseadas no tipo
  if (tipo === 'REPORT' || tipo === 'ALV_REPORT' || tipo === 'INTERACTIVE_REPORT') {
    instrucoes.push('1. Acesse a transação SE38 (ABAP Editor)')
    instrucoes.push(`2. Crie o programa principal: ${nomePrincipal}`)

    if (codigos && codigos.length > 0) {
      const includes = codigos.filter(c => c.tipo.includes('INCLUDE'))
      if (includes.length > 0) {
        instrucoes.push('3. Crie os includes necessários:')
        includes.forEach((inc, idx) => {
          instrucoes.push(`   ${idx + 1}. ${inc.nome} - ${inc.descricao}`)
        })
        instrucoes.push('4. Copie o código de cada include e ative')
      }
      instrucoes.push(`${includes.length > 0 ? '5' : '3'}. Copie o código principal do programa`)
      instrucoes.push(`${includes.length > 0 ? '6' : '4'}. Ative o programa (Ctrl+F3)`)
      instrucoes.push(`${includes.length > 0 ? '7' : '5'}. Teste o programa (F8)`)
    } else {
      instrucoes.push('3. Copie o código principal')
      instrucoes.push('4. Ative o programa (Ctrl+F3)')
      instrucoes.push('5. Teste via SE38 (F8)')
    }
  } else if (tipo === 'CLASS') {
    instrucoes.push('1. Acesse a transação SE24 (Class Builder)')
    instrucoes.push(`2. Crie a classe: ${nomePrincipal}`)
    instrucoes.push('3. Copie a definição da classe (seção PUBLIC/PROTECTED/PRIVATE)')
    instrucoes.push('4. Copie a implementação dos métodos')
    instrucoes.push('5. Ative a classe (Ctrl+F3)')
    instrucoes.push('6. Execute os testes unitários se houver')
  } else if (tipo === 'FUNCTION_MODULE' || tipo === 'RFC_FUNCTION') {
    instrucoes.push('1. Acesse a transação SE37 (Function Builder)')
    instrucoes.push(`2. Crie o function module: ${nomePrincipal}`)
    instrucoes.push('3. Configure IMPORTING, EXPORTING, CHANGING, TABLES e EXCEPTIONS')
    instrucoes.push('4. Copie o código na aba "Source code"')
    instrucoes.push('5. Ative o function module (Ctrl+F3)')
    instrucoes.push('6. Teste via SE37 (F8)')
  } else if (tipo === 'CDS_VIEW') {
    instrucoes.push('1. Acesse a Eclipse ADT (ABAP Development Tools)')
    instrucoes.push('2. Crie um novo Data Definition')
    instrucoes.push(`3. Nome: ${nomePrincipal}`)
    instrucoes.push('4. Copie o código DDL completo')
    instrucoes.push('5. Salve e ative (Ctrl+F3)')
    instrucoes.push('6. Teste via Data Preview')
  } else if (tipo === 'DIALOG_PROGRAM' || tipo === 'MODULE_POOL') {
    instrucoes.push('1. Acesse a transação SE80 (Object Navigator)')
    instrucoes.push(`2. Crie programa do tipo "Module Pool": ${nomePrincipal}`)
    instrucoes.push('3. Crie as screens conforme especificado')
    instrucoes.push('4. Configure PBO e PAI de cada screen')
    instrucoes.push('5. Crie os includes necessários (TOP, modules, forms)')
    instrucoes.push('6. Copie todo o código')
    instrucoes.push('7. Ative todos os objetos')
    instrucoes.push('8. Teste via SE80')
  } else {
    // Instruções genéricas
    instrucoes.push(`1. Acesse a transação apropriada para ${tipo}`)
    instrucoes.push(`2. Crie o objeto: ${nomePrincipal}`)
    instrucoes.push('3. Copie o código gerado')
    instrucoes.push('4. Ative o objeto')
    instrucoes.push('5. Teste o funcionamento')
  }

  // Adiciona nota sobre dependências
  if (codigos && codigos.some(c => c.dependencias && c.dependencias.length > 0)) {
    instrucoes.push('')
    instrucoes.push('⚠️ ATENÇÃO: Respeite a ordem de criação devido às dependências entre arquivos')
  }

  return instrucoes
}

// Gera código Mermaid para grafo de dependências
export function gerarCodigoMermaid(codigos: CodigoAdicional[], nomePrincipal: string): string {
  let mermaid = 'graph TD\n'

  // Node principal
  mermaid += `  MAIN["${nomePrincipal}<br/>MAIN_PROGRAM"]\n`

  // Nodes adicionais
  codigos.forEach((codigo, idx) => {
    const id = `NODE${idx}`
    const label = `${codigo.nome}<br/>${codigo.tipo}`
    mermaid += `  ${id}["${label}"]\n`
  })

  // Edges (dependências)
  codigos.forEach((codigo, idx) => {
    const id = `NODE${idx}`

    // Se o principal usa este código
    if (codigo.usado_por?.includes(nomePrincipal)) {
      mermaid += `  MAIN -->|usa| ${id}\n`
    }

    // Dependências deste código
    codigo.dependencias?.forEach(dep => {
      const depIdx = codigos.findIndex(c => c.nome === dep)
      if (depIdx >= 0) {
        mermaid += `  ${id} -->|depende| NODE${depIdx}\n`
      }
    })
  })

  return mermaid
}

// Monta estrutura de arquivos em árvore
export function montarArvoreArquivos(
  nomePrincipal: string,
  tipoPrincipal: TipoProgramaABAP,
  codigos?: CodigoAdicional[]
): ArquivoNode[] {
  const raiz: ArquivoNode = {
    id: 'main',
    nome: nomePrincipal,
    tipo: TipoArtefatoABAP.MAIN_PROGRAM,
    isPrincipal: true
  }

  if (!codigos || codigos.length === 0) {
    return [raiz]
  }

  const grupos = agruparPorCategoria(codigos)

  const children: ArquivoNode[] = []

  // Grupo Includes
  if (grupos.includes.length > 0) {
    const includesNode: ArquivoNode = {
      id: 'includes',
      nome: 'Includes',
      tipo: TipoArtefatoABAP.INCLUDE_TOP,
      isPrincipal: false,
      children: grupos.includes.map((inc, idx) => ({
        id: `include-${idx}`,
        nome: inc.nome,
        tipo: inc.tipo,
        isPrincipal: false,
        linhas: inc.linhas || contarLinhas(inc.codigo)
      }))
    }
    children.push(includesNode)
  }

  // Grupo Classes
  if (grupos.classes.length > 0) {
    const classesNode: ArquivoNode = {
      id: 'classes',
      nome: 'Classes',
      tipo: TipoArtefatoABAP.CLASS_LOCAL,
      isPrincipal: false,
      children: grupos.classes.map((cls, idx) => ({
        id: `class-${idx}`,
        nome: cls.nome,
        tipo: cls.tipo,
        isPrincipal: false,
        linhas: cls.linhas || contarLinhas(cls.codigo)
      }))
    }
    children.push(classesNode)
  }

  // Grupo Screens
  if (grupos.screens.length > 0) {
    const screensNode: ArquivoNode = {
      id: 'screens',
      nome: 'Screens',
      tipo: TipoArtefatoABAP.SCREEN,
      isPrincipal: false,
      children: grupos.screens.map((scr, idx) => ({
        id: `screen-${idx}`,
        nome: scr.nome,
        tipo: scr.tipo,
        isPrincipal: false,
        linhas: scr.linhas || contarLinhas(scr.codigo)
      }))
    }
    children.push(screensNode)
  }

  // Grupo Forms
  if (grupos.forms.length > 0) {
    const formsNode: ArquivoNode = {
      id: 'forms',
      nome: 'Formulários',
      tipo: TipoArtefatoABAP.SMARTFORM,
      isPrincipal: false,
      children: grupos.forms.map((frm, idx) => ({
        id: `form-${idx}`,
        nome: frm.nome,
        tipo: frm.tipo,
        isPrincipal: false,
        linhas: frm.linhas || contarLinhas(frm.codigo)
      }))
    }
    children.push(formsNode)
  }

  // Grupo Tests
  if (grupos.tests.length > 0) {
    const testsNode: ArquivoNode = {
      id: 'tests',
      nome: 'Testes',
      tipo: TipoArtefatoABAP.UNIT_TEST,
      isPrincipal: false,
      children: grupos.tests.map((tst, idx) => ({
        id: `test-${idx}`,
        nome: tst.nome,
        tipo: tst.tipo,
        isPrincipal: false,
        linhas: tst.linhas || contarLinhas(tst.codigo)
      }))
    }
    children.push(testsNode)
  }

  // Outros
  if (grupos.outros.length > 0) {
    grupos.outros.forEach((outro, idx) => {
      children.push({
        id: `outro-${idx}`,
        nome: outro.nome,
        tipo: outro.tipo,
        isPrincipal: false,
        linhas: outro.linhas || contarLinhas(outro.codigo)
      })
    })
  }

  raiz.children = children

  return [raiz]
}

// Monta estrutura completa de código
export function montarEstruturaCodigo(
  codigo: CodigoGerado,
  tipoPrograma: TipoProgramaABAP,
  nomePrincipal: string
): EstruturaCodigo {
  const arvoreArquivos = montarArvoreArquivos(
    nomePrincipal,
    tipoPrograma,
    codigo.codigos_adicionais
  )

  const ordemCriacao = ordenarPorDependencia(codigo.codigos_adicionais || [])
    .map(c => c.nome)

  ordemCriacao.unshift(nomePrincipal) // Principal sempre primeiro

  const instrucoesInstalacao = gerarInstrucoesInstalacao(
    tipoPrograma,
    nomePrincipal,
    codigo.codigos_adicionais
  )

  const grafoDependencias: GrafoDependencias | undefined =
    codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0
      ? {
          nodes: [
            { id: 'main', label: nomePrincipal, tipo: TipoArtefatoABAP.MAIN_PROGRAM },
            ...codigo.codigos_adicionais.map((c, idx) => ({
              id: `node-${idx}`,
              label: c.nome,
              tipo: c.tipo
            }))
          ],
          edges: codigo.codigos_adicionais.flatMap((c, idx) =>
            (c.dependencias || []).map(dep => {
              const depIdx = codigo.codigos_adicionais!.findIndex(cd => cd.nome === dep)
              return {
                from: `node-${idx}`,
                to: depIdx >= 0 ? `node-${depIdx}` : 'main',
                tipo: 'usa' as const
              }
            })
          )
        }
      : undefined

  return {
    tipo_programa: tipoPrograma,
    arvore_arquivos: arvoreArquivos,
    grafo_dependencias: grafoDependencias,
    ordem_criacao: ordemCriacao,
    instrucoes_instalacao: instrucoesInstalacao
  }
}

// Exporta todo o código como um único arquivo
export function exportarCodigoCompleto(codigo: CodigoGerado, nomePrincipal: string): string {
  let resultado = `*&---------------------------------------------------------------------*\n`
  resultado += `*& Código Completo: ${nomePrincipal}\n`
  resultado += `*& Gerado em: ${new Date().toLocaleString('pt-BR')}\n`
  resultado += `*&---------------------------------------------------------------------*\n\n`

  resultado += `*& ===== CÓDIGO PRINCIPAL =====\n`
  resultado += codigo.codigo_principal
  resultado += `\n\n`

  if (codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0) {
    codigo.codigos_adicionais.forEach((adicional, idx) => {
      resultado += `*&---------------------------------------------------------------------*\n`
      resultado += `*& ${adicional.nome} (${adicional.tipo})\n`
      resultado += `*& ${adicional.descricao || ''}\n`
      resultado += `*&---------------------------------------------------------------------*\n\n`
      resultado += adicional.codigo
      resultado += `\n\n`
    })
  }

  return resultado
}
