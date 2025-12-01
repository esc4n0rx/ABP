import { EFFormData, EFRefinada } from '@/types/ef'
import { gerarPromptEF, validarResposta, extrairJSON } from '@/lib/prompts/efprompt'
import { createProviderManager } from '@/lib/providers/provider-manager'

export interface RefinamentoEFResponse {
  success: boolean
  data?: EFRefinada
  error?: string
  rawResponse?: string
}

/**
 * Refina uma Especificação Funcional usando IA
 * @param formData - Dados do formulário de criação de EF
 * @param userId - ID do usuário para usar o provider configurado
 * @returns Promise com o resultado do refinamento
 */
export async function refinarEspecificacaoFuncional(
  formData: EFFormData,
  userId: string
): Promise<RefinamentoEFResponse> {
  try {
    // Gera o prompt com os dados do formulário
    const prompt = gerarPromptEF(formData)

    console.log('🤖 Iniciando refinamento da EF com IA...')

    // Cria provider manager para o usuário
    const providerManager = await createProviderManager(userId)

    // Chama a IA usando o provider configurado
    const response = await providerManager.generateContent(
      [
        {
          role: 'system',
          content:
            'Você é um assistente especializado em SAP e criação de Especificações Funcionais. Você deve seguir rigorosamente as instruções de segurança e sempre retornar JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.3,
        maxTokens: 8000,
        topP: 0.9,
      }
    )

    // Extrai o conteúdo da resposta
    const rawResponse = response.content || ''

    console.log('📝 Resposta bruta recebida da IA')

    // Remove thinking blocks e extrai JSON
    const jsonLimpo = extrairJSON(rawResponse)

    console.log('🧹 Conteúdo limpo e JSON extraído')

    // Valida a resposta
    const validacao = validarResposta(jsonLimpo)

    if (!validacao.isValid) {
      console.error('❌ Erro na validação:', validacao.error)
      return {
        success: false,
        error: validacao.error,
        rawResponse,
      }
    }

    // Parse do JSON
    const efRefinada: EFRefinada = JSON.parse(jsonLimpo)

    console.log('✅ EF refinada com sucesso!')

    return {
      success: true,
      data: efRefinada,
      rawResponse,
    }
  } catch (error: any) {
    console.error('❌ Erro ao refinar EF:', error)

    // Tratamento de erros específicos
    if (error?.status === 401) {
      return {
        success: false,
        error: 'Erro de autenticação com a API Groq. Verifique sua API key.',
      }
    }

    if (error?.status === 429) {
      return {
        success: false,
        error: 'Limite de requisições excedido. Tente novamente em alguns instantes.',
      }
    }

    if (error?.message?.includes('JSON')) {
      return {
        success: false,
        error: 'Erro ao processar a resposta da IA. Tente novamente.',
      }
    }

    return {
      success: false,
      error: error?.message || 'Erro desconhecido ao processar a especificação.',
    }
  }
}

/**
 * Testa a conexão com o provider do usuário
 * @param userId - ID do usuário
 * @returns Promise com status da conexão
 */
export async function testarConexaoProvider(userId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const providerManager = await createProviderManager(userId)

    const response = await providerManager.generateContent([
      {
        role: 'user',
        content: 'Responda apenas: OK',
      },
    ])

    const resposta = response.content || ''

    return {
      success: true,
      message: `Conexão estabelecida com sucesso. Resposta: ${resposta}`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erro ao conectar com o provider',
    }
  }
}
