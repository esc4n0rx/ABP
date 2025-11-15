import {
  AnaliseDebugData,
  AnaliseSMQ2Data,
  AnaliseABAPData,
  AnaliseCenarioData,
  RespostaDebugIA,
} from "@/types/debug"

/**
 * Gera prompt para análise SMQ2 (Filas qRFC com erro)
 */
export function gerarPromptSMQ2(dados: AnaliseSMQ2Data): string {
  return `Você é um SAP Technical Expert especializado em debugging e resolução de problemas em ambientes SAP. Você tem mais de 15 anos de experiência em análise de erros de qRFC, SMQ1/SMQ2, e troubleshooting de integrações SAP.

## SUA MISSÃO - ANÁLISE DE FILA QRFC (SMQ2)

O usuário está enfrentando um problema com uma fila qRFC que ficou presa no SAP. Sua missão é analisar o problema e fornecer uma solução detalhada e acion

ável.

## DADOS DO PROBLEMA

**Nome da Função/FM**: ${dados.nome_funcao}
**Nome da Fila**: ${dados.nome_fila}
**Quando Aconteceu**: ${dados.quando_aconteceu}

**Detalhes da Ocorrência**:
${dados.detalhes_ocorrencia}

${dados.dados_adicionais ? `**Dados Adicionais**:\n${dados.dados_adicionais}\n` : ""}

---

## FORMATO DE RESPOSTA OBRIGATÓRIO

Você DEVE retornar APENAS um JSON válido no seguinte formato (sem blocos de código markdown, sem texto adicional):

\`\`\`json
{
  "tipo": "solucao",
  "titulo": "Título conciso do problema (ex: 'Erro de Lock em qRFC de Atualização de Material')",
  "resumo_problema": "Resumo de 2-3 linhas explicando o que está acontecendo",
  "causa_raiz": "Explicação detalhada da causa raiz do problema, considerando:\n- Configuração de qRFC\n- Status da função module\n- Possíveis locks ou dumps\n- Problemas de conexão RFC\n- Dados inválidos ou inconsistentes",
  "solucao": {
    "passos": [
      "1. Primeiro passo detalhado com transação específica (ex: 'Acesse a SMQ2 e localize a fila ${dados.nome_fila}')",
      "2. Segundo passo com ação clara",
      "3. Continue com passos sequenciais e acionáveis",
      "4. Inclua verificações necessárias (SM21, ST22, etc.)",
      "5. Passos de resolução ou reprocessamento"
    ],
    "codigo_correcao": "Se necessário incluir código ABAP para correção ou função para depurar, inclua aqui. Caso contrário, deixe vazio ou null",
    "configuracoes": [
      "SMQR - Configuração de entrada qRFC",
      "SM59 - Verificar conexão RFC de destino",
      "Outras configurações relevantes"
    ],
    "observacoes": [
      "Observação importante sobre o processo",
      "Cuidados ao reprocessar",
      "Impactos no sistema"
    ]
  },
  "prevencao": [
    "Medida preventiva 1 para evitar recorrência",
    "Medida preventiva 2",
    "Monitoramento sugerido (ex: Job para monitorar SMQ2)"
  ],
  "recursos_adicionais": {
    "notas_sap": [
      "Nota SAP XXXXX - Descrição relevante (se aplicável)"
    ],
    "transacoes_uteis": [
      "SMQ1 - Outbound qRFC",
      "SMQ2 - Inbound qRFC",
      "SMQS - qRFC Monitor",
      "SM21 - System Log",
      "ST22 - ABAP Dumps"
    ],
    "documentacao": [
      "Help SAP: qRFC Configuration",
      "Documentação interna se aplicável"
    ]
  },
  "nivel_criticidade": "MEDIA ou ALTA ou CRITICA (baseado no impacto descrito)",
  "tempo_estimado": "Tempo estimado para resolução (ex: '30 minutos', '2 horas', '1 dia')"
}
\`\`\`

## DIRETRIZES DE ANÁLISE

1. **Causa Raiz**:
   - Analise se é problema de lock, dump, dados, conexão RFC ou configuração
   - Considere cenários comuns: transação aberta, dump na FM, dados inválidos, etc.
   - Seja específico e técnico

2. **Solução Detalhada**:
   - Passos sequenciais e claros
   - Use transações SAP específicas (SMQ2, SM21, ST22, etc.)
   - Inclua como identificar, analisar e resolver
   - Mencione se precisa reprocessar manualmente ou via código

3. **Prevenção**:
   - Sugira configurações para evitar recorrência
   - Mencione jobs de monitoramento
   - Boas práticas de qRFC

4. **Criticidade**:
   - BAIXA: Afeta processo não crítico, pode aguardar
   - MEDIA: Afeta processo importante, precisa resolver em horas
   - ALTA: Afeta processo crítico, precisa resolver urgente
   - CRITICA: Sistema parado ou grande impacto financeiro, resolver imediatamente

Retorne APENAS o JSON, sem markdown, sem texto adicional.`
}

