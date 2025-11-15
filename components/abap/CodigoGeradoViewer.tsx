"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Copy, Download, Code2, FileCode, Book } from "lucide-react"
import toast from "react-hot-toast"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodigoGeradoViewerProps {
  codigo: any
}

export function CodigoGeradoViewer({ codigo }: CodigoGeradoViewerProps) {
  const [activeTab, setActiveTab] = useState("principal")

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
    let conteudoCompleto = `${"=".repeat(80)}\n`
    conteudoCompleto += `CÓDIGO PRINCIPAL\n`
    conteudoCompleto += `${"=".repeat(80)}\n\n`
    conteudoCompleto += codigo.codigo_principal + "\n\n"

    if (codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0) {
      codigo.codigos_adicionais.forEach((adicional: any) => {
        conteudoCompleto += `\n${"=".repeat(80)}\n`
        conteudoCompleto += `${adicional.tipo.toUpperCase()}: ${adicional.nome}\n`
        if (adicional.descricao) {
          conteudoCompleto += `Descrição: ${adicional.descricao}\n`
        }
        conteudoCompleto += `${"=".repeat(80)}\n\n`
        conteudoCompleto += adicional.codigo + "\n\n"
      })
    }

    const element = document.createElement("a")
    const file = new Blob([conteudoCompleto], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "codigo_abap_completo.abap"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Código completo baixado!")
  }

  return (
    <div className="space-y-6">
      {/* Header de Sucesso */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Código gerado com sucesso!
            </h3>
            <p className="text-sm text-green-700">
              Revise o código abaixo antes de salvar
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de Código */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="principal">
            <Code2 className="h-4 w-4 mr-2" />
            Código Principal
          </TabsTrigger>
          {codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0 && (
            <TabsTrigger value="adicionais">
              <FileCode className="h-4 w-4 mr-2" />
              Adicionais ({codigo.codigos_adicionais.length})
            </TabsTrigger>
          )}
          {codigo.documentacao && (
            <TabsTrigger value="documentacao">
              <Book className="h-4 w-4 mr-2" />
              Documentação
            </TabsTrigger>
          )}
        </TabsList>

        {/* Código Principal */}
        <TabsContent value="principal" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Código Principal</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyCodigo(codigo.codigo_principal)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadCodigo(codigo.codigo_principal, "principal")}
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
        </TabsContent>

        {/* Códigos Adicionais */}
        {codigo.codigos_adicionais && codigo.codigos_adicionais.length > 0 && (
          <TabsContent value="adicionais" className="space-y-6">
            {codigo.codigos_adicionais.map((adicional: any, index: number) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{adicional.nome}</h4>
                    <Badge variant="outline">{adicional.tipo}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCodigo(adicional.codigo, adicional.nome)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDownloadCodigo(adicional.codigo, adicional.nome)
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>

                {adicional.descricao && (
                  <p className="text-sm text-gray-600">{adicional.descricao}</p>
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
              </div>
            ))}
          </TabsContent>
        )}

        {/* Documentação */}
        {codigo.documentacao && (
          <TabsContent value="documentacao" className="space-y-6">
            {codigo.documentacao.descricao_geral && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Descrição Geral</h4>
                <p className="text-gray-700 leading-relaxed">
                  {codigo.documentacao.descricao_geral}
                </p>
              </div>
            )}

            {codigo.documentacao.como_usar && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Como Usar</h4>
                <p className="text-gray-700 leading-relaxed">
                  {codigo.documentacao.como_usar}
                </p>
              </div>
            )}

            {codigo.documentacao.parametros && codigo.documentacao.parametros.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Parâmetros</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {codigo.documentacao.parametros.map((param: string, i: number) => (
                    <li key={i}>{param}</li>
                  ))}
                </ul>
              </div>
            )}

            {codigo.documentacao.consideracoes &&
              codigo.documentacao.consideracoes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Considerações</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {codigo.documentacao.consideracoes.map((cons: string, i: number) => (
                      <li key={i}>{cons}</li>
                    ))}
                  </ul>
                </div>
              )}

            {codigo.documentacao.exemplos && codigo.documentacao.exemplos.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Exemplos de Uso</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {codigo.documentacao.exemplos.map((ex: string, i: number) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {codigo.dependencias && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Dependências</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {codigo.dependencias.tabelas &&
                    codigo.dependencias.tabelas.length > 0 && (
                      <Card className="p-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-2">Tabelas</h5>
                        <div className="flex flex-wrap gap-2">
                          {codigo.dependencias.tabelas.map((t: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    )}

                  {codigo.dependencias.funcoes && codigo.dependencias.funcoes.length > 0 && (
                    <Card className="p-4">
                      <h5 className="font-medium text-sm text-gray-700 mb-2">Funções</h5>
                      <div className="flex flex-wrap gap-2">
                        {codigo.dependencias.funcoes.map((f: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {codigo.dependencias.classes && codigo.dependencias.classes.length > 0 && (
                    <Card className="p-4">
                      <h5 className="font-medium text-sm text-gray-700 mb-2">Classes</h5>
                      <div className="flex flex-wrap gap-2">
                        {codigo.dependencias.classes.map((c: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {codigo.testes_sugeridos && codigo.testes_sugeridos.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Testes Sugeridos</h4>
                <ul className="list-decimal list-inside space-y-1 text-gray-700">
                  {codigo.testes_sugeridos.map((teste: string, i: number) => (
                    <li key={i}>{teste}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Botão para baixar tudo */}
      <Button
        onClick={handleDownloadTudo}
        variant="outline"
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Baixar Código Completo (.abap)
      </Button>
    </div>
  )
}
