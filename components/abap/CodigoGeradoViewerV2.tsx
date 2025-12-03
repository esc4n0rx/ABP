"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Copy,
  Download,
  Code2,
  FileCode,
  Book,
  FolderTree,
  Network,
  FileText,
  ChevronDown,
  ChevronRight,
  Info
} from "lucide-react"
import toast from "react-hot-toast"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { CodigoGerado, TipoProgramaABAP, TipoArtefatoABAP } from "@/types/abap"
import {
  agruparPorCategoria,
  calcularEstatisticas,
  montarEstruturaCodigo,
  gerarCodigoMermaid,
  exportarCodigoCompleto,
  contarLinhas
} from "@/lib/utils/codigo-helpers"

interface CodigoGeradoViewerV2Props {
  codigo: CodigoGerado
  tipoPrograma: TipoProgramaABAP
  nomePrincipal: string
}

export function CodigoGeradoViewerV2({
  codigo,
  tipoPrograma,
  nomePrincipal
}: CodigoGeradoViewerV2Props) {
  const [activeTab, setActiveTab] = useState("visao-geral")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["main"]))

  // Calcula estatísticas e estrutura
  const estatisticas = useMemo(
    () => calcularEstatisticas(codigo),
    [codigo]
  )

  const estrutura = useMemo(
    () => montarEstruturaCodigo(codigo, tipoPrograma, nomePrincipal),
    [codigo, tipoPrograma, nomePrincipal]
  )

  const grupos = useMemo(
    () => agruparPorCategoria(codigo.codigos_adicionais),
    [codigo.codigos_adicionais]
  )

  const codigoMermaid = useMemo(
    () => codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0
      ? gerarCodigoMermaid(codigo.codigos_adicionais, nomePrincipal)
      : null,
    [codigo.codigos_adicionais, nomePrincipal]
  )

  const handleCopyCodigo = (code: string, nome?: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Código ${nome || "principal"} copiado!`)
  }

  const handleDownloadCodigo = (code: string, nome: string) => {
    const element = document.createElement("a")
    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${nome}.abap`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success(`Arquivo ${nome}.abap baixado!`)
  }

  const handleDownloadTudo = () => {
    const conteudoCompleto = exportarCodigoCompleto(codigo, nomePrincipal)

    const element = document.createElement("a")
    const file = new Blob([conteudoCompleto], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${nomePrincipal}_completo.abap`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Código completo baixado!")
  }

  const handleDownloadInstrucoes = () => {
    const instrucoes = estrutura.instrucoes_instalacao.join("\n")
    const element = document.createElement("a")
    const file = new Blob([instrucoes], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${nomePrincipal}_instrucoes.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Instruções baixadas!")
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const getIconForTipo = (tipo: TipoArtefatoABAP) => {
    if (tipo.includes('CLASS')) return '🎨'
    if (tipo.includes('INCLUDE')) return '📋'
    if (tipo.includes('SCREEN')) return '📱'
    if (tipo.includes('FORM')) return '📄'
    if (tipo.includes('TEST')) return '🧪'
    if (tipo.includes('CDS')) return '🗄️'
    return '📦'
  }

  const getBadgeVariantForComplexidade = (complexidade: string) => {
    switch (complexidade) {
      case 'baixa': return 'default'
      case 'media': return 'secondary'
      case 'alta': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header de Sucesso */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-green-50">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-green-900">
              {nomePrincipal}
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Código gerado com sucesso • {estatisticas.total_arquivos} arquivo(s) • {estatisticas.total_linhas} linhas
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getBadgeVariantForComplexidade(estatisticas.complexidade)}>
              Complexidade: {estatisticas.complexidade}
            </Badge>
            <span className="text-xs text-gray-500">
              {estatisticas.tipos_unicos.length} tipo(s) de artefato
            </span>
          </div>
        </div>
      </div>

      {/* Tabs de Visualização */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger value="visao-geral">
            <Info className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="arquivos">
            <FileCode className="h-4 w-4 mr-2" />
            Arquivos ({estatisticas.total_arquivos})
          </TabsTrigger>
          <TabsTrigger value="estrutura">
            <FolderTree className="h-4 w-4 mr-2" />
            Estrutura
          </TabsTrigger>
          {codigoMermaid && (
            <TabsTrigger value="dependencias">
              <Network className="h-4 w-4 mr-2" />
              Dependências
            </TabsTrigger>
          )}
          {codigo.documentacao && (
            <TabsTrigger value="documentacao">
              <Book className="h-4 w-4 mr-2" />
              Documentação
            </TabsTrigger>
          )}
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Arquivos</p>
                  <p className="text-3xl font-bold text-gray-900">{estatisticas.total_arquivos}</p>
                </div>
                <FileCode className="h-10 w-10 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Linhas</p>
                  <p className="text-3xl font-bold text-gray-900">{estatisticas.total_linhas}</p>
                </div>
                <Code2 className="h-10 w-10 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Arquivo Maior</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {estatisticas.arquivo_maior?.nome}
                  </p>
                  <p className="text-sm text-gray-500">{estatisticas.arquivo_maior?.linhas} linhas</p>
                </div>
                <FileText className="h-10 w-10 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Resumo por Categoria */}
          {codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Arquivos por Categoria</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {grupos.includes.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📋</span>
                      <span className="font-medium">Includes</span>
                    </div>
                    <p className="text-2xl font-bold">{grupos.includes.length}</p>
                  </Card>
                )}
                {grupos.classes.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎨</span>
                      <span className="font-medium">Classes</span>
                    </div>
                    <p className="text-2xl font-bold">{grupos.classes.length}</p>
                  </Card>
                )}
                {grupos.screens.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📱</span>
                      <span className="font-medium">Screens</span>
                    </div>
                    <p className="text-2xl font-bold">{grupos.screens.length}</p>
                  </Card>
                )}
                {grupos.forms.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📄</span>
                      <span className="font-medium">Formulários</span>
                    </div>
                    <p className="text-2xl font-bold">{grupos.forms.length}</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Instruções de Instalação */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Instruções de Instalação no SAP</h3>
              <Button size="sm" variant="outline" onClick={handleDownloadInstrucoes}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Instruções
              </Button>
            </div>
            <ol className="space-y-2 text-gray-700">
              {estrutura.instrucoes_instalacao.map((instrucao, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-gray-400">{instrucao.startsWith('⚠️') ? '' : `${idx + 1}.`}</span>
                  <span className={instrucao.startsWith('⚠️') ? 'text-amber-600 font-medium' : ''}>
                    {instrucao.replace(/^\d+\.\s*/, '')}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>

        {/* Arquivos */}
        <TabsContent value="arquivos" className="space-y-6">
          {/* Código Principal */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{nomePrincipal}</h4>
                  <p className="text-sm text-gray-500">Programa Principal • {contarLinhas(codigo.codigo_principal)} linhas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyCodigo(codigo.codigo_principal, nomePrincipal)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadCodigo(codigo.codigo_principal, nomePrincipal)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </div>

            <Card className="p-0 overflow-hidden">
              <SyntaxHighlighter
                language="abap"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  maxHeight: "500px",
                }}
                showLineNumbers
              >
                {codigo.codigo_principal}
              </SyntaxHighlighter>
            </Card>
          </Card>

          {/* Códigos Agrupados por Categoria */}
          {codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0 && (
            <Accordion type="multiple" className="w-full">
              {Object.entries(grupos).map(([categoria, codigos]) => {
                if (codigos.length === 0) return null

                const titulo = categoria.charAt(0).toUpperCase() + categoria.slice(1)
                const icon = categoria === 'includes' ? '📋' :
                            categoria === 'classes' ? '🎨' :
                            categoria === 'screens' ? '📱' :
                            categoria === 'forms' ? '📄' :
                            categoria === 'tests' ? '🧪' : '📦'

                return (
                  <AccordionItem key={categoria} value={categoria}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{icon}</span>
                        <span className="font-medium">{titulo} ({codigos.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {codigos.map((adicional, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h5 className="font-semibold text-gray-900">{adicional.nome}</h5>
                              <Badge variant="outline">{adicional.tipo}</Badge>
                              <span className="text-sm text-gray-500">
                                {adicional.linhas || contarLinhas(adicional.codigo)} linhas
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyCodigo(adicional.codigo, adicional.nome)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadCodigo(adicional.codigo, adicional.nome)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {adicional.descricao && (
                            <p className="text-sm text-gray-600 mb-3">{adicional.descricao}</p>
                          )}

                          {adicional.dependencias && adicional.dependencias.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500">
                                Depende de: {adicional.dependencias.join(', ')}
                              </p>
                            </div>
                          )}

                          <Card className="p-0 overflow-hidden">
                            <SyntaxHighlighter
                              language="abap"
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                maxHeight: "400px",
                              }}
                              showLineNumbers
                            >
                              {adicional.codigo}
                            </SyntaxHighlighter>
                          </Card>
                        </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        {/* Estrutura de Árvore */}
        <TabsContent value="estrutura" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Árvore de Arquivos</h3>
            <div className="font-mono text-sm space-y-1">
              {estrutura.arvore_arquivos.map(node => (
                <div key={node.id}>
                  <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <span className="text-xl">{getIconForTipo(node.tipo)}</span>
                    <span className="font-semibold">{node.nome}</span>
                    {node.isPrincipal && <Badge variant="default">Principal</Badge>}
                    {node.linhas && <span className="text-gray-500">• {node.linhas} linhas</span>}
                  </div>

                  {node.children && node.children.length > 0 && (
                    <div className="ml-8 mt-1 space-y-1">
                      {node.children.map(child => (
                        <div key={child.id}>
                          <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                            <span>{child.children && child.children.length > 0 ? '📁' : getIconForTipo(child.tipo)}</span>
                            <span className="font-medium">{child.nome}</span>
                            {child.children && <span className="text-gray-500">({child.children.length})</span>}
                          </div>

                          {child.children && child.children.length > 0 && (
                            <div className="ml-8 mt-1 space-y-1">
                              {child.children.map(grandchild => (
                                <div key={grandchild.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm">
                                  <span>{getIconForTipo(grandchild.tipo)}</span>
                                  <span>{grandchild.nome}</span>
                                  {grandchild.linhas && <span className="text-gray-500">• {grandchild.linhas} linhas</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ordem de Criação Recomendada</h3>
            <ol className="space-y-2">
              {estrutura.ordem_criacao.map((nome, idx) => (
                <li key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-sm">{nome}</span>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>

        {/* Dependências (Mermaid) */}
        {codigoMermaid && (
          <TabsContent value="dependencias" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Grafo de Dependências</h3>
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono">
                  {codigoMermaid}
                </pre>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                💡 Copie o código Mermaid acima e cole em{' '}
                <a
                  href="https://mermaid.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  mermaid.live
                </a>
                {' '}para visualizar o diagrama.
              </p>
            </Card>
          </TabsContent>
        )}

        {/* Documentação */}
        {codigo.documentacao && (
          <TabsContent value="documentacao" className="space-y-6">
            {codigo.documentacao.descricao_geral && (
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Descrição Geral</h4>
                <p className="text-gray-700 leading-relaxed">
                  {codigo.documentacao.descricao_geral}
                </p>
              </Card>
            )}

            {codigo.documentacao.como_usar && (
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Como Usar</h4>
                <p className="text-gray-700 leading-relaxed">
                  {codigo.documentacao.como_usar}
                </p>
              </Card>
            )}

            {codigo.documentacao.parametros && codigo.documentacao.parametros.length > 0 && (
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Parâmetros</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {codigo.documentacao.parametros.map((param: string, i: number) => (
                    <li key={i}>{param}</li>
                  ))}
                </ul>
              </Card>
            )}

            {codigo.documentacao.consideracoes && codigo.documentacao.consideracoes.length > 0 && (
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Considerações</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {codigo.documentacao.consideracoes.map((cons: string, i: number) => (
                    <li key={i}>{cons}</li>
                  ))}
                </ul>
              </Card>
            )}

            {codigo.documentacao.exemplos && codigo.documentacao.exemplos.length > 0 && (
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Exemplos de Uso</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {codigo.documentacao.exemplos.map((ex: string, i: number) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </Card>
            )}

            {codigo.dependencias && (
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Dependências</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {codigo.dependencias.tabelas && codigo.dependencias.tabelas.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-sm text-blue-900 mb-3">Tabelas</h5>
                      <div className="flex flex-wrap gap-2">
                        {codigo.dependencias.tabelas.map((t: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-white">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {codigo.dependencias.funcoes && codigo.dependencias.funcoes.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-sm text-green-900 mb-3">Funções</h5>
                      <div className="flex flex-wrap gap-2">
                        {codigo.dependencias.funcoes.map((f: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-white">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {codigo.dependencias.classes && codigo.dependencias.classes.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-sm text-purple-900 mb-3">Classes</h5>
                      <div className="flex flex-wrap gap-2">
                        {codigo.dependencias.classes.map((c: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-white">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {codigo.dependencias.includes && codigo.dependencias.includes.length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h5 className="font-medium text-sm text-amber-900 mb-3">Includes</h5>
                      <div className="flex flex-wrap gap-2">
                        {codigo.dependencias.includes.map((inc: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-white">
                            {inc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {codigo.testes_sugeridos && codigo.testes_sugeridos.length > 0 && (
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Testes Sugeridos</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {codigo.testes_sugeridos.map((teste: string, i: number) => (
                    <li key={i}>{teste}</li>
                  ))}
                </ol>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Ações Gerais */}
      <div className="flex gap-3">
        <Button
          onClick={handleDownloadTudo}
          variant="default"
          className="flex-1"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          Baixar Código Completo
        </Button>
        <Button
          onClick={handleDownloadInstrucoes}
          variant="outline"
          size="lg"
        >
          <FileText className="h-5 w-5 mr-2" />
          Baixar Instruções
        </Button>
      </div>
    </div>
  )
}