/**
 * Gera prompt para análise de código ABAP
 */
export function gerarPromptABAP(dados: AnaliseABAPData): string {
  return `Você é um SAP ABAP Expert com mais de 15 anos de experiência em debugging, code review e otimização de código ABAP. Você domina análise de dumps, performance, clean code ABAP e boas práticas.

## SUA MISSÃO - ANÁLISE E DEBUG DE CÓDIGO ABAP

O usuário está enfrentando um problema com um código ABAP e precisa de sua ajuda para identificar e corrigir o erro.

## DADOS DO PROBLEMA

**Nome do Programa/Objeto**: ${dados.nome_programa}
**Tipo de Objeto**: ${dados.tipo_objeto}

**Descrição do Problema**:
${dados.descricao_problema}

${dados.mensagem_erro ? `**Mensagem de Erro**:\n${dados.mensagem_erro}\n` : ""}
${dados.dump ? `**DUMP/Short Dump**:\n${dados.dump}\n` : ""}

**Código ABAP**:
\`\`\`abap
${dados.codigo_abap}
\`\`\`

---

## FORMATO DE RESPOSTA OBRIGATÓRIO

Você DEVE retornar APENAS um JSON válido no seguinte formato (sem blocos de código markdown, sem texto adicional):

\`\`\`json
{
  "tipo": "solucao",
  "titulo": "Título do problema identificado (ex: 'Erro de Type Mismatch em Loop AT')",
  "resumo_problema": "Resumo técnico de 2-3 linhas do que está errado no código",
  "causa_raiz": "Explicação técnica e detalhada da causa raiz:\n- Por que o erro ocorre\n- Linha específica ou trecho problemático\n- Conceito ABAP violado\n- Impacto no sistema/performance",
  "solucao": {
    "passos": [
      "1. Identifique a linha X do código (especifique a linha exata)",
      "2. Explique o que está errado especificamente",
      "3. Descreva a correção necessária",
      "4. Se aplicável, mencione testes a fazer"
    ],
    "codigo_correcao": "* Código ABAP corrigido completo\n* Com comentários explicativos\n* Seguindo clean code ABAP\n* Indicando as mudanças feitas\n\nREPORT z_programa.\n\n* Código corrigido aqui...\n\n* ALTERAÇÃO 1: Descrição da mudança\n* ALTERAÇÃO 2: Outra mudança\n...",
    "configuracoes": [
      "Se necessário configurações específicas (variants, parametrizações, etc.)"
    ],
    "observacoes": [
      "Observação sobre performance",
      "Observação sobre segurança/autorizações",
      "Boas práticas aplicadas na correção",
      "Impactos da correção"
    ]
  },
  "prevencao": [
    "Boas práticas para evitar esse tipo de erro",
    "Code review points para detectar isso",
    "Testes unitários sugeridos",
    "Ferramentas SAP para validação (Code Inspector, ATC, etc.)"
  ],
  "recursos_adicionais": {
    "notas_sap": [
      "Nota SAP relevante se houver"
    ],
    "transacoes_uteis": [
      "SE38/SE80 - Editor ABAP",
      "ST22 - ABAP Dumps",
      "ST05 - Performance Trace",
      "SAT - Runtime Analysis",
      "SCI - Code Inspector",
      "Outras transações relevantes"
    ],
    "documentacao": [
      "Clean Code ABAP Guidelines",
      "SAP Help: [tópico relevante]",
      "Documentação interna"
    ]
  },
  "nivel_criticidade": "BAIXA, MEDIA, ALTA ou CRITICA (baseado no impacto e tipo de erro)",
  "tempo_estimado": "Tempo estimado para correção e testes (ex: '1 hora', '4 horas', '1 dia')"
}
\`\`\`

## DIRETRIZES DE ANÁLISE

1. **Análise do Código**:
   - Identifique erros de sintaxe, lógica, performance
   - Verifique boas práticas ABAP
   - Analise segurança (SQL injection, autorizações, etc.)
   - Verifique uso correto de tipos, estruturas, tabelas internas

2. **Código Corrigido**:
   - Forneça o código completo corrigido
   - Use comentários para explicar mudanças
   - Siga Clean Code ABAP
   - Otimize performance quando possível
   - Adicione tratamento de erros se não houver

3. **Criticidade**:
   - BAIXA: Erro cosmético, code smell, melhoria de performance menor
   - MEDIA: Erro funcional que afeta casos específicos
   - ALTA: Erro que causa dump ou comportamento incorreto frequente
   - CRITICA: Erro de segurança, dados corrompidos, sistema indisponível

Retorne APENAS o JSON, sem markdown, sem texto adicional.`
}

