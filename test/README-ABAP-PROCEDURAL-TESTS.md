# 🧪 Testes de Geração ABAP Procedural

Este diretório contém arquivos JSON de teste para validar a geração de código ABAP Procedural (Puro) através da IA.

## 📋 Arquivos de Teste Disponíveis

### 1. **abap-procedural-simple-report.json** ⚡ (RECOMENDADO PARA INÍCIO)
- **Tipo:** REPORT simples
- **Complexidade:** Baixa
- **Tempo estimado:** 30-60 segundos
- **O que testa:**
  - SELECT básico
  - Exibição com WRITE
  - Tela de seleção
  - FORMS simples
- **Use quando:** Quiser validar rapidamente se o prompt procedural está funcionando

### 2. **abap-procedural-alv-report.json** 📊
- **Tipo:** ALV Report
- **Complexidade:** Média
- **Tempo estimado:** 1-2 minutos
- **O que testa:**
  - REUSE_ALV_GRID_DISPLAY
  - Field catalog
  - JOINs de tabelas
  - Cálculos e totalizadores
  - FORMS organizados
- **Use quando:** Quiser testar geração de relatórios ALV procedurais

### 3. **abap-procedural-module-pool.json** 🖥️
- **Tipo:** MODULE POOL (Programa de Tela)
- **Complexidade:** Alta
- **Tempo estimado:** 2-4 minutos
- **O que testa:**
  - Estrutura de MODULE POOL
  - Includes separados (TOP, O01, I01, F01)
  - MODULEs PBO/PAI
  - FORMS de validação
  - Tela interativa
- **Use quando:** Quiser testar a capacidade de gerar programas complexos

---

## 🚀 Como Executar os Testes

### Passo 1: Configurar o Banco de Dados

Execute o SQL para criar a tabela de configurações:

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: sql/abap_generation_config.sql
```

### Passo 2: Configurar o Estilo de Código

Opção A - Via Interface (Recomendado):
1. Acesse a plataforma
2. Vá em **Configurações** → **Geração de Código ABAP**
3. Selecione **ABAP Puro (Procedural)**
4. Clique em **Salvar Configurações**

Opção B - Via SQL direto:
```sql
INSERT INTO public.abap_generation_config (user_id, estilo_codigo)
VALUES ('seu-user-id-aqui', 'puro')
ON CONFLICT (user_id) DO UPDATE SET estilo_codigo = 'puro';
```

### Passo 3: Executar o Teste

#### Via cURL:

**Teste Simples (Recomendado primeiro):**
```bash
curl -X POST http://localhost:3000/api/abap/gerar \
  -H 'Content-Type: application/json' \
  -H 'Cookie: seu-cookie-de-autenticacao' \
  -d @test/abap-procedural-simple-report.json
```

**Teste ALV Report:**
```bash
curl -X POST http://localhost:3000/api/abap/gerar \
  -H 'Content-Type: application/json' \
  -H 'Cookie: seu-cookie-de-autenticacao' \
  -d @test/abap-procedural-alv-report.json
```

**Teste MODULE POOL:**
```bash
curl -X POST http://localhost:3000/api/abap/gerar \
  -H 'Content-Type: application/json' \
  -H 'Cookie: seu-cookie-de-autenticacao' \
  -d @test/abap-procedural-module-pool.json
```

#### Via Interface Web:

1. Acesse a plataforma
2. Clique em **Gerar Código ABAP**
3. Cole o conteúdo do `formData` do JSON de teste
4. Clique em **Gerar**

---

## ✅ O Que Validar no Código Gerado

### Para ABAP Procedural, verifique se:

#### ✅ Características OBRIGATÓRIAS (Deve ter):
- [ ] Usa `REPORT` (para reports) ou `PROGRAM` (para module pools)
- [ ] Usa `FORM ... ENDFORM` para subroutines
- [ ] Usa `PERFORM` para chamar FORMs
- [ ] Usa `REUSE_ALV_*` para ALV (NÃO CL_SALV_TABLE)
- [ ] Tem estrutura procedural clara
- [ ] Usa includes separados (para programas complexos)
- [ ] Usa MODULE para PBO/PAI (em module pools)

#### ❌ Características PROIBIDAS (NÃO deve ter):
- [ ] Classes (`CLASS ... ENDCLASS`)
- [ ] Métodos (`METHODS`, `METHOD ... ENDMETHOD`)
- [ ] `CL_*` (como `CL_SALV_TABLE`, `CL_GUI_*`)
- [ ] `NEW`, `CREATE OBJECT`
- [ ] Operador `->`
- [ ] `TRY ... CATCH ... ENDTRY` (deve usar MESSAGE com RAISING)

---

## 📊 Comparação: ABAP OO vs ABAP Puro

| Aspecto | ABAP OO | ABAP Puro |
|---------|---------|-----------|
| **ALV** | `CL_SALV_TABLE` | `REUSE_ALV_GRID_DISPLAY` |
| **Organização** | Classes e Métodos | FORMs e Includes |
| **Chamadas** | `lo_obj->method()` | `PERFORM form_name` |
| **Estrutura** | Orientado a Objetos | Procedural |
| **Compatibilidade** | SAP_BASIS >= 7.0 | Todas as versões |
| **Uso ideal** | S/4HANA, sistemas modernos | ECC 6.0, sistemas legados |

---

## 🐛 Troubleshooting

### Erro: "Não autenticado"
**Solução:** Certifique-se de estar autenticado na plataforma. Obtenha o cookie de sessão das DevTools do navegador.

### Código gerou com classes (CL_*)
**Solução:** Verifique se a configuração está em 'puro':
```sql
SELECT estilo_codigo FROM abap_generation_config WHERE user_id = 'seu-id';
```

### Timeout na geração
**Solução:** Programas complexos (MODULE POOL) podem demorar 2-4 minutos. Aumente o timeout da requisição.

### JSON inválido retornado
**Solução:** A IA pode ter retornado resposta malformada. Tente novamente ou simplifique o teste (use o simple-report.json).

---

## 📝 Estrutura Esperada do Código Gerado

### REPORT Simples:
```
Z_LISTA_MATERIAIS (arquivo único ou com includes opcionais)
```

### ALV Report:
```
Z_VENDAS_MENSAIS (principal)
├── ZINC_TOP (declarações)
└── ZINC_FORMS (subroutines)
```

### MODULE POOL:
```
ZSAP_CADASTRO_PRODUTO (principal)
├── ZSAP_CADASTRO_PRODUTO_TOP (declarações)
├── SCREEN_9000 (definição da tela)
├── ZSAP_CADASTRO_PRODUTO_O01 (módulos PBO)
├── ZSAP_CADASTRO_PRODUTO_I01 (módulos PAI)
└── ZSAP_CADASTRO_PRODUTO_F01 (forms)
```

---

## 🎯 Próximos Passos

Após validar que o código procedural está sendo gerado corretamente:

1. ✅ Teste os 3 exemplos em ordem de complexidade
2. ✅ Copie o código gerado para o SAP
3. ✅ Execute syntax check (Ctrl+F2)
4. ✅ Corrija erros de compilação (se houver)
5. ✅ Execute o programa
6. ✅ Valide o comportamento

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da API em `/api/abap/gerar`
2. Valide o JSON de entrada
3. Confirme que a configuração está em 'puro'
4. Tente o exemplo mais simples primeiro

---

**Última atualização:** 2025-12-09
**Versão do Prompt Procedural:** 1.0
