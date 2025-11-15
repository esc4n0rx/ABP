import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'abap-generation.log')

// Garante que o diretório de logs existe
const ensureLogDir = () => {
  if (typeof window === 'undefined') {
    // Server-side only
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true })
    }
  }
}

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: any
}

export class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []

  private constructor() {
    ensureLogDir()
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLog(entry: LogEntry): string {
    const dataStr = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : ''
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${dataStr}\n`
  }

  private writeToFile(entry: LogEntry) {
    if (typeof window === 'undefined') {
      // Server-side only
      try {
        const logLine = this.formatLog(entry)
        fs.appendFileSync(LOG_FILE, logLine, 'utf-8')
      } catch (error) {
        console.error('Erro ao escrever log:', error)
      }
    }
  }

  private log(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    this.logs.push(entry)
    this.writeToFile(entry)

    // Console output
    const consoleData = data ? [message, data] : [message]
    switch (level) {
      case 'error':
        console.error(...consoleData)
        break
      case 'warn':
        console.warn(...consoleData)
        break
      case 'debug':
        console.debug(...consoleData)
        break
      default:
        console.log(...consoleData)
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  // Métodos específicos para geração ABAP
  logPromptEnviado(prompt: string) {
    this.debug('=== PROMPT ENVIADO PARA IA ===', {
      comprimento: prompt.length,
      preview: prompt.substring(0, 500) + '...',
      prompt_completo: prompt,
    })
  }

  logRespostaIA(resposta: string, tipo: 'inicial' | 'refinamento') {
    this.debug(`=== RESPOSTA IA (${tipo.toUpperCase()}) - BRUTA ===`, {
      comprimento: resposta.length,
      tem_thinking: resposta.includes('<thinking>'),
      tem_json: resposta.includes('{'),
      preview: resposta.substring(0, 500),
      resposta_completa: resposta,
    })
  }

  logRespostaLimpa(respostaLimpa: string) {
    this.debug('=== RESPOSTA LIMPA (SEM THINKING) ===', {
      comprimento: respostaLimpa.length,
      preview: respostaLimpa.substring(0, 500),
      resposta_completa: respostaLimpa,
    })
  }

  logJSONExtraido(json: string) {
    this.debug('=== JSON EXTRAÍDO ===', {
      comprimento: json.length,
      json_completo: json,
    })
  }

  logErroValidacao(erro: string, resposta: string) {
    this.error('=== ERRO DE VALIDAÇÃO ===', {
      erro,
      resposta_que_falhou: resposta,
      preview: resposta.substring(0, 500),
    })
  }

  logSucesso(tipo: 'perguntas' | 'codigo', dados: any) {
    this.info(`=== SUCESSO: ${tipo.toUpperCase()} ===`, dados)
  }

  // Limpa logs antigos (mantém apenas últimos N logs)
  clearOldLogs(keepLast: number = 100) {
    if (this.logs.length > keepLast) {
      this.logs = this.logs.slice(-keepLast)
    }
  }

  // Retorna todos os logs
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  // Limpa arquivo de log
  clearLogFile() {
    if (typeof window === 'undefined') {
      try {
        fs.writeFileSync(LOG_FILE, '', 'utf-8')
        this.info('Log file cleared')
      } catch (error) {
        console.error('Erro ao limpar log:', error)
      }
    }
  }
}

// Export singleton
export const logger = Logger.getInstance()

// Helper para formatar objetos grandes
export function formatLargeObject(obj: any, maxLength: number = 1000): string {
  const str = JSON.stringify(obj, null, 2)
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '\n... (truncated)'
  }
  return str
}