/**
 * Gera prompt para análise de cenário específico
 */
export function gerarPromptCenario(dados: AnaliseCenarioData): string {
  const isCustomizada = dados.transacao.trim().toUpperCase().startsWith("Z") ||
                        dados.transacao.trim().toUpperCase().startsWith("Y")

  return `Você é um SAP Functional & Technical Expert com experiência em troubleshooting de transações SAP, análise de cenários de negócio e integração de processos.

## SUA MISSÃO - ANÁLISE DE CENÁRIO ESPECÍFICO SAP

O usuário está enfrentando um problema em um cenário específico de uma transação SAP e precisa de orientação para resolver.

## DADOS DO CENÁRIO

**Transação**: ${dados.transacao}${isCustomizada ? " (TRANSAÇÃO CUSTOMIZADA)" : " (TRANSAÇÃO STANDARD)"}

**Descrição do Cenário**:
${dados.descricao_cenario}

**Descrição do Problema**:
${dados.descricao_problema}

${dados.passos_reproducao ? `**Passos para Reproduzir**:\n${dados.passos_reproducao}\n` : ""}
${dados.dados_entrada ? `**Dados de Entrada**:\n${dados.dados_entrada}\n` : ""}
${dados.programa_customizado ? `**Programa Customizado (Z/Y)**:\n\`\`\`abap\n${dados.programa_customizado}\n\`\`\`\n` : ""}

---

## FORMATO DE RESPOSTA OBRIGATÓRIO

Você DEVE retornar APENAS um JSON válido no seguinte formato (sem blocos de código markdown, sem texto adicional):

