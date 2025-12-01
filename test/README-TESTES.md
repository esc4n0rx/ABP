# Guia de Testes - Sistema ABP com Múltiplos Providers

## 📋 Visão Geral

Este diretório contém cenários de teste completos para todas as funcionalidades do sistema ABP, permitindo avaliar a qualidade e precisão de cada provider de IA configurado.

## 🎯 Objetivo dos Testes

Validar que todos os providers (Groq, Gemini, OpenAI, Anthropic) geram:
- Código ABAP sintaticamente correto e funcional
- Especificações Funcionais completas e detalhadas
- Análises de debug precisas com soluções efetivas
- Respostas de chat contextualizadas e úteis

## 📁 Arquivos de Teste

### 1. `01-abap-developer-test.txt`
**Funcionalidade:** Geração de Código ABAP

**Cenários Incluídos:**
- ✅ Relatório ABAP Simples (ALV com tabelas VBRK/VBRP)
- ✅ Classe ABAP com Métodos (Calculadora de Preços)
- ✅ Function Module RFC (Buscar Pedidos)
- ✅ CDS View (Analytics de Vendas)
- ✅ BADI Implementation (Validação de Pedidos)

**Critérios de Avaliação:**
- Sintaxe e Compilação (0-10)
- Lógica de Negócio (0-10)
- Boas Práticas (0-10)
- Performance (0-10)
- Tratamento de Erros (0-10)
- Documentação (0-10)

**Total:** 60 pontos por cenário

---

### 2. `02-criacao-ef-test.txt`
**Funcionalidade:** Refinamento de Especificações Funcionais

**Cenários Incluídos:**
- ✅ EF para Relatório de Vendas (ALV Report)
- ✅ EF para Interface RFC (Integração E-commerce)
- ✅ EF para Enhancement (VA01 Validação de Crédito)
- ✅ EF para Fiori App (Aprovação Mobile de Ordens)

**Critérios de Avaliação:**
- Completude da Estrutura (0-10)
- Clareza e Detalhamento (0-10)
- Qualidade dos Objetivos (0-10)
- Regras de Negócio (0-10)
- Considerações Técnicas (0-10)
- Observações e Próximos Passos (0-10)

**Total:** 60 pontos por cenário

---

### 3. `03-debug-codigo-test.txt`
**Funcionalidade:** Análise e Debug de Código

**Cenários Incluídos:**
- ✅ Análise SMQ2 (Erro de qRFC com Timeout)
- ✅ Análise ABAP - Dump de Memória (TSV_TNEW_PAGE_ALLOC_FAILED)
- ✅ Análise ABAP - Erro de Autorização (K_LFA1)
- ✅ Análise de Cenário - Erro na MIGO (Lock/Bloqueio)
- ✅ Análise de Cenário - Transação Customizada (Update em Massa)

**Critérios de Avaliação:**
- Identificação da Causa Raiz (0-10)
- Qualidade da Solução (0-10)
- Código de Correção (0-10)
- Prevenção (0-10)
- Recursos Adicionais (0-10)
- Criticidade e Tempo (0-10)

**Total:** 60 pontos por cenário

---

### 4. `04-chat-assistente-test.txt`
**Funcionalidade:** Chat Assistente SAP

**Cenários Incluídos:**
- ✅ Dúvida Técnica (BAPI vs Function Module)
- ✅ Continuação de Conversa (Erro em BAPI - Material não estendido)
- ✅ Arquitetura (Melhor abordagem para integração)
- ✅ Debugging (Performance de Relatório ALV)
- ✅ Conceito (Migração S/4HANA)
- ✅ Código Exemplo (Validação de Crédito)
- ✅ Troubleshooting (Erro de Autorização)

**Critérios de Avaliação:**
- Precisão Técnica (0-10)
- Completude da Resposta (0-10)
- Clareza e Organização (0-10)
- Contexto e Continuidade (0-10)
- Utilidade Prática (0-10)
- Profissionalismo (0-10)

**Total:** 60 pontos por cenário

---

## 🚀 Como Executar os Testes

### Pré-requisitos

1. ✅ Banco de dados configurado (executar `sql/ai_providers.sql`)
2. ✅ Dependências instaladas (`pnpm install`)
3. ✅ Pelo menos 1 provider configurado
4. ✅ Sistema rodando (`pnpm dev`)

### Passo a Passo

#### 1. Configurar Provider
```
1. Login no sistema (http://localhost:3000)
2. Clicar no perfil → Configurações
3. Adicionar provider desejado (ex: Groq)
4. Testar conexão
5. Salvar
```

#### 2. Executar Teste ABAP
```
1. Abrir app "ABAP Developer"
2. Selecionar cenário do arquivo 01-abap-developer-test.txt
3. Preencher formulário conforme especificado
4. Gerar código
5. Avaliar resultado usando critérios do arquivo
6. Documentar pontuação e observações
```

#### 3. Executar Teste EF
```
1. Abrir app "Criação de EF"
2. Selecionar cenário do arquivo 02-criacao-ef-test.txt
3. Preencher formulário conforme especificado
4. Refinar especificação
5. Avaliar resultado usando critérios do arquivo
6. Verificar JSON válido e estrutura completa
7. Documentar pontuação e observações
```

