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
  MessageSquare
} from "lucide-react"
import { AIProvider, ProviderName, PROVIDER_INFO } from "@/types/providers"

export function ProvidersSettings() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderName | null>(null)

  // Form state
  const [apiKey, setApiKey] = useState("")
  const [modelName, setModelName] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProviders()
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

  if (loading) {
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
          <h3 className="text-2xl font-bold text-gray-900">Provedores de IA</h3>
          <p className="text-gray-600 mt-1">
            Configure os provedores de IA que deseja usar na plataforma
          </p>
        </div>
      </div>

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
  )
}