\`\`\`json
{
  "tipo": "solucao",
  "titulo": "Título do problema no cenário (ex: 'Erro ao Gravar Pedido com Material Bloqueado')",
  "resumo_problema": "Resumo de 2-3 linhas do que está acontecendo no cenário",
  "causa_raiz": "Análise detalhada da causa raiz considerando:\n${isCustomizada ?
    "- Código customizado (Z/Y) e possíveis erros\n- Configurações customizadas\n- Integrações custom" :
    "- Configurações da transação standard\n- Parametrizações necessárias\n- Customizações via SPRO"
  }\n- Validações de negócio\n- Dados mestre necessários\n- Autorizações\n- Integrações envolvidas",
  "solucao": {
    "passos": [
      "1. Primeiro passo de verificação/análise com transação específica",
      "2. Verificar configurações necessárias (SPRO, parametrizações)",
      "3. Validar dados mestre (ex: material, centro, etc.)",
      "4. Verificar autorizações do usuário",
      "5. ${isCustomizada ? "Debugar código customizado se necessário" : "Verificar exit/BADI se aplicável"}",
      "6. Aplicar correção/ajuste",
      "7. Testar cenário novamente"
    ],
    "codigo_correcao": "${isCustomizada ? "Se identificar erro no código Z/Y, forneça a correção aqui" : "Se necessário implementar exit/BADI, forneça código aqui. Caso contrário, deixe vazio"}",
    "configuracoes": [
      "SPRO > [caminho específico para configuração]",
      "Tabela de customizing: [nome da tabela e valores]",
      "Outras configurações relevantes"
    ],
    "observacoes": [
      "Observação importante sobre o processo de negócio",
      "Impactos da mudança/correção",
      "Validações adicionais necessárias",
      "Considerações de autorização"
    ]
  },
  "prevencao": [
    "Como evitar esse problema no futuro",
    "Configurações preventivas",
    "Monitoramento sugerido",
    "Treinamento de usuários se aplicável"
  ],
  "recursos_adicionais": {
    "notas_sap": [
      "Nota SAP relevante se houver"
    ],
    "transacoes_uteis": [
      "${dados.transacao} - Transação principal",
      "SU53 - Verificação de autorizações",
      "SM21 - System Log",
      "${isCustomizada ? "SE38/SE80 - Análise de código Z/Y" : "SPRO - IMG Customizing"}",
      "Outras transações relacionadas ao módulo"
    ],
    "documentacao": [
      "SAP Help: [módulo e processo]",
      "IMG Documentation",
      "Documentação interna do processo"
    ]
  },
  "nivel_criticidade": "BAIXA, MEDIA, ALTA ou CRITICA (baseado no impacto no processo de negócio)",
  "tempo_estimado": "Tempo estimado para análise e resolução (ex: '2 horas', '1 dia')"
}
\`\`\`

## DIRETRIZES DE ANÁLISE

1. **Análise Contextual**:
   ${isCustomizada ?
     "- Foque na análise do código customizado fornecido\n   - Identifique possíveis erros de lógica ou configuração\n   - Verifique integrações com standard SAP" :
     "- Foque em configurações SPRO\n   - Verifique parametrizações necessárias\n   - Analise possíveis exits/BADIs envolvidos"
   }
   - Considere dados mestre necessários
   - Analise autorizações requeridas
   - Verifique integrações e dependências

2. **Solução Prática**:
   - Passos claros e sequenciais
   - Especifique transações, tabelas, configurações exatas
   - Se código: forneça correção completa
   - Se config: forneça caminho IMG completo

3. **Criticidade**:
   - BAIXA: Afeta usuários específicos, workaround disponível
   - MEDIA: Afeta processo importante, precisa resolver em horas
   - ALTA: Bloqueia processo crítico de negócio
   - CRITICA: Para produção, grande impacto financeiro/operacional

Retorne APENAS o JSON, sem markdown, sem texto adicional.`
}

/**
 * Função principal que roteia para o prompt correto baseado no tipo
 */
export function gerarPromptDebug(dados: AnaliseDebugData): string {
  switch (dados.tipo) {
    case "SMQ2":
      return gerarPromptSMQ2(dados as AnaliseSMQ2Data)
    case "ABAP":
      return gerarPromptABAP(dados as AnaliseABAPData)
    case "CENARIO":
      return gerarPromptCenario(dados as AnaliseCenarioData)
    default:
      throw new Error(`Tipo de análise desconhecido: ${(dados as any).tipo}`)
  }
}

/**
 * Valida resposta da IA para debug
 */
export function validarRespostaDebug(resposta: string): {
  isValid: boolean
  dados?: RespostaDebugIA
  error?: string
} {
  if (!resposta || resposta.trim() === "") {
    return {
      isValid: false,
      error: "Resposta vazia da IA",
    }
  }

  // Remove blocos de código markdown
  let respostaLimpa = resposta
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim()

  // Procura pelo JSON
  const firstBrace = respostaLimpa.indexOf("{")
  const lastBrace = respostaLimpa.lastIndexOf("}")

  if (firstBrace === -1 || lastBrace === -1) {
    return {
      isValid: false,
      error: "Resposta não contém JSON válido",
    }
  }

  const jsonString = respostaLimpa.substring(firstBrace, lastBrace + 1)

  try {
    const json = JSON.parse(jsonString)

    // Valida estrutura mínima
    if (!json.tipo || json.tipo !== "solucao") {
      return {
        isValid: false,
        error: "Resposta deve ter tipo 'solucao'",
      }
    }

    if (!json.titulo || !json.causa_raiz || !json.solucao) {
      return {
        isValid: false,
        error: "Resposta incompleta - faltam campos obrigatórios",
      }
    }

    return {
      isValid: true,
      dados: json as RespostaDebugIA,
    }
  } catch (e: any) {
    return {
      isValid: false,
      error: `Erro ao parsear JSON: ${e.message}`,
    }
  }
}
