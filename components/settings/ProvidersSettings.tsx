"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import toast from "react-hot-toast"
import {
  Loader2,
  Plus,
  Trash2,
  Check,
  Star,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Brain,
  Sparkles,
  MessageSquare,
  Code2,
  Settings
} from "lucide-react"
import { AIProvider, ProviderName, PROVIDER_INFO } from "@/types/providers"
import { AbapGenerationConfig } from "@/app/api/abap/config/route"

type SectionType = 'providers' | 'abap_config'

export function ProvidersSettings() {
  // Seção ativa
  const [activeSection, setActiveSection] = useState<SectionType>('providers')

  // Estados de Providers
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderName | null>(null)

  // Estados de Configuração ABAP
  const [abapConfig, setAbapConfig] = useState<AbapGenerationConfig | null>(null)
  const [loadingAbapConfig, setLoadingAbapConfig] = useState(true)
  const [savingAbapConfig, setSavingAbapConfig] = useState(false)

  // Form state
  const [apiKey, setApiKey] = useState("")
  const [modelName, setModelName] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProviders()
    loadAbapConfig()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/providers")
      const data = await response.json()

      if (data.success) {
        setProviders(data.data || [])
      } else {
        toast.error("Erro ao carregar providers")
      }
    } catch (error) {
      console.error("Erro ao carregar providers:", error)
      toast.error("Erro ao carregar providers")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProvider = (providerName: ProviderName) => {
    setSelectedProvider(providerName)
    setApiKey("")
    setModelName(PROVIDER_INFO[providerName].models[0].id)
    setShowAddModal(true)
  }

  const handleTestConnection = async () => {
    if (!selectedProvider) return

    const providerInfo = PROVIDER_INFO[selectedProvider]

    if (providerInfo.requiresApiKey && !apiKey) {
      toast.error("API Key é obrigatória")
      return
    }

    try {
      setTesting(true)
      const response = await fetch("/api/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_name: selectedProvider,
          api_key: apiKey || undefined,
          model_name: modelName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Conexão testada com sucesso!")
      } else {
        toast.error(data.message || "Erro ao testar conexão")
      }
    } catch (error: any) {
      console.error("Erro ao testar:", error)
      toast.error(error?.message || "Erro ao testar conexão")
    } finally {
      setTesting(false)
    }
  }

  const handleSaveProvider = async () => {
    if (!selectedProvider) return

    const providerInfo = PROVIDER_INFO[selectedProvider]

    if (providerInfo.requiresApiKey && !apiKey) {
      toast.error("API Key é obrigatória")
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_name: selectedProvider,
          api_key: apiKey || "free",
          model_name: modelName,
          is_default: providers.length === 0, // Primeiro provider é padrão
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Provider adicionado com sucesso!")
        setShowAddModal(false)
        loadProviders()
      } else {
        toast.error(data.error || "Erro ao adicionar provider")
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error)
      toast.error(error?.message || "Erro ao salvar provider")
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (providerId: string) => {
    try {
      const response = await fetch(`/api/providers?id=${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Provider padrão atualizado!")
        loadProviders()
      } else {
        toast.error("Erro ao atualizar provider")
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error)
      toast.error("Erro ao atualizar provider")
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm("Tem certeza que deseja remover este provider?")) return

    try {
      const response = await fetch(`/api/providers?id=${providerId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Provider removido!")
        loadProviders()
      } else {
        toast.error("Erro ao remover provider")
      }
    } catch (error) {
      console.error("Erro ao deletar:", error)
      toast.error("Erro ao remover provider")
    }
  }

  const getProviderIcon = (providerName: ProviderName) => {
    switch (providerName) {
      case 'groq':
        return <Zap className="text-purple-500" size={24} />
      case 'gemini':
        return <Sparkles className="text-blue-500" size={24} />
      case 'openai':
        return <MessageSquare className="text-green-500" size={24} />
      case 'anthropic':
        return <Brain className="text-orange-500" size={24} />
    }
  }

  // ========== Funções de Configuração ABAP ==========

  const loadAbapConfig = async () => {
    try {
      setLoadingAbapConfig(true)
      const response = await fetch("/api/abap/config")
      const data = await response.json()

      if (data.success) {
        setAbapConfig(data.data || {
          estilo_codigo: 'oo',
          usar_clean_code: true,
          usar_performance_otimizada: true,
          usar_tratamento_erros: true,
          usar_documentacao_inline: true,
          nivel_complexidade: 'medio',
        })
      } else {
        toast.error("Erro ao carregar configurações ABAP")
      }
    } catch (error) {
      console.error("Erro ao carregar configurações ABAP:", error)
      toast.error("Erro ao carregar configurações ABAP")
    } finally {
      setLoadingAbapConfig(false)
    }
  }

  const handleSaveAbapConfig = async () => {
    if (!abapConfig) return

    try {
      setSavingAbapConfig(true)
      const response = await fetch("/api/abap/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(abapConfig),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Configurações ABAP salvas com sucesso!")
        setAbapConfig(data.data)
      } else {
        toast.error(data.error || "Erro ao salvar configurações")
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error)
      toast.error(error?.message || "Erro ao salvar configurações")
    } finally {
      setSavingAbapConfig(false)
    }
  }

  const handleResetAbapConfig = async () => {
    if (!confirm("Deseja resetar as configurações para o padrão?")) return

    try {
      setSavingAbapConfig(true)
      const response = await fetch("/api/abap/config", {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Configurações resetadas!")
        loadAbapConfig()
      } else {
        toast.error("Erro ao resetar configurações")
      }
    } catch (error) {
      console.error("Erro ao resetar:", error)
      toast.error("Erro ao resetar configurações")
    } finally {
      setSavingAbapConfig(false)
    }
  }

  if (loading && loadingAbapConfig) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-geo-primary" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Configurações</h3>
          <p className="text-gray-600 mt-1">
            Configure os provedores de IA e parâmetros de geração de código
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('providers')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSection === 'providers'
              ? 'border-geo-primary text-geo-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain size={18} />
            Provedores de IA
          </div>
        </button>
        <button
          onClick={() => setActiveSection('abap_config')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSection === 'abap_config'
              ? 'border-geo-primary text-geo-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Code2 size={18} />
            Geração de Código ABAP
          </div>
        </button>
      </div>

      {/* Providers Section */}
      {activeSection === 'providers' && (
        <div className="space-y-6">

      {/* Lista de Providers Disponíveis */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Adicionar Novo Provider
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(PROVIDER_INFO) as ProviderName[]).map((providerName) => {
            const info = PROVIDER_INFO[providerName]
            const alreadyConfigured = providers.some(
              (p) => p.provider_name === providerName
            )

            return (
              <Card
                key={providerName}
                className={`p-4 cursor-pointer transition-all ${
                  alreadyConfigured
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg hover:border-geo-primary"
                }`}
                onClick={() => !alreadyConfigured && handleAddProvider(providerName)}
              >
                <div className="flex items-start gap-3">
                  {getProviderIcon(providerName)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold text-gray-900">{info.displayName}</h5>
                      {!info.requiresApiKey && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          FREE
                        </span>
                      )}
                      {alreadyConfigured && (
                        <Check className="text-green-500" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {info.models.length} modelos disponíveis
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Providers Configurados */}
      {providers.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Providers Configurados
          </h4>
          <div className="space-y-3">
            {providers.map((provider) => {
              const info = PROVIDER_INFO[provider.provider_name]
              return (
                <Card key={provider.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getProviderIcon(provider.provider_name)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900">
                            {info.displayName}
                          </h5>
                          {provider.is_default && (
                            <Star className="text-yellow-500 fill-yellow-500" size={16} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Modelo: {provider.model_name || "Padrão"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!provider.is_default && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(provider.id)}
                        >
                          <Star size={14} className="mr-1" />
                          Definir como Padrão
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de Adicionar Provider */}
      {showAddModal && selectedProvider && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowAddModal(false)}
        >
          <Card
            className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Configurar {PROVIDER_INFO[selectedProvider].displayName}
            </h3>

            <div className="space-y-4">
              {/* API Key */}
              {PROVIDER_INFO[selectedProvider].requiresApiKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key *
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent pr-10"
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <a
                    href={PROVIDER_INFO[selectedProvider].documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Como obter minha API Key?
                  </a>
                </div>
              )}

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent"
                >
                  {PROVIDER_INFO[selectedProvider].models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info do Modelo Selecionado */}
              {modelName && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                    <div className="text-sm text-blue-800">
                      {
                        PROVIDER_INFO[selectedProvider].models.find(
                          (m) => m.id === modelName
                        )?.description
                      }
                    </div>
                  </div>
                </Card>
              )}

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleTestConnection}
                  disabled={testing || saving}
                  variant="outline"
                  className="flex-1"
                >
                  {testing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Testando...
                    </>
                  ) : (
                    "Testar Conexão"
                  )}
                </Button>
                <Button
                  onClick={handleSaveProvider}
                  disabled={testing || saving}
                  className="flex-1 bg-geo-primary hover:bg-geo-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Provider"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sem Providers */}
      {providers.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Brain className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum Provider Configurado
          </h4>
          <p className="text-gray-600 mb-4">
            Configure pelo menos um provedor de IA para começar a usar a plataforma.
            <br />
            Recomendamos começar com o Groq (gratuito).
          </p>
        </Card>
      )}
        </div>
      )}

      {/* ABAP Configuration Section */}
      {activeSection === 'abap_config' && (
        <div className="space-y-6">
          {loadingAbapConfig ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-geo-primary" size={48} />
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Parâmetros de Geração de Código ABAP
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  Configure como o código ABAP será gerado pela IA. Escolha entre código orientado a objetos (moderno) ou ABAP puro/procedural (compatível com sistemas legados).
                </p>

                <Card className="p-6 space-y-6">
                  {/* Estilo de Código */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Estilo de Código *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          abapConfig?.estilo_codigo === 'oo'
                            ? 'border-geo-primary bg-geo-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setAbapConfig({ ...abapConfig!, estilo_codigo: 'oo' })}
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className={abapConfig?.estilo_codigo === 'oo' ? 'text-geo-primary' : 'text-gray-400'} size={24} />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              ABAP Orientado a Objetos (OO)
                            </h5>
                            <p className="text-sm text-gray-600">
                              Código moderno usando classes, métodos, interfaces. Ideal para sistemas SAP atualizados.
                            </p>
                            <ul className="text-xs text-gray-500 mt-2 space-y-1">
                              <li>✓ CL_SALV_TABLE para ALV</li>
                              <li>✓ Classes e métodos</li>
                              <li>✓ Tratamento de exceções moderno</li>
                            </ul>
                          </div>
                        </div>
                      </Card>

                      <Card
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          abapConfig?.estilo_codigo === 'puro'
                            ? 'border-geo-primary bg-geo-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setAbapConfig({ ...abapConfig!, estilo_codigo: 'puro' })}
                      >
                        <div className="flex items-start gap-3">
                          <Code2 className={abapConfig?.estilo_codigo === 'puro' ? 'text-geo-primary' : 'text-gray-400'} size={24} />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              ABAP Puro (Procedural)
                            </h5>
                            <p className="text-sm text-gray-600">
                              Código clássico usando FORMS e FUNCTIONs. Compatível com sistemas SAP legados.
                            </p>
                            <ul className="text-xs text-gray-500 mt-2 space-y-1">
                              <li>✓ REUSE_ALV para relatórios</li>
                              <li>✓ FORMS e subroutines</li>
                              <li>✓ Máxima compatibilidade</li>
                            </ul>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Opções Adicionais */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Opções de Geração</h5>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={abapConfig?.usar_clean_code ?? true}
                        onChange={(e) => setAbapConfig({ ...abapConfig!, usar_clean_code: e.target.checked })}
                        className="w-4 h-4 text-geo-primary rounded focus:ring-geo-primary"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Aplicar Clean Code</span>
                        <p className="text-xs text-gray-500">Nomes significativos, funções pequenas, código auto-explicativo</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={abapConfig?.usar_performance_otimizada ?? true}
                        onChange={(e) => setAbapConfig({ ...abapConfig!, usar_performance_otimizada: e.target.checked })}
                        className="w-4 h-4 text-geo-primary rounded focus:ring-geo-primary"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Otimizar Performance</span>
                        <p className="text-xs text-gray-500">SELECT otimizado, FOR ALL ENTRIES, uso eficiente de índices</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={abapConfig?.usar_tratamento_erros ?? true}
                        onChange={(e) => setAbapConfig({ ...abapConfig!, usar_tratamento_erros: e.target.checked })}
                        className="w-4 h-4 text-geo-primary rounded focus:ring-geo-primary"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Tratamento de Erros Completo</span>
                        <p className="text-xs text-gray-500">Validações, mensagens apropriadas, EXCEPTIONS</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={abapConfig?.usar_documentacao_inline ?? true}
                        onChange={(e) => setAbapConfig({ ...abapConfig!, usar_documentacao_inline: e.target.checked })}
                        className="w-4 h-4 text-geo-primary rounded focus:ring-geo-primary"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Documentação Inline</span>
                        <p className="text-xs text-gray-500">Comentários explicativos quando necessário</p>
                      </div>
                    </label>
                  </div>

                  {/* Nível de Complexidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível de Complexidade
                    </label>
                    <select
                      value={abapConfig?.nivel_complexidade ?? 'medio'}
                      onChange={(e) => setAbapConfig({ ...abapConfig!, nivel_complexidade: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent"
                    >
                      <option value="simples">Simples - Código básico e direto</option>
                      <option value="medio">Médio - Balance entre simplicidade e recursos</option>
                      <option value="avancado">Avançado - Recursos completos e padrões avançados</option>
                    </select>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleSaveAbapConfig}
                      disabled={savingAbapConfig}
                      className="flex-1 bg-geo-primary hover:bg-geo-primary/90"
                    >
                      {savingAbapConfig ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Configurações'
                      )}
                    </Button>
                    <Button
                      onClick={handleResetAbapConfig}
                      disabled={savingAbapConfig}
                      variant="outline"
                    >
                      Resetar para Padrão
                    </Button>
                  </div>
                </Card>

                {/* Info Box */}
                <Card className="p-4 bg-blue-50 border-blue-200 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Dica:</p>
                      <p>
                        Use <strong>ABAP Puro</strong> se você trabalha com sistemas SAP ECC 6.0 ou anteriores, ou se precisa garantir máxima compatibilidade.
                        Use <strong>ABAP OO</strong> se você trabalha com S/4HANA ou sistemas SAP modernos.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
