import Groq from 'groq-sdk'
import { EFFormData, EFRefinada } from '@/types/ef'
import { gerarPromptEF, validarResposta, extrairJSON } from '@/lib/prompts/efprompt'

// Inicializa o cliente Groq
// A API key deve estar em GROQ_API_KEY no .env.local
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
})

export interface RefinamentoEFResponse {
  success: boolean
  data?: EFRefinada
  error?: string
  rawResponse?: string
}

/**
 * Refina uma Especificação Funcional usando IA Groq
 * @param formData - Dados do formulário de criação de EF
 * @returns Promise com o resultado do refinamento
 */
export async function refinarEspecificacaoFuncional(
  formData: EFFormData
): Promise<RefinamentoEFResponse> {
  try {
    // Gera o prompt com os dados do formulário
    const prompt = gerarPromptEF(formData)

    console.log('🤖 Iniciando refinamento da EF com IA...')

    // Chama a API Groq para refinar o conteúdo
    const chatCompletion = await groq.chat.completions.create({
      messages: [
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
      model: 'llama-3.3-70b-versatile', // Modelo mais adequado para tarefas estruturadas
      temperature: 0.3, // Temperatura baixa para mais consistência
      max_completion_tokens: 8000, // Aumento do limite para documentos grandes
      top_p: 0.9,
      stream: false, // Desabilitado para obter resposta completa
    })

    // Extrai o conteúdo da resposta
    const rawResponse = chatCompletion.choices[0]?.message?.content || ''

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
 * Testa a conexão com a API Groq
 * @returns Promise com status da conexão
 */
export async function testarConexaoGroq(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Responda apenas: OK',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      max_completion_tokens: 10,
    })

    const resposta = completion.choices[0]?.message?.content || ''

    return {
      success: true,
      message: `Conexão estabelecida com sucesso. Resposta: ${resposta}`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erro ao conectar com Groq',
    }
  }
}