#### 4. Executar Teste Debug
```
1. Abrir app "Debug de Código"
2. Selecionar tipo de análise (SMQ2, ABAP, ou Cenário)
3. Preencher dados conforme cenário do arquivo 03-debug-codigo-test.txt
4. Analisar
5. Avaliar solução proposta
6. Verificar se código de correção compila
7. Documentar pontuação e observações
```

#### 5. Executar Teste Chat
```
1. Abrir app "Chat"
2. Criar novo projeto ou usar chat geral
3. Enviar mensagem conforme cenário do arquivo 04-chat-assistente-test.txt
4. Avaliar resposta usando critérios
5. Para cenários com continuação, enviar próxima mensagem
6. Verificar manutenção de contexto
7. Documentar pontuação e observações
```

---

## 📊 Planilha de Resultados

Criar planilha com seguinte estrutura:

| Provider | App | Cenário | Pontuação | Observações |
|----------|-----|---------|-----------|-------------|
| Groq | ABAP | Relatório ALV | 55/60 | Código funcional, faltou validação X |
| Gemini | EF | Interface RFC | 58/60 | EF completa, boas práticas |
| ... | ... | ... | ... | ... |

---

## 🎯 Metas de Qualidade

### Pontuação Mínima Aceitável
- **ABAP Developer:** 48/60 (80%)
- **Criação de EF:** 48/60 (80%)
- **Debug de Código:** 48/60 (80%)
- **Chat Assistente:** 45/60 (75%)

### Critérios Críticos (Não pode falhar)
- ✅ Código ABAP deve compilar sem erros de sintaxe
- ✅ EF deve ter estrutura JSON válida
- ✅ Soluções de debug devem identificar causa raiz corretamente
- ✅ Chat deve manter contexto entre mensagens

---

## 🐛 Reporte de Bugs

Ao encontrar bugs ou problemas, documentar:

1. **Provider utilizado**
2. **Cenário específico**
3. **Descrição do problema**
4. **Comportamento esperado**
5. **Comportamento observado**
6. **Screenshots (se aplicável)**
7. **Código gerado (se aplicável)**

Salvar em: `test/bugs/bug-YYYY-MM-DD-HHMM.md`

---

## 📈 Análise Comparativa

Após testar todos os providers em todos os cenários, criar análise:

### Pontos Fortes de Cada Provider

**Groq (Free):**
- Velocidade: ⚡️⚡️⚡️⚡️⚡️
- Código ABAP: ?
- EFs: ?
- Debug: ?
- Chat: ?

**Gemini:**
- Velocidade: ⚡️⚡️⚡️⚡️
- Código ABAP: ?
- EFs: ?
- Debug: ?
- Chat: ?

**OpenAI:**
- Velocidade: ⚡️⚡️⚡️
- Código ABAP: ?
- EFs: ?
- Debug: ?
- Chat: ?

**Anthropic:**
- Velocidade: ⚡️⚡️⚡️
- Código ABAP: ?
- EFs: ?
- Debug: ?
- Chat: ?

### Recomendações de Uso

Baseado nos testes, sugerir:
- **Para Código ABAP complexo:** [Provider X]
- **Para EFs detalhadas:** [Provider Y]
- **Para Debug crítico:** [Provider Z]
- **Para Chat técnico:** [Provider W]
- **Para uso geral (custo-benefício):** [Provider V]

---

## ⏱️ Tempo Estimado de Testes

- **ABAP Developer:** 5 cenários × 4 providers × 15 min = 5 horas
- **Criação de EF:** 4 cenários × 4 providers × 10 min = 2.7 horas
- **Debug de Código:** 5 cenários × 4 providers × 10 min = 3.3 horas
- **Chat Assistente:** 7 cenários × 4 providers × 5 min = 2.3 horas

**Total Estimado:** ~13 horas de testes completos

**Sugestão:** Dividir testes em múltiplas sessões de 2-3 horas cada.

---

## 📝 Checklist de Testes

### Antes de Começar
- [ ] Banco de dados configurado
- [ ] Sistema rodando
- [ ] Providers configurados
- [ ] Arquivos de teste lidos
- [ ] Planilha de resultados criada

### Durante os Testes
- [ ] Anotar pontuação de cada cenário
- [ ] Capturar screenshots de resultados interessantes
- [ ] Documentar bugs encontrados
- [ ] Testar todos os providers em cada cenário
- [ ] Manter consistência nos critérios de avaliação

### Após os Testes
- [ ] Consolidar resultados na planilha
- [ ] Criar relatório comparativo
- [ ] Documentar bugs encontrados
- [ ] Sugerir melhorias no sistema
- [ ] Definir provider padrão recomendado

---

## 🔄 Atualização dos Testes

Estes cenários devem ser revisados:
- Mensalmente (novas funcionalidades)
- Quando providers são atualizados
- Quando novos modelos são lançados
- Quando bugs são corrigidos

**Última Atualização:** 01/12/2025
**Próxima Revisão:** 01/01/2026

---

## 📞 Suporte

Para dúvidas sobre os testes:
- Consultar `PROVIDERS_README.md` para detalhes técnicos
- Verificar logs do sistema em caso de erros
- Documentar problemas não resolvidos

---

**Boa sorte com os testes! 🚀**
